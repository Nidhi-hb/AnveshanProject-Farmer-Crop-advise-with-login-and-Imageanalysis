import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Get user context from Supabase
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let farmerContext = ""
    if (user) {
      const { data: profile } = await supabase.from("farmer_profiles").select("*").eq("id", user.id).single()

      if (profile) {
        farmerContext = `
Farmer Profile:
- Name: ${profile.farmer_name}
- Location: ${profile.farm_location}
- Farm Size: ${profile.farm_size_acres || "Not specified"} acres
- Primary Crops: ${profile.primary_crops?.join(", ") || "Not specified"}
- Experience: ${profile.farming_experience_years || "Not specified"} years
`
      }
    }

    const systemPrompt = `You are an expert agricultural AI assistant specializing in crop management, sustainable farming practices, and agricultural science. You provide practical, science-based advice to farmers.

${farmerContext}

Guidelines:
- Provide specific, actionable advice based on agricultural best practices
- Consider the farmer's location, crops, and experience level when giving advice
- Focus on sustainable and environmentally friendly farming methods
- Include relevant timing, quantities, and methods in your recommendations
- Ask clarifying questions when needed to provide better advice
- Be encouraging and supportive while being scientifically accurate
- If discussing pesticides or chemicals, always mention safety precautions
- Consider local climate and seasonal factors in your advice

Areas of expertise:
- Crop diseases and pest management
- Soil health and fertilization
- Irrigation and water management
- Planting and harvesting timing
- Sustainable farming practices
- Crop rotation and companion planting
- Weather-related farming decisions
- Market timing and crop selection
- Organic farming methods
- Equipment and tool recommendations

Always provide practical, implementable advice that can help improve crop yields, reduce costs, and promote sustainable agriculture.`

    const result = await streamText({
      model: groq("llama-3.1-70b-versatile"),
      system: systemPrompt,
      messages,
      maxTokens: 1000,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
