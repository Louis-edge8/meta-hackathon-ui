"use client"

import { PackageDetails } from "@/app/components/package-details"
import TourPackagePreview from "@/app/components/tour-package-preview"
import { Button } from "@/components/ui/button"
import type { Package } from "@/lib/services/search-packages"
import { UserInterest } from "@/lib/types"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Facebook, Pencil, Wand2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import MessengerInterface from "./messenger-chat"
import WhatsAppTourismChat from "./whatsapp-chat"

interface SearchResultsProps {
    results: Package[]
    interest?: UserInterest
    interestLocations?: Record<string, string>
    onEdit?: (pkg: Package) => void
    onDelete?: (packageId: string) => void
}

// Add interface to extend Package with isAIGenerated flag
interface ExtendedPackage extends Package {
    isAIGenerated?: boolean;
    location_input?: string;
    locations?: string[]; // For location names when available
}

export function SearchResults({ results, interest, interestLocations, onEdit, onDelete }: SearchResultsProps) {
    const [selectedPackage, setSelectedPackage] = useState<ExtendedPackage | null>(null)
    const [cachedResults, setCachedResults] = useState<ExtendedPackage[]>([])
    const [showWhatsApp, setShowWhatsApp] = useState(false)
    const [showMessenger, setShowMessenger] = useState(false)
    const [showMarketplacePreview, setShowMarketplacePreview] = useState(false)
    const [previewPackage, setPreviewPackage] = useState<ExtendedPackage | null>(null)
    const router = useRouter()

    const [locations, setLocations] = useState<Record<string, string>>({})

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const supabase = createClientComponentClient();
                const { data: locationData } = await supabase
                    .from("locations")
                    .select("id, name")
                    .order("name");

                if (locationData) {
                    const locationMap: Record<string, string> = {};
                    locationData.forEach(loc => {
                        locationMap[loc.id] = loc.name;
                    });
                    setLocations(locationMap);
                }
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        if (results && results.length > 0) {
            setCachedResults(results);
        }
    }, [results]);

    const getLocationName = (pkg: ExtendedPackage): string => {
        if (pkg.location_id && locations[pkg.location_id]) {
            return locations[pkg.location_id];
        }

        if (interest && interestLocations && interest.id && interestLocations[interest.id]) {
            const locationNames = interestLocations[interest.id].split(" | ");
            if (locationNames.length > 0) {
                return locationNames[0].split(",")[0].trim();
            }
        }

        if (pkg.location_input && !pkg.location_input.includes("_")) {
            return pkg.location_input;
        }

        return "Sapa";
    };

    if (!cachedResults || cachedResults.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-center py-8 text-gray-500 dark:text-gray-400">
                No search results yet. Click the search button on an interest to find matching packages.
            </div>
        )
    }

    const toggleChat = (chatType: 'whatsapp' | 'messenger') => {
        if (chatType === 'whatsapp') {
            setShowWhatsApp(true);
            setShowMessenger(false);
        } else {
            setShowMessenger(true);
            setShowWhatsApp(false);
        }
    };

    const handleMarketplacePreview = (pkg: ExtendedPackage) => {
        setPreviewPackage(pkg);
        setShowMarketplacePreview(true);
    };

    // Separate base tours and AI-generated tours
    const baseTours = cachedResults.filter(pkg => !pkg.isAIGenerated); // Show all non-AI tours
    const aiTours = cachedResults.filter(pkg => pkg.isAIGenerated); // Show all AI-generated tours

    const renderPackage = (pkg: ExtendedPackage) => (
        <div
            key={pkg.id}
            className="group flex flex-col rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-200 min-w-[320px] w-[320px] flex-shrink-0 snap-start"
        >
            <div className="relative h-60 overflow-hidden">
                <img
                    src={pkg.image_url || "https://placehold.co/600x400/orange/white"}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 bg-orange-500/60 backdrop-blur-sm text-white px-3 py-1 rounded-tr-lg font-bold">
                    ${pkg.price}
                </div>
                <div className="absolute bottom-0 right-0 bg-white/70 backdrop-blur-sm text-black px-3 py-1 rounded-tl-lg font-medium text-sm">
                    {getLocationName(pkg)}
                </div>
                {pkg.isAIGenerated && (
                    <div className="absolute text-indigo-500 top-0 right-0 backdrop-blur-sm bg-white/70 text-white px-3 py-1.5 rounded-bl-lg font-bold flex items-center gap-1.5 shadow-lg">
                        <Wand2 className="h-4 w-4" />
                        Created By AI
                    </div>
                )}
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-lg line-clamp-2 overflow-hidden">{pkg.title}</h4>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Duration: </span>
                    <span className="ml-1">{pkg.duration_days || 3} Days</span>
                </div>

                <div className="mt-auto">
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="outline"
                            className="h-8 w-[32px] flex items-center justify-center"
                            onClick={() => onEdit?.(pkg)}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="destructive"
                            className="h-8 w-[32px] flex items-center justify-center"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this package?')) {
                                    onDelete?.(pkg.id)
                                }
                            }}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                        <Button
                            className="h-8 text-sm flex-1 bg-[#1877F2] hover:bg-[#0e6ae3]"
                            onClick={() => handleMarketplacePreview(pkg)}
                        >
                            <Facebook className="h-3 w-3 mr-1" />
                            Publish to Marketplace
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className={`flex flex-1 ${showWhatsApp || showMessenger ? 'space-x-4' : ''}`}>
                <div className={`${showWhatsApp || showMessenger ? 'w-2/3' : 'w-full'} flex flex-col space-y-6`}>
                    {/* Random Tours Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">My Tours</h3>
                        <div className="flex flex-row flex-nowrap gap-6 overflow-x-auto pb-4 snap-x">
                            {baseTours.length > 0 ? (
                                baseTours.map(renderPackage)
                            ) : (
                                <div className="w-full text-center py-4 text-gray-500">
                                    No tours available.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI-Generated Tours Section */}
                    {aiTours.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">AI-Generated Tours</h3>
                            <div className="flex flex-row flex-nowrap gap-6 overflow-x-auto pb-4 snap-x">
                                {aiTours.map(renderPackage)}
                            </div>
                            {/* Generate More Tours Button */}
                            <div className="flex flex-col items-center mt-6 gap-2">
                                <Button
                                    onClick={() => {
                                        // Handle generate more tours
                                        console.log("Generate more tours clicked");
                                    }}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Wand2 className="h-5 w-5" />
                                    Generate more tours
                                </Button>
                                <p className="text-sm text-gray-500">Get your exciting itineraries, but more data-driven and creative tours suggested by TravelBuddy AI</p>
                            </div>
                        </div>
                    )}
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