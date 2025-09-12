import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CropAdviceSystem } from "@/components/crop-advice-system"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3 } from "lucide-react"
import Link from "next/link"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get farmer profile and historical data
  const { data: profile } = await supabase.from("farmer_profiles").select("*").eq("id", user.id).single()

  // Get recent interactions for insights
  const { data: chatHistory } = await supabase
    .from("chat_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const { data: imageAnalyses } = await supabase
    .from("image_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-orange-700 hover:bg-orange-50">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-orange-800">Crop Advice & Analytics</h1>
                <p className="text-sm text-orange-600">Personalized insights and recommendations for your farm</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <CropAdviceSystem farmerProfile={profile} chatHistory={chatHistory} imageAnalyses={imageAnalyses} />
      </div>
    </div>
  )
}
