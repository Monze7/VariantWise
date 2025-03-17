"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizontal, PlusCircle } from "lucide-react"
import { ConsultantSidebar } from "@/components/consultant-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function ConsultantPage() {
  const [message, setMessage] = useState("")
  const [activeChat, setActiveChat] = useState("default")
  const [chats, setChats] = useState([
    {
      id: "default",
      title: "New Conversation",
      messages: [
        {
          role: "system",
          content: "Hello! I'm your VariantWise AI consultant. How can I help you find the perfect car today?",
        },
      ],
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  // Get current chat messages
  const currentChat = chats.find((chat) => chat.id === activeChat) || chats[0]
  const chatHistory = currentChat.messages

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    // Add user message to chat
    const updatedChats = chats.map((chat) => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          messages: [...chat.messages, { role: "user", content: message }],
          // Update title if this is the first user message
          title: chat.messages.length <= 1 ? message.slice(0, 20) + "..." : chat.title,
        }
      }
      return chat
    })

    setChats(updatedChats)
    const userMessage = message
    setMessage("")
    setIsLoading(true)

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Add AI response
    const aiResponse = getAIResponse(userMessage)
    setChats(
      updatedChats.map((chat) => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, { role: "system", content: aiResponse }],
          }
        }
        return chat
      }),
    )

    setIsLoading(false)
  }

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`
    setChats([
      ...chats,
      {
        id: newChatId,
        title: "New Conversation",
        messages: [
          {
            role: "system",
            content: "Hello! I'm your VariantWise AI consultant. How can I help you find the perfect car today?",
          },
        ],
      },
    ])
    setActiveChat(newChatId)
  }

  const handleDeleteChat = (chatId) => {
    // Don't delete if it's the only chat
    if (chats.length <= 1) return

    const updatedChats = chats.filter((chat) => chat.id !== chatId)
    setChats(updatedChats)

    // If the active chat was deleted, set the first chat as active
    if (activeChat === chatId) {
      setActiveChat(updatedChats[0].id)
    }
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
    <div className="flex h-[calc(100vh-8rem)] relative">
      <SidebarProvider defaultOpen={false}>
        <div className="flex w-full h-full">
          <ConsultantSidebar
            chats={chats}
            activeChat={activeChat}
            onSelectChat={setActiveChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
          />

          <div className="flex-1 flex flex-col h-full relative">
            {/* Chat Header */}
            <div className="flex items-center p-4 border-b border-primary-400 bg-primary-500 z-10">
              <SidebarTrigger className="mr-4" />
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{currentChat.title}</h1>
              </div>
              <Button
                onClick={handleNewChat}
                variant="outline"
                className="border-primary-300 text-white hover:bg-primary-400 flex items-center gap-2"
              >
                <PlusCircle size={16} />
                <span>New Chat</span>
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-auto bg-primary-400 p-6">
              <div className="space-y-4 max-w-4xl mx-auto pb-4">
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
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-primary-400 bg-primary-500 z-10">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
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
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

