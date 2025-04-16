"use client"

import { Camera, ChevronLeft, Mic, Phone, Smile, Video, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function WhatsAppTourismChat() {
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "Bali Paradise Tours",
            phone: "+62 812 3456 7890",
            text: "Hello! Thank you for contacting Bali Paradise Tours. How can I help you with your travel plans today?",
            time: "09:45",
            isUser: false,
        },
        {
            id: 2,
            text: "Hi there! I'm interested in booking a tour package to Bali for next month. Do you have any recommendations for a 5-day trip?",
            time: "09:47",
            isUser: true,
        },
        {
            id: 3,
            sender: "Bali Paradise Tours",
            phone: "+62 812 3456 7890",
            text: "For a 5-day trip to Bali, I recommend our 'Bali Highlights' package which includes:\n\n• 4 nights accommodation at a beachfront resort\n• Daily breakfast\n• Airport transfers\n• Full-day Ubud tour (temples, rice terraces, monkey forest)\n• Full-day water activities (snorkeling, beach club)\n• Sunset dinner cruise\n\nThe package starts from $699 per person. Would you like more details?",
            time: "09:52",
            isUser: false,
        },
        {
            id: 4,
            text: "That sounds great! What's included in the Ubud tour exactly? And do you have any options for Mount Batur trekking?",
            time: "09:55",
            isUser: true,
        },
        {
            id: 5,
            sender: "Bali Paradise Tours",
            phone: "+62 812 3456 7890",
            text: "The Ubud tour includes visits to the Sacred Monkey Forest, Tegalalang Rice Terraces, Tirta Empul Temple, and an art village where you can see local crafts being made. Lunch at a restaurant overlooking the valley is also included.\n\nYes, we can definitely add a Mount Batur sunrise trekking experience! It's one of our most popular add-ons. The trek starts early (around 2 AM pickup) and includes breakfast at the summit while watching the sunrise. It's an additional $75 per person.",
            time: "10:02",
            isUser: false,
        },
    ])

    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages([
                ...messages,
                {
                    id: messages.length + 1,
                    text: message,
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    isUser: true,
                },
            ])
            setMessage("")

            // Simulate response after a short delay
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: prev.length + 1,
                        sender: "Bali Paradise Tours",
                        phone: "+62 812 3456 7890",
                        text: "That's a great question! Let me check the availability and get back to you with the details shortly. Is there anything specific you're looking for in your Bali experience?",
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        isUser: false,
                    },
                ])
            }, 2000)
        }
    }

    return (
        <div className="relative">
            {/* Close button (bookmark style) */}
            <div className="absolute -right-8 top-10 z-30 transform rotate-90 origin-right">
                <button className="bg-error hover:bg-primary-dark text-white px-4 py-2 rounded-t-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1">
                    <X size={16} />
                    <span className="text-xs font-medium">Close</span>
                </button>
            </div>
            <div className="flex flex-col h-screen max-h-[600px] bg-primary-lighter max-w-md mx-auto rounded-lg overflow-hidden shadow-lg relative">
                {/* Background pattern */}
                <div
                    className="absolute top-0 left-0 right-0 bottom-0 z-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23fb5607' fillOpacity='0.1' fillRule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundSize: "60px 60px",
                    }}
                ></div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-primary text-white z-10">
                    <div className="flex items-center">
                        <Link href="#" className="mr-2">
                            <ChevronLeft size={24} />
                        </Link>
                        <div className="relative w-10 h-10 mr-3">
                            <Image
                                src="/placeholder.svg?height=40&width=40"
                                alt="Tourism vendor profile"
                                width={40}
                                height={40}
                                className="rounded-full bg-gray-300"
                            />
                        </div>
                        <div>
                            <div className="font-semibold text-base">Bali Paradise Tours</div>
                            <div className="text-xs opacity-80">~Maya, ~Putu, ~Wayan</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <Video size={20} />
                        <Phone size={20} />
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-3 z-10">
                    {/* Date Header */}
                    <div className="flex justify-center mb-4">
                        <div className="bg-white rounded-lg px-3 py-1 text-sm text-text-primary shadow-sm">Today</div>
                    </div>

                    {/* Encryption Notice */}
                    <div className="bg-primary-light rounded-lg p-3 mb-4 text-center text-sm">
                        <div className="flex justify-center mb-1">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M19 11H5V21H19V11Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M17 7V11H7V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <p>
                            Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them.{" "}
                            <Link href="#" className="text-purple">
                                Learn more
                            </Link>
                        </p>
                    </div>

                    {/* Messages */}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex mb-3 ${msg.isUser ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[80%] rounded-lg p-2 relative ${msg.isUser ? "bg-primary-light rounded-tr-none" : "bg-white rounded-tl-none"
                                    }`}
                            >
                                {!msg.isUser && msg.sender && <div className="text-primary font-medium text-sm">{msg.sender}</div>}
                                <div className="whitespace-pre-line">{msg.text}</div>
                                <div className="text-right text-xs text-text-secondary mt-1">{msg.time}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-2 bg-disabled-bg z-10">
                    <div className="flex items-center bg-white rounded-full px-3 py-1">
                        <button className="p-2 text-text-primary">
                            <Smile size={24} />
                        </button>
                        <input
                            type="text"
                            placeholder="Message"
                            className="flex-1 py-2 px-2 bg-transparent outline-none text-text-primary"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSendMessage()
                                }
                            }}
                        />
                        <button className="p-2 text-text-primary">
                            <Camera size={24} />
                        </button>
                        <button className="p-2 text-text-primary">
                            <Mic size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 