import { generateObject } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const analysisSchema = z.object({
  cropType: z.string().describe("The type of crop identified in the image"),
  healthStatus: z
    .enum(["healthy", "diseased", "pest_damage", "nutrient_deficiency"])
    .describe("Overall health status of the crop"),
  confidence: z.number().min(0).max(100).describe("Confidence level of the analysis (0-100)"),
  issues: z
    .array(
      z.object({
        type: z.string().describe("Type of issue (e.g., 'Leaf Spot Disease', 'Aphid Infestation')"),
        severity: z.enum(["low", "medium", "high"]).describe("Severity level of the issue"),
        description: z.string().describe("Detailed description of the issue"),
        recommendations: z.array(z.string()).describe("Specific recommendations to address this issue"),
      }),
    )
    .describe("List of issues detected in the crop"),
  generalRecommendations: z
    .array(z.string())
    .describe("General care recommendations for the crop regardless of specific issues"),
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const image = formData.get("image") as File
    const farmerContextStr = formData.get("farmerContext") as string

    if (!image) {
      return new Response("No image provided", { status: 400 })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const mimeType = image.type

    // Get user context
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let farmerContext = ""
    if (farmerContextStr) {
      try {
        const profile = JSON.parse(farmerContextStr)
        farmerContext = `
Farmer Profile:
- Name: ${profile.farmer_name}
- Location: ${profile.farm_location}
- Farm Size: ${profile.farm_size_acres || "Not specified"} acres
- Primary Crops: ${profile.primary_crops?.join(", ") || "Not specified"}
- Experience: ${profile.farming_experience_years || "Not specified"} years
`
      } catch (e) {
        console.error("Error parsing farmer context:", e)
      }
    }

    const systemPrompt = `You are an expert agricultural pathologist and entomologist specializing in crop disease and pest identification through image analysis. Analyze the provided crop image and provide detailed, actionable insights.

${farmerContext}

Guidelines for analysis:
- Carefully examine the image for signs of diseases, pests, nutrient deficiencies, or other issues
- Consider the farmer's location and typical crops when making assessments
- Provide specific, practical recommendations that farmers can implement
- Be conservative with confidence levels - only use high confidence when very certain
- Focus on the most likely issues based on visual evidence
- Include preventive measures in recommendations
- Consider seasonal and regional factors in your analysis

Common issues to look for:
- Fungal diseases (leaf spots, blights, mildews)
- Bacterial infections (wilts, rots, cankers)
- Viral diseases (mosaics, yellowing, stunting)
- Insect damage (chewing, sucking, boring)
- Nutrient deficiencies (chlorosis, necrosis, stunting)
- Environmental stress (drought, heat, cold damage)
- Mechanical damage or herbicide injury

Provide confidence levels based on:
- 90-100%: Very clear, distinctive symptoms
- 70-89%: Likely identification with good visual evidence
- 50-69%: Possible identification requiring further investigation
- Below 50%: Uncertain, recommend professional diagnosis`

    const result = await generateObject({
      model: groq("llama-3.2-90b-vision-preview"),
      system: systemPrompt,
      prompt:
        "Analyze this crop image for diseases, pests, and overall health. Provide detailed identification and recommendations.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
      schema: analysisSchema,
      maxTokens: 2000,
    })

    // Store analysis in database for future reference
    if (user) {
      try {
        await supabase.from("image_analyses").insert({
          user_id: user.id,
          crop_type: result.object.cropType,
          health_status: result.object.healthStatus,
          confidence: result.object.confidence,
          issues: result.object.issues,
          recommendations: result.object.generalRecommendations,
        })
      } catch (dbError) {
        console.error("Error storing analysis:", dbError)
        // Continue even if DB storage fails
      }
    }

    return Response.json(result.object)
  } catch (error) {
    console.error("Image analysis error:", error)
    return new Response("Analysis failed", { status: 500 })
  }
}
