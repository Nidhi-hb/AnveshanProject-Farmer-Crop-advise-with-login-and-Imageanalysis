"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Loader2, Lightbulb, Droplets, Bug, Sprout } from "lucide-react"
import { useChat } from "ai/react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface FarmerProfile {
  farmer_name: string
  farm_location: string
  farm_size_acres?: number
  primary_crops?: string[]
  farming_experience_years?: number
}

interface ChatInterfaceProps {
  farmerProfile: FarmerProfile | null
}

export function ChatInterface({ farmerProfile }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hello ${farmerProfile?.farmer_name || "there"}! I'm your AI farming assistant. I can help you with crop management, pest control, irrigation, soil health, and sustainable farming practices. What would you like to know about your farm in ${farmerProfile?.farm_location || "your area"}?`,
      },
    ],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickQuestions = [
    {
      icon: <Droplets className="h-4 w-4" />,
      text: "When should I water my tomatoes?",
      category: "Irrigation",
    },
    {
      icon: <Bug className="h-4 w-4" />,
      text: "How do I identify pest damage on corn?",
      category: "Pest Control",
    },
    {
      icon: <Sprout className="h-4 w-4" />,
      text: "Best fertilizer for wheat growth?",
      category: "Nutrition",
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      text: "Sustainable farming practices for small farms",
      category: "Sustainability",
    },
  ]

  const handleQuickQuestion = (question: string) => {
    handleInputChange({ target: { value: question } } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Popular Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left justify-start border-green-200 hover:bg-green-50 bg-transparent"
                onClick={() => handleQuickQuestion(question.text)}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">{question.icon}</div>
                  <div>
                    <Badge variant="secondary" className="mb-1 text-xs">
                      {question.category}
                    </Badge>
                    <p className="text-sm text-gray-700">{question.text}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user" ? "bg-green-600" : "bg-blue-600"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <Card
                className={`${
                  message.role === "user" ? "bg-green-600 text-white border-green-600" : "bg-white border-green-200"
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <Card className="bg-white border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <p className="text-sm text-gray-600">AI is thinking...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about crops, pests, irrigation, soil health..."
          className="flex-1 border-green-200 focus:border-green-500"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()} className="bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
