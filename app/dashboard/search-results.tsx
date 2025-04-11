"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { Package } from "@/lib/services/search-packages"
import { MessageCircle } from "lucide-react"
import { useState } from "react"

interface SearchResultsProps {
    results: Record<string, Package[]>
    interestLocations: Record<string, string>
}

export function SearchResults({ results, interestLocations }: SearchResultsProps) {
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

    if (Object.keys(results).length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No search results yet. Click the search button on an interest to find matching packages.
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8">
                {Object.entries(results).map(([interestId, packages]) => (
                    <div key={interestId} className="space-y-4">
                        <h4 className="text-lg font-medium">
                            Top 3 results for: {interestLocations[interestId]}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="group relative flex flex-col bg-gradient-to-br from-[#0099FF] to-[#5F5DFF] p-[1px] rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                                >
                                    <div className="flex h-full flex-col bg-white dark:bg-gray-900 p-5 rounded-xl">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-lg mb-2 line-clamp-1">{pkg.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 mb-4">
                                                {pkg.description}
                                            </p>
                                            <div className="space-y-2 text-sm">
                                                <p className="flex items-center justify-between">
                                                    <span className="font-medium">Price:</span>
                                                    <span className="text-[#0099FF]">${pkg.price.toLocaleString()}</span>
                                                </p>
                                                <p className="flex items-center justify-between">
                                                    <span className="font-medium">Duration:</span>
                                                    <span>{pkg.duration_days} days</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-8 text-sm px-3"
                                                onClick={() => setSelectedPackage(pkg)}
                                            >
                                                Details
                                            </Button>
                                            <Button onClick={() => alert('Navigating to Messenger/WhatsApp...')} className="h-8 text-sm px-3 bg-[#0099FF] hover:bg-[#0088EE]">
                                                <MessageCircle className="h-3 w-3 mr-1" />
                                                Message
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div >

            <Dialog open={!!selectedPackage} onOpenChange={(open) => !open && setSelectedPackage(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    {selectedPackage && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedPackage.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <p className="text-gray-600 dark:text-gray-300">{selectedPackage.description}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-medium">Price</p>
                                        <p className="text-gray-600 dark:text-gray-300">${selectedPackage.price.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Duration</p>
                                        <p className="text-gray-600 dark:text-gray-300">{selectedPackage.duration_days} days</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="font-medium">Highlights</p>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {Array.isArray(selectedPackage.highlights)
                                                ? selectedPackage.highlights.join(', ') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button variant="outline" onClick={() => setSelectedPackage(null)}>
                                        Close
                                    </Button>
                                    <Button className="bg-[#0099FF] hover:bg-[#0088EE]" onClick={() => {
                                        alert('Navigating to Messenger/WhatsApp...');
                                    }}>
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Contact Vendor
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
} 