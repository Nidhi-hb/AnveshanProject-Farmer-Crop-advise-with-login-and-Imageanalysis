import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Leaf,
  MessageCircle,
  Camera,
  Mic,
  Droplets,
  Wind,
  Sun,
  Calendar,
  MapPin,
  User,
  Settings,
  Bell,
  BarChart3,
  LogOut,
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get farmer profile
  const { data: profile } = await supabase.from("farmer_profiles").select("*").eq("id", user.id).single()

  async function handleLogout() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-green-800">CropWise</h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-green-600">
                <MapPin className="h-4 w-4" />
                <span>{profile?.farm_location || "Location not set"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-50">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-50">
                <Settings className="h-4 w-4" />
              </Button>
              <form action={handleLogout}>
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-green-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-green-700 hidden sm:block">{profile?.farmer_name || "Farmer"}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2">Welcome back, {profile?.farmer_name || "Farmer"}!</h2>
          <p className="text-green-600">Here's what's happening on your farm today.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button asChild className="h-20 bg-green-600 hover:bg-green-700 flex-col gap-2 text-white" size="lg">
            <Link href="/chat">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">Ask AI</span>
            </Link>
          </Button>

          <Button asChild className="h-20 bg-blue-600 hover:bg-blue-700 flex-col gap-2 text-white" size="lg">
            <Link href="/image-analysis">
              <Camera className="h-6 w-6" />
              <span className="text-sm">Scan Crop</span>
            </Link>
          </Button>

          <Button asChild className="h-20 bg-purple-600 hover:bg-purple-700 flex-col gap-2 text-white" size="lg">
            <Link href="/voice">
              <Mic className="h-6 w-6" />
              <span className="text-sm">Voice Chat</span>
            </Link>
          </Button>

          <Button asChild className="h-20 bg-orange-600 hover:bg-orange-700 flex-col gap-2 text-white" size="lg">
            <Link href="/analytics">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Analytics</span>
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weather Card */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Sun className="h-5 w-5" />
                  Today's Weather
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="bg-yellow-100 p-3 rounded-lg mb-2 mx-auto w-fit">
                      <Sun className="h-6 w-6 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">28°C</p>
                    <p className="text-sm text-gray-600">Sunny</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-lg mb-2 mx-auto w-fit">
                      <Droplets className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">65%</p>
                    <p className="text-sm text-gray-600">Humidity</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-100 p-3 rounded-lg mb-2 mx-auto w-fit">
                      <Wind className="h-6 w-6 text-gray-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">12 km/h</p>
                    <p className="text-sm text-gray-600">Wind</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-lg mb-2 mx-auto w-fit">
                      <Droplets className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">20%</p>
                    <p className="text-sm text-gray-600">Rain Chance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crop Status */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Leaf className="h-5 w-5" />
                  Crop Status
                </CardTitle>
                <CardDescription>Current status of your crops</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-green-800">Tomatoes</h4>
                      <p className="text-sm text-green-600">Field A - 2.5 acres</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Healthy</Badge>
                      <p className="text-sm text-green-600 mt-1">85% Growth</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-yellow-800">Corn</h4>
                      <p className="text-sm text-yellow-600">Field B - 3.0 acres</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Needs Attention</Badge>
                      <p className="text-sm text-yellow-600 mt-1">60% Growth</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-blue-800">Wheat</h4>
                      <p className="text-sm text-blue-600">Field C - 4.0 acres</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Growing</Badge>
                      <p className="text-sm text-blue-600 mt-1">40% Growth</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-full">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Asked about tomato pest control</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Camera className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Scanned corn leaves for disease detection</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Mic className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Voice query about irrigation schedule</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Farm Overview */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Farm Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Total Area</span>
                    <span className="font-medium">{profile?.farm_size_acres || "9.5"} acres</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Active Crops</span>
                    <span className="font-medium">3 types</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">{profile?.farming_experience_years || "5"} years</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Season Progress</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">AI Insights</CardTitle>
                <CardDescription>Personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Optimal Watering</p>
                  <p className="text-xs text-green-600">
                    Your tomatoes need watering in 2 days based on weather forecast.
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Pest Alert</p>
                  <p className="text-xs text-yellow-600">Monitor corn for aphids. Consider preventive measures.</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Market Tip</p>
                  <p className="text-xs text-blue-600">Tomato prices expected to rise 15% next week.</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Queries</span>
                  <span className="font-bold text-green-600">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Image Scans</span>
                  <span className="font-bold text-blue-600">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Voice Queries</span>
                  <span className="font-bold text-purple-600">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Yield Increase</span>
                  <span className="font-bold text-orange-600">+12%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
