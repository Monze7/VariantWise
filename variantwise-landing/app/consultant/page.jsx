"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizontal, PlusCircle } from "lucide-react"
import { ConsultantSidebar } from "@/components/consultant-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import axios from "axios"

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

    try {
      // Call the API endpoint with the user's message
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-response`, {
        prompt: userMessage
      });
      
      // Parse and format the response
      const aiResponseText = response.data.responseText;
      let formattedResponse = aiResponseText;
      
      // Check if the response is JSON
      try {
        const jsonData = JSON.parse(aiResponseText);
        formattedResponse = formatJsonResponse(jsonData);
      } catch (error) {
        // If not valid JSON, use the text as is
        console.log("Response is not JSON format");
      }

      // Add AI response
      setChats(
        updatedChats.map((chat) => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: [...chat.messages, { role: "system", content: formattedResponse }],
            }
          }
          return chat
        }),
      )
    } catch (error) {
      console.error("Error getting response:", error);
      
      // Add error message to chat
      setChats(
        updatedChats.map((chat) => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: [...chat.messages, { 
                role: "system", 
                content: "Sorry, I couldn't process your request. Please try again later." 
              }],
            }
          }
          return chat
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Format JSON response to be readable in chat
  const formatJsonResponse = (data) => {
    if (!data) return "No results found";
    
    // Check if data is an array of car recommendations
    if (Array.isArray(data)) {
      return data.map((car, index) => {
        return `
**Car Recommendation ${index + 1}**
- **Model**: ${car.model || car.name || 'N/A'}
- **Make**: ${car.make || car.brand || 'N/A'}
${car.year ? `- **Year**: ${car.year}\n` : ''}
${car.price ? `- **Price**: ${car.price}\n` : ''}
${car.engine ? `- **Engine**: ${car.engine}\n` : ''}
${car.fuel_type ? `- **Fuel Type**: ${car.fuel_type}\n` : ''}
${car.transmission ? `- **Transmission**: ${car.transmission}\n` : ''}
${car.description ? `\n${car.description}\n` : ''}
        `.trim();
      }).join('\n\n');
    }
    
    // If it's a single car or has a different structure
    if (data.cars && Array.isArray(data.cars)) {
      return formatJsonResponse(data.cars);
    }
    
    // Fallback for other JSON structures
    return `
**Car Recommendation**
${Object.entries(data).map(([key, value]) => {
  // Format each key-value pair
  if (typeof value === 'object' && value !== null) {
    return `- **${key.replace(/_/g, ' ').toUpperCase()}**: ${JSON.stringify(value)}`;
  }
  return `- **${key.replace(/_/g, ' ').toUpperCase()}**: ${value}`;
}).join('\n')}
    `.trim();
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
                      {/* Render markdown content for system messages */}
                      {chat.role === "system" ? (
                        <div dangerouslySetInnerHTML={{ 
                          __html: formatMarkdown(chat.content)
                        }} />
                      ) : (
                        chat.content
                      )}
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

// Simple markdown formatter for bold text and newlines
function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}