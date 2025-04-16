"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Package } from "@/lib/services/search-packages"
import { Calendar, Clock, MapPin, Ship, Star, Users, Wand2 } from 'lucide-react'
import Image from "next/image"
import { ReactNode } from "react"
import ReactMarkdown from 'react-markdown'

// Extended Package type with interested_count and itinerary
interface TrendingPackage extends Package {
    interested_count?: number;
    itinerary?: PackageItinerary[];
    trip_type?: string;
    ideal_for?: string[];
    best_season?: string;
    isAIGenerated?: boolean;
}

interface PackageItinerary {
    day: number;
    title: string;
    schedule: ItinerarySchedule[];
}

interface ItinerarySchedule {
    time: string;
    description: string;
    details?: string;
}

export interface PackageDetailsProps {
    isOpen: boolean
    onClose: () => void
    package: TrendingPackage | Package | null
    actions?: ReactNode
    maxWidth?: string
}

export function PackageDetails({
    isOpen,
    onClose,
    package: pkg,
    actions,
    maxWidth = "600px"
}: PackageDetailsProps) {
    if (!pkg) return null


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={`sm:max-w-[${maxWidth}] flex flex-col max-h-[90vh] bg-white`}
                onWheel={(e) => e.stopPropagation()}
            >
                <DialogHeader className="pb-2 border-b">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        {pkg.title}
                        {'isAIGenerated' in pkg && pkg.isAIGenerated && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm bg-purple-500/70 text-white">
                                <Wand2 className="h-3 w-3" />
                                Created By AI
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto pr-2 flex-1">
                    <div className="space-y-6">
                        <div className="w-full h-60 relative rounded-md overflow-hidden">
                            <Image
                                src={pkg.image_url || "https://placehold.co/600x400?text=No+Image"}
                                alt={pkg.title || "Package image"}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <div className="flex flex-col">
                                    <span className="font-medium">Duration</span>
                                    <span>{pkg.duration_days} days</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <div className="flex flex-col">
                                    <span className="font-medium">Price</span>
                                    <span>${pkg.price.toLocaleString()}</span>
                                </div>
                            </div>
                            {'trip_type' in pkg && pkg.trip_type && (
                                <div className="flex items-center gap-2">
                                    <Ship className="h-4 w-4 text-gray-500" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Trip Type</span>
                                        <span>{pkg.trip_type}</span>
                                    </div>
                                </div>
                            )}
                            {'best_season' in pkg && pkg.best_season && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Best Season</span>
                                        <span>{pkg.best_season}</span>
                                    </div>
                                </div>
                            )}
                            {'ideal_for' in pkg && pkg.ideal_for && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Ideal For</span>
                                        <span>{pkg.ideal_for?.join(', ')}</span>
                                    </div>
                                </div>
                            )}
                            {'interested_count' in pkg && (
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-gray-500" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Interested</span>
                                        <span>{pkg.interested_count || 0} travelers</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-md mb-2 flex items-center gap-2">
                                <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-600 items-center justify-center text-xs">i</span>
                                Overview
                            </h3>
                            <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                                <ReactMarkdown>{pkg.description}</ReactMarkdown>
                            </div>
                        </div>

                        {pkg.highlights && pkg.highlights.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <span className="inline-block w-5 h-5 rounded-full bg-amber-100 text-amber-600 items-center justify-center text-xs">★</span>
                                    Highlights
                                </h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 pl-2 space-y-1">
                                    {pkg.highlights.map((highlight, idx) => (
                                        <li key={idx}>{highlight}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {'itinerary' in pkg && pkg.itinerary && pkg.itinerary.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <span className="inline-block w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">⋮</span>
                                    Itinerary Breakdown
                                </h4>
                                <div className="space-y-4">
                                    {pkg.itinerary.map((day, idx) => (
                                        <div key={idx} className="border-l-2 border-indigo-200 pl-4">
                                            <h5 className="font-medium text-sm">Day {day.day}: {day.title}</h5>
                                            <div className="mt-2 space-y-2">
                                                {day.schedule.map((item, schedIdx) => (
                                                    <div key={schedIdx} className="text-sm">
                                                        <span className="text-indigo-600 font-medium">{item.time}</span> – {item.description}
                                                        {item.details && (
                                                            <p className="text-xs text-gray-500 mt-1">{item.details}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 mt-2 border-t w-full flex justify-end items-center">


                    {actions ? (
                        <div className="flex justify-end gap-2">
                            {actions}
                        </div>
                    ) : (
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 