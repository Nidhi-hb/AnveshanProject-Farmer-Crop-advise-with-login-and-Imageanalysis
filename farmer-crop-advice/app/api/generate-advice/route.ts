import { generateObject } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const adviceSchema = z.object({
  recommendations: z
    .array(
      z.object({
        crop: z.string(),
        action: z.string(),
        priority: z.enum(["high", "medium", "low"]),
        timing: z.string(),
        description: z.string(),
        expectedOutcome: z.string(),
      }),
    )
    .describe("Personalized crop recommendations"),
  seasonalTasks: z
    .array(
      z.object({
        task: z.string(),
        crop: z.string(),
        timeframe: z.string(),
        importance: z.enum(["critical", "important", "optional"]),
        description: z.string(),
      }),
    )
    .describe("Seasonal farming tasks"),
  weatherData: z
    .object({
      temperature: z.number(),
      humidity: z.number(),
      rainfall: z.number(),
      conditions: z.string(),
    })
    .describe("Current weather conditions"),
  insights: z
    .object({
      usagePatterns: z.string(),
      successIndicators: z.string(),
      optimizationOpportunities: z.string(),
      marketInsights: z.string(),
    })
    .describe("AI-generated insights about farming patterns"),
})

export async function POST(req: Request) {
  try {
    const { farmerProfile, chatHistory, imageAnalyses } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Analyze chat history for common topics
    const chatTopics = chatHistory
      ?.map((msg: any) => msg.message_content)
      .join(" ")
      .toLowerCase()

    // Analyze image analysis results for health trends
    const healthIssues = imageAnalyses
      ?.filter((analysis: any) => analysis.health_status !== "healthy")
      .map((analysis: any) => ({
        crop: analysis.crop_type,
        status: analysis.health_status,
        issues: analysis.issues,
      }))

    const currentMonth = new Date().toLocaleString("default", { month: "long" })
    const currentSeason = getCurrentSeason()

    let farmerContext = ""
    if (farmerProfile) {
      farmerContext = `
Farmer Profile:
- Name: ${farmerProfile.farmer_name}
- Location: ${farmerProfile.farm_location}
- Farm Size: ${farmerProfile.farm_size_acres || "Not specified"} acres
- Primary Crops: ${farmerProfile.primary_crops?.join(", ") || "Mixed crops"}
- Experience: ${farmerProfile.farming_experience_years || "Not specified"} years

Recent Activity Analysis:
- Chat Topics: ${chatTopics ? "Focused on " + extractMainTopics(chatTopics) : "Limited chat history"}
- Health Issues Detected: ${healthIssues?.length || 0} issues in recent scans
- Most Common Issues: ${getMostCommonIssues(healthIssues)}

Current Context:
- Month: ${currentMonth}
- Season: ${currentSeason}
- Location: ${farmerProfile.farm_location}
`
    }

    const systemPrompt = `You are an expert agricultural advisor creating personalized recommendations for farmers. Generate comprehensive advice based on the farmer's profile, recent activities, and current seasonal conditions.

${farmerContext}

Guidelines:
- Provide specific, actionable recommendations tailored to the farmer's crops and location
- Consider seasonal timing and local climate conditions
- Prioritize recommendations based on urgency and impact
- Include both immediate actions and longer-term planning
- Focus on sustainable and profitable farming practices
- Consider the farmer's experience level when suggesting techniques
- Base recommendations on recent chat topics and detected crop issues
- Include realistic expected outcomes and timelines

Generate:
1. Personalized crop recommendations (3-5 items) with specific actions, timing, and expected outcomes
2. Seasonal tasks (3-5 items) appropriate for the current season and location
3. Realistic weather data for the farmer's location
4. Insights about usage patterns, success indicators, optimization opportunities, and market trends

Make all advice practical, specific, and immediately actionable for the farmer.`

    const result = await generateObject({
      model: groq("llama-3.1-70b-versatile"),
      system: systemPrompt,
      prompt: `Generate comprehensive crop advice and analytics for this farmer based on their profile and recent activity patterns.`,
      schema: adviceSchema,
      maxTokens: 2000,
    })

    // Store generated advice for future reference
    try {
      await supabase.from("crop_advice_sessions").insert({
        user_id: user.id,
        recommendations: result.object.recommendations,
        seasonal_tasks: result.object.seasonalTasks,
        insights: result.object.insights,
      })
    } catch (dbError) {
      console.error("Error storing advice session:", dbError)
      // Continue even if DB storage fails
    }

    return Response.json(result.object)
  } catch (error) {
    console.error("Advice generation error:", error)
    return new Response("Failed to generate advice", { status: 500 })
  }
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return "Spring"
  if (month >= 5 && month <= 7) return "Summer"
  if (month >= 8 && month <= 10) return "Fall"
  return "Winter"
}

function extractMainTopics(chatContent: string): string {
  const topics = []
  if (chatContent.includes("water") || chatContent.includes("irrigation")) topics.push("irrigation")
  if (chatContent.includes("pest") || chatContent.includes("bug")) topics.push("pest control")
  if (chatContent.includes("disease") || chatContent.includes("sick")) topics.push("disease management")
  if (chatContent.includes("fertilizer") || chatContent.includes("nutrient")) topics.push("nutrition")
  if (chatContent.includes("harvest") || chatContent.includes("yield")) topics.push("harvesting")

  return topics.length > 0 ? topics.join(", ") : "general farming questions"
}

function getMostCommonIssues(healthIssues: any[]): string {
  if (!healthIssues || healthIssues.length === 0) return "No recent issues detected"

  const issueCount: Record<string, number> = {}
  healthIssues.forEach((issue) => {
    if (issue.issues && Array.isArray(issue.issues)) {
      issue.issues.forEach((i: any) => {
        if (i.type) {
          issueCount[i.type] = (issueCount[i.type] || 0) + 1
        }
      })
    }
  })

  const topIssues = Object.entries(issueCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([issue]) => issue)

  return topIssues.length > 0 ? topIssues.join(", ") : "Various minor issues"
}
