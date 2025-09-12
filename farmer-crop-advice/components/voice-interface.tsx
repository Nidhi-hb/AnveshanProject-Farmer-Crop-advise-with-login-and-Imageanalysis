"use client"
import type { SpeechRecognition } from "webkit-speech-api"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Volume2, VolumeX, Pause, RotateCcw, Loader2, MessageCircle, Languages } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FarmerProfile {
  farmer_name: string
  farm_location: string
  farm_size_acres?: number
  primary_crops?: string[]
  farming_experience_years?: number
}

interface VoiceInterfaceProps {
  farmerProfile: FarmerProfile | null
}

interface VoiceMessage {
  id: string
  type: "user" | "assistant"
  text: string
  timestamp: Date
  audioUrl?: string
}

export function VoiceInterface({ farmerProfile }: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "pt-BR", name: "Portuguese" },
    { code: "hi-IN", name: "Hindi" },
    { code: "zh-CN", name: "Chinese" },
  ]

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && window.SpeechRecognition) {
      recognitionRef.current = new window.SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = selectedLanguage

      recognitionRef.current.onresult = (event) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setCurrentTranscript(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        if (currentTranscript.trim()) {
          handleVoiceInput(currentTranscript.trim())
        }
      }

      recognitionRef.current.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }
    }

    // Initialize speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    // Add welcome message
    setMessages([
      {
        id: "welcome",
        type: "assistant",
        text: `Hello ${farmerProfile?.farmer_name || "there"}! I'm your voice-enabled farming assistant. You can ask me questions about your crops, and I'll respond with both text and voice. Try asking about watering, pests, or crop care!`,
        timestamp: new Date(),
      },
    ])
  }, [])

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage
    }
  }, [selectedLanguage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const startListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition not supported in this browser")
      return
    }

    setError(null)
    setCurrentTranscript("")
    setIsListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleVoiceInput = async (transcript: string) => {
    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      type: "user",
      text: transcript,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentTranscript("")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/voice-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: transcript,
          language: selectedLanguage,
          farmerProfile,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        text: data.text,
        timestamp: new Date(),
        audioUrl: data.audioUrl,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Speak the response if voice is enabled
      if (voiceEnabled && data.text) {
        speakText(data.text)
      }
    } catch (err) {
      setError("Failed to process voice input. Please try again.")
      console.error("Voice processing error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const speakText = (text: string) => {
    if (!synthRef.current || !voiceEnabled) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = selectedLanguage
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const replayMessage = (message: VoiceMessage) => {
    if (message.type === "assistant") {
      speakText(message.text)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Controls */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Mic className="h-5 w-5" />
            Voice Controls
          </CardTitle>
          <CardDescription>Configure your voice interaction preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-purple-700 mb-2 block">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="border-purple-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        {lang.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-full ${
                  voiceEnabled
                    ? "border-purple-200 text-purple-700 hover:bg-purple-50"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                {voiceEnabled ? "Voice On" : "Voice Off"}
              </Button>
            </div>

            <div className="flex items-end">
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  variant="outline"
                  className="w-full border-red-200 text-red-700 bg-transparent"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Speaking
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Input */}
      <Card className="border-purple-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="relative">
              <Button
                size="lg"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full ${
                  isListening ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                ) : isListening ? (
                  <MicOff className="h-8 w-8 text-white" />
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
              </Button>
              {isListening && (
                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
              )}
            </div>

            <div>
              <p className="text-lg font-medium text-purple-800">
                {isListening ? "Listening..." : isProcessing ? "Processing..." : "Tap to speak"}
              </p>
              <p className="text-sm text-purple-600">
                {isListening
                  ? "Speak clearly about your farming questions"
                  : "Ask about crops, pests, irrigation, or farming advice"}
              </p>
            </div>

            {currentTranscript && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">You're saying:</span> {currentTranscript}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <MessageCircle className="h-5 w-5" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${message.type === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {message.type === "assistant" && voiceEnabled && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => replayMessage(message)}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-purple-600"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800">Voice Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">For Best Results:</h4>
              <ul className="space-y-1 text-purple-700">
                <li>• Speak clearly and at normal pace</li>
                <li>• Use a quiet environment</li>
                <li>• Allow microphone access</li>
                <li>• Wait for the response before speaking again</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Example Questions:</h4>
              <ul className="space-y-1 text-purple-700">
                <li>• "When should I water my tomatoes?"</li>
                <li>• "How do I treat aphids on my crops?"</li>
                <li>• "What fertilizer is best for corn?"</li>
                <li>• "Tell me about crop rotation"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
