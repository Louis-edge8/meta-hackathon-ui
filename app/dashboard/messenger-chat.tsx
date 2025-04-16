"use client"
import { Camera, ChevronLeft, ImageIcon, Info, Mic, Plus, Smile, ThumbsUp, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MessengerInterface() {
    return (
        <div className="relative">
            {/* Close button (bookmark style) */}
            <div className="absolute -right-8 top-10 z-30 transform rotate-90 origin-right">
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-t-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1">
                    <X size={16} />
                    <span className="text-xs font-medium">Close</span>
                </button>
            </div>
            <div className="flex flex-col h-screen max-h-[650px] bg-white max-w-md mx-auto rounded-lg overflow-hidden shadow-lg">
                {/* Header */}
                <div className="flex items-center px-4 py-2 border-b">
                    <Link href="#" className="flex items-center justify-center w-8 h-8 text-blue-500">
                        <ChevronLeft size={24} className="text-blue-500" />
                        <span className="absolute ml-4 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            4
                        </span>
                    </Link>
                    <div className="flex items-center ml-6">
                        <div className="relative w-10 h-10">
                            <Image
                                src="/placeholder.svg?height=40&width=40"
                                alt="Chestnut logo"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="ml-2">
                            <div className="font-bold text-lg">Khóa học Hạt dẻ</div>
                            <div className="text-gray-500 text-sm">Business chat</div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-100">
                    {/* Business Profile */}
                    <div className="flex flex-col items-center mt-4 mb-6">
                        <div className="relative w-24 h-24 mb-2">
                            <Image
                                src="/placeholder.svg?height=96&width=96"
                                alt="Chestnut logo large"
                                width={96}
                                height={96}
                                className="rounded-full"
                            />
                        </div>
                        <div className="text-xs text-center text-gray-700 uppercase tracking-wide font-semibold">Khóa học hạt</div>
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                    </div>

                    {/* Business Info */}
                    <div className="flex flex-col items-center mb-4">
                        <h1 className="text-2xl font-bold mb-1">Khóa học Hạt dẻ</h1>
                        <p className="text-gray-600 mb-1">Typically replies within minutes</p>
                        <p className="text-gray-600 mb-1">1.6K people like this</p>
                        <p className="text-gray-600 mb-2">Grocery Store</p>
                        <Link href="#" className="text-blue-500 font-medium">
                            Business chats and your privacy
                        </Link>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-6 mb-4">
                        <button className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                                <ThumbsUp size={20} />
                            </div>
                            <span className="text-sm">Like Page</span>
                        </button>
                        <button className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                                <Info size={20} />
                            </div>
                            <span className="text-sm">Info</span>
                        </button>
                    </div>

                    {/* View Profile Button */}
                    <div className="flex justify-center mb-4">
                        <button className="bg-gray-200 text-black font-medium py-2 px-6 rounded-full">View profile</button>
                    </div>

                    {/* Ad Notice */}
                    <div className="text-center text-gray-500 text-sm mb-6 px-4">
                        You opened this conversation through an ad. When you reply, Khóa học Hạt dẻ will see your public info and
                        which ad you clicked.{" "}
                        <Link href="#" className="text-blue-500">
                            View ad
                        </Link>
                    </div>

                    {/* Chat Messages */}
                    <div className="mb-4">
                        <div className="flex items-start mb-1">
                            <div className="w-8 h-8 mr-2 flex-shrink-0">
                                <Image
                                    src="/placeholder.svg?height=32&width=32"
                                    alt="Business profile"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            </div>
                            <div className="bg-gray-200 rounded-2xl py-2 px-4 max-w-[80%]">
                                <p>Chào Luận! Chúng tôi có thể giúp gì cho bạn?</p>
                            </div>
                            <div className="ml-2 text-gray-500">
                                <Smile size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Replies */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-end">
                            <button className="bg-white border border-gray-300 text-blue-500 rounded-full py-2 px-4 text-sm">
                                Tôi có thể mua hàng không?
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button className="bg-white border border-gray-300 text-blue-500 rounded-full py-2 px-4 text-sm">
                                Có ai đang online để chat không?
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button className="bg-white border border-gray-300 text-blue-500 rounded-full py-2 px-4 text-sm">
                                Tôi quan tâm đến mặt hàng/dịch vụ này. Bạn giới thiệu rõ hơn được không?
                            </button>
                        </div>
                    </div>
                </div>

                {/* Message Input */}
                <div className="border-t p-2 bg-white">
                    <div className="flex items-center">
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
                            <Plus size={24} />
                        </button>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
                            <Camera size={24} />
                        </button>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
                            <ImageIcon size={24} />
                        </button>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
                            <Mic size={24} />
                        </button>
                        <div className="flex-1 mx-1 rounded-full bg-gray-100 px-4 py-2 text-gray-400">Aa</div>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
                            <Smile size={24} />
                        </button>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
                            <ThumbsUp size={24} />
                        </button>
                    </div>
                    <div className="h-5 mt-2 bg-gray-100 w-full rounded-full mx-auto"></div>
                </div>
            </div>
        </div>
    )
} 