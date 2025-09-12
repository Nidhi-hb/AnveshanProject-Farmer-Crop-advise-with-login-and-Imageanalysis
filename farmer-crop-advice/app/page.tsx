import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Smartphone, MessageCircle, Camera, Mic, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-800">CropWise</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              asChild
              className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-green-800 mb-6 text-balance">
            AI-Powered Farming Assistant for Smarter Agriculture
          </h2>
          <p className="text-xl text-green-700 mb-8 text-pretty">
            Get personalized crop advice, increase your income, optimize resources, and embrace sustainable farming with
            our intelligent platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/auth/sign-up">Start Free Trial</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-green-800 mb-4">Everything You Need for Modern Farming</h3>
          <p className="text-green-700 max-w-2xl mx-auto">
            Our platform combines AI technology with agricultural expertise to provide comprehensive farming solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 p-3 rounded-lg w-fit">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">AI Chat Assistant</CardTitle>
              <CardDescription className="text-green-600">
                Ask questions and get instant, science-backed answers about your crops
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 p-3 rounded-lg w-fit">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Image Analysis</CardTitle>
              <CardDescription className="text-green-600">
                Upload photos of your crops for instant disease and pest identification
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 p-3 rounded-lg w-fit">
                <Mic className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Voice Interface</CardTitle>
              <CardDescription className="text-green-600">
                Speak in your local language and get voice responses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 p-3 rounded-lg w-fit">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Yield Optimization</CardTitle>
              <CardDescription className="text-green-600">
                Get personalized recommendations to maximize your crop yields
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 p-3 rounded-lg w-fit">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Mobile-First Design</CardTitle>
              <CardDescription className="text-green-600">
                Access all features seamlessly on your smartphone or tablet
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 p-3 rounded-lg w-fit">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Sustainable Practices</CardTitle>
              <CardDescription className="text-green-600">
                Learn eco-friendly farming methods that protect the environment
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Farming?</h3>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who are already using CropWise to increase their yields and adopt sustainable
            practices.
          </p>
          <Button size="lg" variant="secondary" asChild className="bg-white text-green-600 hover:bg-green-50">
            <Link href="/auth/sign-up">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-green-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-green-800">CropWise</span>
          </div>
          <p className="text-green-600 text-sm">© 2024 CropWise. Empowering farmers with AI technology.</p>
        </div>
      </footer>
    </div>
  )
}
