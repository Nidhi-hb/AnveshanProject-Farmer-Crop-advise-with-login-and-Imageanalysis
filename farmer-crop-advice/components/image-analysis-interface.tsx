"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Camera, ImageIcon, Loader2, CheckCircle, AlertTriangle, Info, Leaf, Bug, Droplets } from "lucide-react"
import Image from "next/image"

interface FarmerProfile {
  farmer_name: string
  farm_location: string
  farm_size_acres?: number
  primary_crops?: string[]
  farming_experience_years?: number
}

interface ImageAnalysisInterfaceProps {
  farmerProfile: FarmerProfile | null
}

interface AnalysisResult {
  cropType: string
  healthStatus: "healthy" | "diseased" | "pest_damage" | "nutrient_deficiency"
  confidence: number
  issues: Array<{
    type: string
    severity: "low" | "medium" | "high"
    description: string
    recommendations: string[]
  }>
  generalRecommendations: string[]
}

export function ImageAnalysisInterface({ farmerProfile }: ImageAnalysisInterfaceProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    setAnalysisResult(null)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        handleImageSelect(file)
      } else {
        setError("Please select a valid image file")
      }
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", selectedImage)
      if (farmerProfile) {
        formData.append("farmerContext", JSON.stringify(farmerProfile))
      }

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (err) {
      setError("Failed to analyze image. Please try again.")
      console.error("Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "diseased":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "pest_damage":
        return <Bug className="h-5 w-5 text-orange-600" />
      case "nutrient_deficiency":
        return <Droplets className="h-5 w-5 text-yellow-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Camera className="h-5 w-5" />
            Upload Crop Image
          </CardTitle>
          <CardDescription>
            Take a clear photo of your crop leaves, stems, or fruits for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!imagePreview ? (
              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-blue-800">Upload an image</p>
                    <p className="text-sm text-blue-600">Click to browse or drag and drop</p>
                  </div>
                  <Badge variant="secondary">JPG, PNG, WebP up to 10MB</Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-blue-200">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Crop image for analysis"
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                  <Button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-blue-600 hover:bg-blue-700">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Analyze Image
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="font-medium text-blue-800">Analyzing your crop image...</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-sm text-blue-600">
                Our AI is examining the image for diseases, pests, and health indicators
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Overall Health Status */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                {getHealthStatusIcon(analysisResult.healthStatus)}
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Detected Crop</p>
                  <p className="font-semibold text-lg">{analysisResult.cropType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Confidence Level</p>
                  <div className="flex items-center gap-2">
                    <Progress value={analysisResult.confidence} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{analysisResult.confidence}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues Detected */}
          {analysisResult.issues.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Issues Detected</CardTitle>
                <CardDescription>Problems identified in your crop image</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.issues.map((issue, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{issue.type}</h4>
                        <Badge className={getSeverityColor(issue.severity)}>{issue.severity} severity</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {issue.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* General Recommendations */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Leaf className="h-5 w-5" />
                General Recommendations
              </CardTitle>
              <CardDescription>Overall care suggestions for your crop</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.generalRecommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tips Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Photography Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">For Best Results:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Take photos in natural daylight</li>
                <li>• Focus on affected areas clearly</li>
                <li>• Include leaves, stems, or fruits</li>
                <li>• Avoid blurry or dark images</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">What We Can Detect:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Plant diseases and infections</li>
                <li>• Pest damage and infestations</li>
                <li>• Nutrient deficiencies</li>
                <li>• Overall plant health</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
