import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ImageAnalysisInterface } from "@/components/image-analysis-interface"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera } from "lucide-react"
import Link from "next/link"

export default async function ImageAnalysisPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-blue-700 hover:bg-blue-50">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-800">Crop Image Analysis</h1>
                <p className="text-sm text-blue-600">Upload photos to identify diseases, pests, and crop health</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <ImageAnalysisInterface farmerProfile={profile} />
      </div>
    </div>
  )
}
