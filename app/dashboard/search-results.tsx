"use client"

import { PackageDetails } from "@/app/components/package-details"
import TourPackagePreview from "@/app/components/tour-package-preview"
import { Button } from "@/components/ui/button"
import type { Package } from "@/lib/services/search-packages"
import { UserInterest } from "@/lib/types"
import { Facebook, Pencil, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import MessengerInterface from "./messenger-chat"
import WhatsAppTourismChat from "./whatsapp-chat"

interface SearchResultsProps {
    results: Package[]
    interest?: UserInterest
    interestLocations?: Record<string, string>
}

// Add interface to extend Package with isAIGenerated flag
interface ExtendedPackage extends Package {
    isAIGenerated?: boolean;
}

export function SearchResults({ results }: SearchResultsProps) {
    const [selectedPackage, setSelectedPackage] = useState<ExtendedPackage | null>(null)
    const [cachedResults, setCachedResults] = useState<ExtendedPackage[]>([])
    const [showWhatsApp, setShowWhatsApp] = useState(false)
    const [showMessenger, setShowMessenger] = useState(false)
    const [showMarketplacePreview, setShowMarketplacePreview] = useState(false)
    const [previewPackage, setPreviewPackage] = useState<ExtendedPackage | null>(null)
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

    // Function to handle marketplace preview
    const handleMarketplacePreview = (pkg: ExtendedPackage) => {
        setPreviewPackage(pkg);
        setShowMarketplacePreview(true);
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
                                    {pkg.isAIGenerated && (
                                        <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 rounded-bl-lg font-bold flex items-center">
                                            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M15.5 9L15.6716 9.17157C17.0049 10.5049 17.6716 11.1716 17.6716 12C17.6716 12.8284 17.0049 13.4951 15.6716 14.8284L15.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M13.5 7L13.6716 7.17157C16.0049 9.50491 17.1716 10.6716 17.1716 12C17.1716 13.3284 16.0049 14.4951 13.6716 16.8284L13.5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M10.5 15L10.3284 14.8284C8.99509 13.4951 8.32843 12.8284 8.32843 12C8.32843 11.1716 8.99509 10.5049 10.3284 9.17157L10.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M8.5 17L8.32843 16.8284C5.99509 14.4951 4.82843 13.3284 4.82843 12C4.82843 10.6716 5.99509 9.50491 8.32843 7.17157L8.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                            Created By AI
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800 flex-grow flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-lg">{pkg.title}</h4>
                                        <Pencil className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">
                                        <ReactMarkdown>{pkg.description}</ReactMarkdown>
                                    </div>
                                    <div className="space-y-3 mt-auto">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => console.log('Edit package', pkg.id)}
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full h-8 text-sm px-3"
                                                onClick={() => setSelectedPackage(pkg)}
                                            >
                                                Details
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 h-8 text-sm px-3 bg-[#1877F2] hover:bg-[#0e6ae3]"
                                                onClick={() => handleMarketplacePreview(pkg)}
                                            >
                                                <Facebook className="h-3 w-3 mr-1" />
                                                Publish to Marketplace
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
                            <Button variant="outline" onClick={() => setSelectedPackage(null)}>
                                Details
                            </Button>
                            <Button
                                className="bg-[#1877F2] hover:bg-[#0e6ae3]"
                                onClick={() => {
                                    setSelectedPackage(null);
                                    handleMarketplacePreview(selectedPackage);
                                }}
                            >
                                <Facebook className="h-4 w-4 mr-2" />
                                Publish to Facebook Marketplace
                            </Button>
                        </>
                    )
                }
                maxWidth="600px"
            />

            {/* Marketplace Preview Modal */}
            <TourPackagePreview
                isOpen={showMarketplacePreview}
                onClose={() => setShowMarketplacePreview(false)}
                package={previewPackage}
            />
        </>
    )
} 