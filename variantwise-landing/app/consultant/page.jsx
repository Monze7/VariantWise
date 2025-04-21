// pages/consultant.jsx
"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizontal, RefreshCw } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

// API endpoint
const API_URL = "http://ec2-43-204-141-55.ap-south-1.compute.amazonaws.com:5001/api/chat"

// Define the conversation flow options
const CONVERSATION_OPTIONS = {
  "fuel_type": ["Any", "Petrol", "Diesel", "Electric", "CNG"],
  "body_type": ["Any", "SUV", "Sedan", "Hatchback", "MUV", "Pickup", "Compact SUV", "Offroad SUV"],
  "transmission": ["Any", "Manual", "Automatic", "CVT", "DCT", "AMT"],
  "seating": ["2", "4", "5", "6", "7", "8", "9"],
  "features": ["Sunroof", "Apple CarPlay/Android Auto", "Automatic Climate Control", 
              "360 Camera", "Lane Assist", "Ventilated Seats", "Wireless Charging"],
  "performance": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
}

// Budget slider component
const BudgetSlider = ({ value, onChange, min, max, step, disabled, label }) => {
  const formatValue = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };
  
  // Calculate percentage for proper thumb positioning
  const thumbPercent = ((value - min) / (max - min)) * 100;
  
  // Define markers for the slider
  const markers = [
    { value: 100000, label: '1L' },
    { value: 500000, label: '5L' },
    { value: 1000000, label: '10L' },
    { value: 2000000, label: '20L' },
    { value: 3000000, label: '30L' },
    { value: 5000000, label: '50L' }
  ];
  
  return (
    <div className="w-full px-2 py-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="font-bold text-blue-400">{formatValue(value)}</span>
      </div>
      
      <div className="relative">
        <div 
          className="absolute h-2 bg-blue-600 rounded-l-lg" 
          style={{ width: `${thumbPercent}%`, top: '0px' }}
        ></div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        
        {/* Markers */}
        <div className="relative w-full h-6 mt-1">
          {markers.filter(marker => marker.value >= min && marker.value <= max).map((marker) => (
            <div 
              key={marker.value}
              className="absolute transform -translate-x-1/2 text-xs text-gray-400"
              style={{ 
                left: `${((marker.value - min) / (max - min)) * 100}%`,
                top: '0px'
              }}
            >
              <div className="h-2 w-1 bg-gray-600 mx-auto mb-1"></div>
              {marker.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ConsultantPage() {
  const router = useRouter()
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)
  
  const [loading, setLoading] = useState(true)
  const [chat, setChat] = useState([])
  const [currentStep, setCurrentStep] = useState("greeting")
  const [state, setState] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consultationComplete, setConsultationComplete] = useState(false)
  const [error, setError] = useState(null)
  const [userInput, setUserInput] = useState("")
  const [recommendations, setRecommendations] = useState([])
  const [processedMessages, setProcessedMessages] = useState(new Set())
  const [selectedFeatures, setSelectedFeatures] = useState([])
  
  // Budget state
  const [minBudget, setMinBudget] = useState(500000)
  const [maxBudget, setMaxBudget] = useState(2000000)
  const [showMinBudgetSlider, setShowMinBudgetSlider] = useState(false)
  const [showMaxBudgetSlider, setShowMaxBudgetSlider] = useState(false)
  const [inputDisabled, setInputDisabled] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, { withCredentials: true })
      .then((response) => {
        console.log("User loaded from /me:", response.data)
        setLoading(false)
      })
      .catch(() => {
        alert("Not logged in. Redirecting.")
        router.replace("/signin")
      })
  }, [router])

  useEffect(() => {
    // Load saved consultation state from localStorage
    const savedChat = localStorage.getItem('carConsultationChat')
    const savedState = localStorage.getItem('carConsultationState')
    const savedStep = localStorage.getItem('carConsultationStep')
    const savedComplete = localStorage.getItem('carConsultationComplete')
    const savedRecommendations = localStorage.getItem('carConsultationRecommendations')
    const savedProcessedMessages = localStorage.getItem('carConsultationProcessedMessages')
    const savedSelectedFeatures = localStorage.getItem('carConsultationSelectedFeatures')
    const savedMinBudget = localStorage.getItem('carConsultationMinBudget')
    const savedMaxBudget = localStorage.getItem('carConsultationMaxBudget')

    if (savedChat && savedState && savedStep) {
      try {
        setChat(JSON.parse(savedChat))
        setState(JSON.parse(savedState))
        setCurrentStep(savedStep)
        setConsultationComplete(savedComplete === "true")
        if (savedRecommendations) {
          setRecommendations(JSON.parse(savedRecommendations))
        }
        if (savedProcessedMessages) {
          setProcessedMessages(new Set(JSON.parse(savedProcessedMessages)))
        }
        if (savedSelectedFeatures) {
          setSelectedFeatures(JSON.parse(savedSelectedFeatures))
        }
        if (savedMinBudget) {
          setMinBudget(parseInt(savedMinBudget))
        }
        if (savedMaxBudget) {
          setMaxBudget(parseInt(savedMaxBudget))
        }
        
        // Show appropriate budget slider based on current step
        if (savedStep === "budget_min") {
          setShowMinBudgetSlider(true)
          setShowMaxBudgetSlider(false)
        } else if (savedStep === "budget_max") {
          setShowMinBudgetSlider(false)
          setShowMaxBudgetSlider(true)
        }
      } catch (e) {
        console.error("Error loading saved state:", e)
        resetConsultation(true)
      }
    } else {
      // Start new consultation
      startConsultation()
    }
  }, [])

  // Show appropriate budget slider based on current step
  useEffect(() => {
    if (currentStep === "budget_min") {
      setShowMinBudgetSlider(true)
      setShowMaxBudgetSlider(false)
      setInputDisabled(true)
    } else if (currentStep === "budget_max") {
      setShowMinBudgetSlider(false)
      setShowMaxBudgetSlider(true)
      setInputDisabled(true)
    } else {
      setShowMinBudgetSlider(false)
      setShowMaxBudgetSlider(false)
      setInputDisabled(false)
    }
  }, [currentStep])

  // Ensure max budget is always greater than min budget
  useEffect(() => {
    if (maxBudget <= minBudget) {
      setMaxBudget(minBudget + 100000)
    }
  }, [minBudget, maxBudget])

  useEffect(() => {
    // Save consultation state to localStorage
    if (chat.length > 0) {
      localStorage.setItem('carConsultationChat', JSON.stringify(chat))
      localStorage.setItem('carConsultationState', JSON.stringify(state))
      localStorage.setItem('carConsultationStep', currentStep)
      localStorage.setItem('carConsultationComplete', consultationComplete.toString())
      localStorage.setItem('carConsultationProcessedMessages', JSON.stringify([...processedMessages]))
      localStorage.setItem('carConsultationSelectedFeatures', JSON.stringify(selectedFeatures))
      localStorage.setItem('carConsultationMinBudget', minBudget.toString())
      localStorage.setItem('carConsultationMaxBudget', maxBudget.toString())
      if (recommendations.length > 0) {
        localStorage.setItem('carConsultationRecommendations', JSON.stringify(recommendations))
      }
    }
  }, [chat, state, currentStep, consultationComplete, recommendations, processedMessages, selectedFeatures, minBudget, maxBudget])

  useEffect(() => {
    // Auto-scroll to bottom of chat
    if (chatContainerRef.current) {
      const timer = setTimeout(() => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [chat])

  // Add a message to chat if it's not a duplicate
  const addMessageToChat = (content, role) => {
    // Create a unique identifier for this message
    const messageId = `${role}-${content}`
    
    // Check if this message has already been processed
    if (!processedMessages.has(messageId)) {
      setChat(prev => [...prev, { role, content }])
      setProcessedMessages(prev => new Set(prev).add(messageId))
      return true
    }
    return false
  }

  // Start the consultation by sending the first API request
  const startConsultation = async () => {
    setIsSubmitting(true)
    try {
      console.log("Starting consultation with greeting request")
      const response = await axios.post(API_URL, {
        message: "",
        current_step: "greeting",
        state: {}
      })
      
      console.log("Greeting response:", response.data)
      
      // Clear any existing chat and start fresh
      setChat([])
      setProcessedMessages(new Set())
      setSelectedFeatures([])
      setMinBudget(500000)
      setMaxBudget(2000000)
      
      // Add the bot's greeting to the chat
      addMessageToChat(response.data.response, "system")
      
      // Update state and current step
      setCurrentStep(response.data.next_step)
      setState(response.data.state || {})
    } catch (err) {
      console.error("Error starting consultation:", err)
      setError("Failed to start consultation. Please try again.")
    }
    setIsSubmitting(false)
  }

  // Handle min budget submission
  const handleMinBudgetSubmit = () => {
    handleSubmit(minBudget.toString())
  }

  // Handle max budget submission
  const handleMaxBudgetSubmit = () => {
    if (maxBudget <= minBudget) {
      setError("Maximum budget must be greater than minimum budget")
      return
    }
    handleSubmit(maxBudget.toString())
  }

  // Handle user input submission
  const handleSubmit = async (message) => {
    if (!message && currentStep !== "greeting") return
    
    // For multi-select features
    if (currentStep === "features" && selectedFeatures.length > 0) {
      message = selectedFeatures.join(", ");
    }
    
    // Add user message to chat
    addMessageToChat(message, "user")
    setUserInput("")
    setIsSubmitting(true)
    
    try {
      console.log("Sending request:", {
        message,
        current_step: currentStep,
        state
      })
      
      // Send request to API with the exact format required
      const response = await axios.post(API_URL, {
        message: message,
        current_step: currentStep,
        state: state
      })
      
      console.log("API response:", response.data)
      
      // Add bot response to chat
      addMessageToChat(response.data.response, "system")
      
      // Update state with new information
      setState(response.data.state || {})
      
      // CRITICAL FIX: Check for both next_step and current_step in the response
      const nextStep = response.data.next_step || response.data.current_step;
      console.log("Setting next step to:", nextStep);
      setCurrentStep(nextStep);
      
      // Reset selected features after submitting
      if (currentStep === "features") {
        setSelectedFeatures([]);
      }
      
      // Check if consultation is complete or recommendations are available
      if (!nextStep || response.data.recommendations) {
        setConsultationComplete(true)
        if (response.data.recommendations) {
          setRecommendations(response.data.recommendations)
        }
      }
    } catch (err) {
      console.error("Error processing request:", err)
      addMessageToChat("Sorry, there was an error processing your request. Please try again.", "system")
    }
    
    setIsSubmitting(false)
  }

  // Handle option selection
  const handleOptionClick = (option) => {
    if (currentStep === "features") {
      // For multi-select features
      setSelectedFeatures(prev => 
        prev.includes(option) 
          ? prev.filter(item => item !== option) 
          : [...prev, option]
      );
    } else {
      // For single-select options
      handleSubmit(option);
    }
  }

  // Handle multi-select submission
  const handleFeaturesSubmit = () => {
    if (selectedFeatures.length === 0) {
      handleSubmit("None");
    } else {
      handleSubmit(selectedFeatures.join(", "));
    }
  }

  // Handle form submission for input fields
  const handleFormSubmit = (e) => {
    e.preventDefault()
    const message = e.target.message.value.trim()
    handleSubmit(message)
  }

  // Reset the consultation
  const resetConsultation = (skipConfirm = false) => {
    if (!skipConfirm && chat.length > 1 && !window.confirm("Reset chat? This will delete all progress.")) {
      return
    }
    
    setChat([])
    setCurrentStep("greeting")
    setState({})
    setConsultationComplete(false)
    setRecommendations([])
    setProcessedMessages(new Set())
    setSelectedFeatures([])
    setMinBudget(500000)
    setMaxBudget(2000000)
    setShowMinBudgetSlider(false)
    setShowMaxBudgetSlider(false)
    setError(null)
    localStorage.removeItem('carConsultationChat')
    localStorage.removeItem('carConsultationState')
    localStorage.removeItem('carConsultationStep')
    localStorage.removeItem('carConsultationComplete')
    localStorage.removeItem('carConsultationRecommendations')
    localStorage.removeItem('carConsultationProcessedMessages')
    localStorage.removeItem('carConsultationSelectedFeatures')
    localStorage.removeItem('carConsultationMinBudget')
    localStorage.removeItem('carConsultationMaxBudget')
    
    startConsultation()
  }

  // Get options for the current step
  const getOptionsForCurrentStep = () => {
    return CONVERSATION_OPTIONS[currentStep] || [];
  }

  // Check if the current step has options
  const hasOptions = () => {
    return getOptionsForCurrentStep().length > 0;
  }

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin mr-2">
          <RefreshCw size={24} />
        </div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="border-b border-gray-800 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">VariantWise</h1>
          <div className="flex items-center">
            <span className="mr-4">Hi, Abhi</span>
            <Button variant="destructive">Logout</Button>
          </div>
        </div>
      </header>

      <nav className="container mx-auto py-4">
        <div className="flex space-x-6">
          <a href="#" className="hover:text-blue-400">Home</a>
          <a href="#" className="hover:text-blue-400">Dashboard</a>
          <a href="#" className="hover:text-blue-400 font-medium">Consultation</a>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl p-4">
        <div className="flex flex-col h-[70vh]">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Car Consultant</h1>
            <Button 
              variant="outline" 
              onClick={() => resetConsultation()}
              disabled={isSubmitting}
              className="border-gray-600 text-white"
            >
              Reset Consultation
            </Button>
          </div>
          
          {/* Chat container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-800 border-gray-700"
          >
            {chat.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 ${message.role === "user" ? "text-right" : ""}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg ${
                    message.role === "user" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-700 text-white border-gray-600 border"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isSubmitting && (
              <div className="mb-4">
                <div className="inline-block p-3 rounded-lg bg-gray-700 border-gray-600 border">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Display recommendations if available */}
            {recommendations.length > 0 && (
              <div className="mb-4 p-4 bg-gray-700 border-gray-600 border rounded-lg">
                <h3 className="font-bold mb-2">Recommended Cars:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Car</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Features</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-700 divide-y divide-gray-600">
                      {recommendations.map((car, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-white">{car.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">{formatCurrency(car.price)}</td>
                          <td className="px-6 py-4">
                            <ul className="list-disc pl-5 text-white">
                              {car.features.map((feature, fidx) => (
                                <li key={fidx}>{feature}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 text-white rounded">
              {error}
            </div>
          )}
          
          {/* Input area */}
          {!consultationComplete ? (
            <div>
              {/* Minimum Budget Slider */}
              {showMinBudgetSlider && (
                <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-center">Select your minimum budget</h3>
                  <BudgetSlider 
                    label="Minimum Budget:"
                    value={minBudget}
                    onChange={setMinBudget}
                    min={100000}
                    max={5000000}
                    step={50000}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={handleMinBudgetSubmit}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Set Minimum Budget
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Maximum Budget Slider */}
              {showMaxBudgetSlider && (
                <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-center">Select your maximum budget</h3>
                  <BudgetSlider 
                    label="Maximum Budget:"
                    value={maxBudget}
                    onChange={setMaxBudget}
                    min={minBudget + 100000}
                    max={5000000}
                    step={50000}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-400">
                      Your budget range: {formatCurrency(minBudget)} - {formatCurrency(maxBudget)}
                    </div>
                    <Button
                      onClick={handleMaxBudgetSubmit}
                      disabled={isSubmitting || maxBudget <= minBudget}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Set Maximum Budget
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Options for selection steps */}
              {hasOptions() && !showMinBudgetSlider && !showMaxBudgetSlider && (
                <div className="mb-4">
                  {currentStep === "features" ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                        {getOptionsForCurrentStep().map((option) => (
                          <Button
                            key={option}
                            variant={selectedFeatures.includes(option) ? "default" : "outline"}
                            className={`justify-start ${
                              selectedFeatures.includes(option) 
                                ? "bg-blue-600 hover:bg-blue-700" 
                                : "border-gray-600 text-white hover:bg-gray-700"
                            }`}
                            disabled={isSubmitting}
                            onClick={() => handleOptionClick(option)}
                          >
                            {selectedFeatures.includes(option) && "✓ "}
                            {option}
                          </Button>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleFeaturesSubmit}
                          disabled={isSubmitting}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {selectedFeatures.length === 0 ? "No features needed" : "Submit Features"}
                        </Button>
                      </div>
                    </>
                  ) : currentStep === "performance" ? (
                    <div className="grid grid-cols-5 gap-2">
                      {getOptionsForCurrentStep().map((option) => (
                        <Button
                          key={option}
                          variant="outline"
                          className="justify-center border-gray-600 text-white hover:bg-gray-700"
                          disabled={isSubmitting}
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {getOptionsForCurrentStep().map((option) => (
                        <Button
                          key={option}
                          variant="outline"
                          className="justify-start border-gray-600 text-white hover:bg-gray-700"
                          disabled={isSubmitting}
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Text input for steps that require it */}
              {!showMinBudgetSlider && !showMaxBudgetSlider && (
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                  <Input
                    name="message"
                    placeholder={currentStep.includes("budget") ? "Enter amount in ₹..." : "Type your answer..."}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={isSubmitting || inputDisabled || hasOptions()}
                    ref={inputRef}
                    autoFocus
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || inputDisabled || hasOptions() || (!userInput.trim() && currentStep !== "greeting")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          ) : (
            // Follow-up questions after consultation is complete
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <Input
                name="message"
                placeholder="Ask a follow-up question about these cars..."
                disabled={isSubmitting}
                ref={inputRef}
                autoFocus
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
      
      {/* CSS for dark theme and slider styling */}
      <style jsx global>{`
        body {
          background-color: #121212;
          color: #f2f2f2;
        }
        
        /* Custom styles for range sliders */
        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          background: #374151;
          outline: none;
        }
        
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
        
        input[type=range]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
        
        input[type=range]::-ms-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
        
        input[type=range]:focus {
          outline: none;
        }
        
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          border-radius: 4px;
        }
        
        input[type=range]::-moz-range-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
