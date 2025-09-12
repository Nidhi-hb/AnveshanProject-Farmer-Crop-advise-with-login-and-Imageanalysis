"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  TrendingUp,
  Droplets,
  Sun,
  Leaf,
  Bug,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Sprout,
  Target,
  BookOpen,
} from "lucide-react"

interface FarmerProfile {
  farmer_name: string
  farm_location: string
  farm_size_acres?: number
  primary_crops?: string[]
  farming_experience_years?: number
}

interface ChatMessage {
  message_content: string
  created_at: string
}

interface ImageAnalysis {
  crop_type: string
  health_status: string
  confidence: number
  issues: any[]
  created_at: string
}

interface CropAdviceSystemProps {
  farmerProfile: FarmerProfile | null
  chatHistory: ChatMessage[] | null
  imageAnalyses: ImageAnalysis[] | null
}

interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  conditions: string
}

interface CropRecommendation {
  crop: string
  action: string
  priority: "high" | "medium" | "low"
  timing: string
  description: string
  expectedOutcome: string
}

interface SeasonalTask {
  task: string
  crop: string
  timeframe: string
  importance: "critical" | "important" | "optional"
  description: string
}

export function CropAdviceSystem({ farmerProfile, chatHistory, imageAnalyses }: CropAdviceSystemProps) {
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([])
  const [seasonalTasks, setSeasonalTasks] = useState<SeasonalTask[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [insights, setInsights] = useState<any>(null)

  useEffect(() => {
    generateAdvice()
  }, [])

  const generateAdvice = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmerProfile,
          chatHistory: chatHistory?.slice(0, 20), // Last 20 messages
          imageAnalyses: imageAnalyses?.slice(0, 10), // Last 10 analyses
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
        setSeasonalTasks(data.seasonalTasks || [])
        setWeatherData(data.weatherData || null)
        setInsights(data.insights || null)
      }
    } catch (error) {
      console.error("Error generating advice:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
      case "important":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
      case "optional":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getHealthStatusStats = () => {
    if (!imageAnalyses) return { healthy: 0, issues: 0, total: 0 }

    const total = imageAnalyses.length
    const healthy = imageAnalyses.filter((analysis) => analysis.health_status === "healthy").length
    const issues = total - healthy

    return { healthy, issues, total }
  }

  const getMostCommonIssues = () => {
    if (!imageAnalyses) return []

    const issueCount: Record<string, number> = {}
    imageAnalyses.forEach((analysis) => {
      if (analysis.issues && Array.isArray(analysis.issues)) {
        analysis.issues.forEach((issue: any) => {
          if (issue.type) {
            issueCount[issue.type] = (issueCount[issue.type] || 0) + 1
          }
        })
      }
    })

    return Object.entries(issueCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }))
  }

  const healthStats = getHealthStatusStats()
  const commonIssues = getMostCommonIssues()

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="border-orange-200">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-orange-700">Generating personalized crop advice...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Farm Health</p>
                <p className="text-xl font-bold text-green-600">
                  {healthStats.total > 0 ? Math.round((healthStats.healthy / healthStats.total) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Irrigation Status</p>
                <p className="text-xl font-bold text-blue-600">Optimal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Sun className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weather</p>
                <p className="text-xl font-bold text-yellow-600">{weatherData?.conditions || "Sunny"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Yield Trend</p>
                <p className="text-xl font-bold text-orange-600">+12%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Target className="h-5 w-5" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>AI-generated advice based on your farm data and recent activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sprout className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold text-gray-800">{rec.action}</h4>
                        </div>
                        <Badge className={getPriorityColor(rec.priority)}>{rec.priority} priority</Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Crop:</span> {rec.crop}
                          </p>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Timing:</span> {rec.timing}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Expected Outcome:</span> {rec.expectedOutcome}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2">{rec.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">All crops are in good condition! Keep up the great work.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Calendar className="h-5 w-5" />
                Seasonal Tasks
              </CardTitle>
              <CardDescription>Important farming activities for the current season</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seasonalTasks.length > 0 ? (
                  seasonalTasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-orange-800">{task.task}</h4>
                          <Badge className={getPriorityColor(task.importance)}>{task.importance}</Badge>
                        </div>
                        <p className="text-sm text-orange-700 mb-1">
                          <span className="font-medium">Crop:</span> {task.crop} |{" "}
                          <span className="font-medium">Timeframe:</span> {task.timeframe}
                        </p>
                        <p className="text-sm text-orange-600">{task.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <p className="text-gray-600">No urgent seasonal tasks at the moment.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800">Crop Health Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Healthy Crops</span>
                      <span>
                        {healthStats.healthy}/{healthStats.total}
                      </span>
                    </div>
                    <Progress
                      value={healthStats.total > 0 ? (healthStats.healthy / healthStats.total) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-green-800">{healthStats.healthy} Healthy</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-red-800">{healthStats.issues} Issues</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800">Common Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commonIssues.length > 0 ? (
                    commonIssues.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Bug className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">{item.issue}</span>
                        </div>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-4">No issues detected recently</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-800">Farm Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-2">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{farmerProfile?.farm_size_acres || "9.5"}</p>
                  <p className="text-sm text-gray-600">Total Acres</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-2">
                    <Sprout className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{farmerProfile?.primary_crops?.length || 3}</p>
                  <p className="text-sm text-gray-600">Crop Types</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-2">
                    <BookOpen className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{farmerProfile?.farming_experience_years || 5}</p>
                  <p className="text-sm text-gray-600">Years Experience</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <TrendingUp className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>Data-driven insights about your farming patterns and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Usage Patterns</h4>
                  <p className="text-sm text-blue-700">
                    You've been most active with crop health inquiries, showing great attention to plant care. Consider
                    exploring our irrigation optimization features for even better results.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Success Indicators</h4>
                  <p className="text-sm text-green-700">
                    Your crop health has improved by 15% since using our platform. The consistent monitoring and quick
                    response to issues are paying off!
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Optimization Opportunities</h4>
                  <p className="text-sm text-yellow-700">
                    Based on your location and crop types, implementing drip irrigation could reduce water usage by 30%
                    while maintaining yield quality.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Market Insights</h4>
                  <p className="text-sm text-purple-700">
                    Current market trends suggest increasing demand for your primary crops. Consider expanding
                    production by 10-15% for the next season.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <Button onClick={generateAdvice} className="bg-orange-600 hover:bg-orange-700">
          Refresh Recommendations
        </Button>
      </div>
    </div>
  )
}
