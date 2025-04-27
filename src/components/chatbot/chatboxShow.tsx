'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { X, Send, Zap } from 'lucide-react'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Replace with your actual API key in a secure way using environment variables
const MODEL_NAME = "gemini-2.0-flash"
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

interface ChatMessage {
  input: string
  output: string
}

interface ChatboxShowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatboxShowProps {
  onClick: () => void
}

export default function Chatbox({ onClick }: ChatboxShowProps) {
  const [userInput, setUserInput] = useState("")
  const [chatHistory, setChatHistory] = useState<{ interactions: ChatMessage[] }>({
    interactions: [
      {
        input: "who are you?",
        output: "I am an AI assistant created to provide information about ResQMe. Feel free to ask me anything!"
      }
    ]
  })

  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory.interactions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value)
  }

  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    // Provide the prompt for the model
    systemInstruction: "Only answer question to realted to this information: ResQMe AI Responder Dashboard & SOS System is a modular, RiverHacks 2025–originated emergency response platform that empowers users to pre–create detailed medical and contact profiles via a Next.js and TailwindCSS web interface and then trigger SOS alerts instantly through iMessage or SMS using LoopMessage. Those alerts are ingested by the SOSsystem—an Express.js backend with Prisma ORM and PostgreSQL—that requests precise live location sharing if needed, invokes the NearByMe mini-app to enrich each incident with nearby hospitals, police and fire stations, and current weather via the SERP API, and passes the enriched data to the WebAI Navigator API, a local LLM triage engine for severity prediction and next-action recommendations. All active alerts and contextual details are then visualized on the Responder Dashboard, a React/Next.js frontend featuring a secure, password-protected Leaflet map view, emergency request list, and detailed user profiles, enabling authorized personnel to accept, update, and resolve incidents in real time. Deployed on Render and Vercel (with optional self-hosting), this end-to-end system delivers rapid, context-aware assistance with minimal user effort, a clean, mobile-optimized interface for field responders, and a robust tech stack—including Node.js, TypeScript, PostgreSQL, and a local LLM API—that lays the groundwork for future enhancements like end-to-end encryption, responder mobile apps, and multi-language support."
  })

  const generationConfig = {
    temperature: 1,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  }

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ]

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [
          {text: "who is Dipesh\n"},
        ],
      },
    ],
  })

  function addInteraction(userInput: string, botOutput: string) {
    const newInteractions = [...chatHistory.interactions, {
      input: userInput,
      output: botOutput
    }]
    setChatHistory({ interactions: newInteractions })
    setUserInput("")
  }

  const handleSubmit = async () => {
    if (!userInput.trim()) return

    try {
      const result = await chat.sendMessage(userInput)
      const response = result.response
      const fullResponse = response.text()
      addInteraction(userInput, fullResponse)
    } catch (error) {
      console.error("Error sending message:", error)
      addInteraction(userInput, "Sorry, I encountered an error. Please try again later.")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <Card className="fixed bottom-16 right-4 md:right-12 lg:right-8 w-80 z-50 shadow-md">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <h6 className="text-base font-medium">
            Chatbot <Zap className="inline h-4 w-4" />
          </h6>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClick} 
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          ref={chatContainerRef} 
          className="overflow-y-auto max-h-[40vh] min-h-[40vh] pr-4"
        >
          {chatHistory.interactions.map((message, index) => (
            <div key={index}>
              <div className="flex justify-end pb-4">
                <p className="text-xs pt-1 ml-12">{message.input}</p>
                <Avatar className="h-6 w-6 ml-2">
                  <AvatarFallback className="bg-red-600 text-white">H</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex justify-start pb-4">
                <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-red-600 text-white">AI</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium ml-2 mr-8 pt-1">{message.output}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Ask me anything..."
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 border-red-500 focus-visible:ring-red-500"
          />
            <Button 
            onClick={handleSubmit} 
            type="submit"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            aria-label="Send message (or press Enter)"
            >
            <Send className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
