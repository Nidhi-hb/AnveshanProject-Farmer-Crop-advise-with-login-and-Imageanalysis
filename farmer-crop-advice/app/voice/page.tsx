import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { VoiceInterface } from "@/components/voice-interface"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mic } from "lucide-react"
import Link from "next/link"

export default async function VoicePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get farmer profile for context
  const { data: profile } = await supabase.from("farmer_profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-purple-700 hover:bg-purple-50">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-purple-800">Voice Assistant</h1>
                <p className="text-sm text-purple-600">Speak naturally and get voice responses</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <VoiceInterface farmerProfile={profile} />
      </div>
    </div>
  )
}
