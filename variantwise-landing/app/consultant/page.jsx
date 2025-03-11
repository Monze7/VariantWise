"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SendHorizontal } from "lucide-react"

export default function ConsultantPage() {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    {
      role: "system",
      content: "Hello! I'm your VariantWise AI consultant. How can I help you find the perfect car today?",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    // Add user message to chat
    setChatHistory([...chatHistory, { role: "user", content: message }])
    const userMessage = message
    setMessage("")
    setIsLoading(true)

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Add AI response
    const aiResponse = getAIResponse(userMessage)
    setChatHistory((prev) => [...prev, { role: "system", content: aiResponse }])
    setIsLoading(false)
  }

  // Simple mock AI response function
  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase()

    if (message.includes("suv") || message.includes("family")) {
      return "Based on your interest in SUVs, I'd recommend looking at the Toyota RAV4, Honda CR-V, or Mazda CX-5. These models offer excellent reliability, good fuel economy, and spacious interiors perfect for families. Would you like more specific details about any of these models?"
    } else if (message.includes("electric") || message.includes("ev")) {
      return "For electric vehicles, the Tesla Model 3, Hyundai Ioniq 5, and Ford Mustang Mach-E are excellent options with different price points. They offer good range, modern features, and varying charging capabilities. What's your budget range for an electric vehicle?"
    } else if (message.includes("budget") || message.includes("cheap") || message.includes("affordable")) {
      return "For budget-friendly options with good value, consider the Hyundai Elantra, Kia Forte, or Toyota Corolla. These vehicles offer reliability, good fuel economy, and modern features at a lower price point. What other factors are important in your car search?"
    } else {
      return "I'd be happy to help you find the perfect car. Could you tell me more about what you're looking for? Consider factors like vehicle type (sedan, SUV, truck), your typical usage (commuting, family, adventure), and any specific features that are important to you."
    }
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <Card className="h-[calc(100vh-10rem)] border-primary-400 shadow-lg bg-primary-500">
        <CardHeader className="bg-gradient-to-r from-black to-primary-400 rounded-t-lg">
          <CardTitle className="text-white">AI Car Consultant</CardTitle>
          <CardDescription className="text-primary-200">
            Ask me anything about cars and get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto bg-primary-400 p-6">
          <div className="space-y-4">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    chat.role === "user" ? "bg-black text-white" : "bg-primary-300 text-black"
                  }`}
                >
                  {chat.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-primary-300">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-black animate-bounce"></div>
                    <div
                      className="h-2 w-2 rounded-full bg-black animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="h-2 w-2 rounded-full bg-black animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-primary-400 bg-primary-500">
          <form onSubmit={handleSubmit} className="w-full flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about car recommendations, features, or comparisons..."
              className="flex-grow transition-all duration-200 focus:ring-2 focus:ring-primary-300 border-primary-400 bg-primary-400 text-white placeholder:text-primary-200"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading}
              className="bg-black hover:bg-primary-400 text-white border border-primary-300"
            >
              <SendHorizontal size={18} />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

