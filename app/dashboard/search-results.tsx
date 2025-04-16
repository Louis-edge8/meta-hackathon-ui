"use client"

import { PackageDetails } from "@/app/components/package-details"
import { Button } from "@/components/ui/button"
import type { Package } from "@/lib/services/search-packages"
import { UserInterest } from "@/lib/types"
import { Facebook, Pencil, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import MessengerInterface from "./messenger-chat"
import WhatsAppTourismChat from "./whatsapp-chat"

interface SearchResultsProps {
    results: Package[]
    interest: UserInterest
    interestLocations: Record<string, string>
}

export function SearchResults({ results, interest, interestLocations }: SearchResultsProps) {
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
    const [cachedResults, setCachedResults] = useState<Package[]>([])
    const [showWhatsApp, setShowWhatsApp] = useState(false)
    const [showMessenger, setShowMessenger] = useState(false)
    const router = useRouter()

    // Keep a cached copy of results that won't disappear
    useEffect(() => {
        if (results && results.length > 0) {
            setCachedResults(results);
        }
    }, [results]);

    if (!cachedResults || cachedResults.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No search results yet. Click the search button on an interest to find matching packages.
            </div>
        )
    }

    // Function to handle chat toggles
    const toggleChat = (chatType: 'whatsapp' | 'messenger') => {
        if (chatType === 'whatsapp') {
            setShowWhatsApp(true);
            setShowMessenger(false);
        } else {
            setShowMessenger(true);
            setShowWhatsApp(false);
        }
    };

    return (
        <>
            <div className={`flex ${showWhatsApp || showMessenger ? 'space-x-4' : ''}`}>
                <div className={`${showWhatsApp || showMessenger ? 'w-2/3' : 'w-full'}`}>
                    <div className="flex flex-row gap-6">
                        {cachedResults && cachedResults.length > 0 ? cachedResults.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="group flex flex-col rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-200 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)]"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={pkg.image_url || "https://placehold.co/600x400/orange/white"}
                                        alt={pkg.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 bg-orange-500 text-white px-3 py-1 rounded-tr-lg font-bold">
                                        ${pkg.price}
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800 flex-grow flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-lg">{pkg.title}</h4>
                                        <Pencil className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">
                                        {pkg.description}
                                    </p>
                                    <div className="space-y-3 mt-auto">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="w-full h-8 text-sm px-3"
                                                onClick={() => setSelectedPackage(pkg)}
                                            >
                                                Details
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={() => toggleChat('messenger')} className="flex-1 h-8 text-sm px-3 bg-[#1877F2] hover:bg-[#0e6ae3]">
                                                <Facebook className="h-3 w-3 mr-1" />
                                                Facebook
                                            </Button>
                                            <Button onClick={() => toggleChat('whatsapp')} className="flex-1 h-8 text-sm px-3 bg-[#25D366] hover:bg-[#1ebd59]">
                                                <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                </svg>
                                                WhatsApp
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="w-full text-center py-4 text-gray-500">
                                No packages to display.
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Sidebar */}
                {(showWhatsApp || showMessenger) && (
                    <div className="w-1/3 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-20"
                            onClick={() => {
                                setShowWhatsApp(false);
                                setShowMessenger(false);
                            }}
                        >
                            <X size={16} />
                        </Button>
                        <div className="h-full">
                            {showWhatsApp && <WhatsAppTourismChat />}
                            {showMessenger && <MessengerInterface />}
                        </div>
                    </div>
                )}
            </div>

            <PackageDetails
                isOpen={!!selectedPackage}
                onClose={() => setSelectedPackage(null)}
                package={selectedPackage}
                actions={
                    selectedPackage && (
                        <>
                            <Button className="bg-[#1877F2] hover:bg-[#0e6ae3]" onClick={() => {
                                setSelectedPackage(null);
                                toggleChat('messenger');
                            }}>
                                <Facebook className="h-4 w-4 mr-2" />
                                Facebook
                            </Button>
                            <Button className="bg-[#25D366] hover:bg-[#1ebd59]" onClick={() => {
                                setSelectedPackage(null);
                                toggleChat('whatsapp');
                            }}>
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp
                            </Button>
                        </>
                    )
                }
                maxWidth="600px"
            />
        </>
    )
} 