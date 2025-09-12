import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { message, language, farmerProfile } = await req.json()

    // Get user context from Supabase
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let farmerContext = ""
    if (farmerProfile) {
      farmerContext = `
Farmer Profile:
- Name: ${farmerProfile.farmer_name}
- Location: ${farmerProfile.farm_location}
- Farm Size: ${farmerProfile.farm_size_acres || "Not specified"} acres
- Primary Crops: ${farmerProfile.primary_crops?.join(", ") || "Not specified"}
- Experience: ${farmerProfile.farming_experience_years || "Not specified"} years
`
    }

    const languageInstructions = getLanguageInstructions(language)

    const systemPrompt = `You are an expert agricultural AI assistant specializing in crop management, sustainable farming practices, and agricultural science. You provide practical, science-based advice to farmers through voice interaction.

${farmerContext}

${languageInstructions}

Guidelines for voice responses:
- Keep responses concise but informative (2-3 sentences for simple questions, up to 5 sentences for complex topics)
- Use conversational, friendly tone suitable for voice interaction
- Avoid complex formatting, bullet points, or lists in voice responses
- Speak naturally as if having a conversation
- Provide specific, actionable advice
- Consider the farmer's location, crops, and experience level
- Focus on sustainable and environmentally friendly farming methods
- If discussing chemicals or pesticides, always mention safety precautions
- Ask follow-up questions when clarification would help provide better advice

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

    const result = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      system: systemPrompt,
      prompt: message,
      maxTokens: 500,
      temperature: 0.7,
    })

    // Store voice interaction in database
    if (user) {
      try {
        await supabase.from("voice_interactions").insert({
          user_id: user.id,
          user_message: message,
          assistant_response: result.text,
          language: language,
        })
      } catch (dbError) {
        console.error("Error storing voice interaction:", dbError)
        // Continue even if DB storage fails
      }
    }

    return Response.json({
      text: result.text,
      language: language,
    })
  } catch (error) {
    console.error("Voice chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

function getLanguageInstructions(language: string): string {
  const languageMap: Record<string, string> = {
    "en-US": "Respond in clear, simple English suitable for farmers.",
    "es-ES": "Responde en español claro y simple, adecuado para agricultores.",
    "fr-FR": "Répondez en français clair et simple, adapté aux agriculteurs.",
    "pt-BR": "Responda em português claro e simples, adequado para agricultores.",
    "hi-IN": "हिंदी में स्पष्ट और सरल भाषा में उत्तर दें, जो किसानों के लिए उपयुक्त हो।",
    "zh-CN": "用清晰简单的中文回答，适合农民理解。",
  }

  return languageMap[language] || "Respond in the user's language using clear, simple terms suitable for farmers."
}
