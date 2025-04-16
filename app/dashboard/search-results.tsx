"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { Package } from "@/lib/services/search-packages"
import { UserInterest } from "@/lib/types"
import { ChevronLeft, ChevronRight, Facebook, Pencil } from "lucide-react"
import { useEffect, useState } from "react"

interface SearchResultsProps {
    results: Package[]
    interest: UserInterest
    interestLocations: Record<string, string>
}

export function SearchResults({ results, interest, interestLocations }: SearchResultsProps) {
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [cachedResults, setCachedResults] = useState<Package[]>([])
    const packagesPerPage = 4

    // Keep a cached copy of results that won't disappear
    useEffect(() => {
        if (results && results.length > 0) {
            setCachedResults(results);
        }
    }, [results]);

    const totalPages = Math.ceil(cachedResults.length / packagesPerPage)

    const paginatedResults = cachedResults.slice(
        (currentPage - 1) * packagesPerPage,
        currentPage * packagesPerPage
    )

    if (!cachedResults || cachedResults.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No search results yet. Click the search button on an interest to find matching packages.
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <img src="/building.svg" alt="Package icon" className="w-6 h-6" />
                        <h2 className="text-xl font-medium">Packages you might love to offer</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                        Still your existing resources, but more data-driven and diverse packages suggested by Travel Buddy
                    </p>

                    {interestLocations && interest && interest.id && (
                        <div className="text-sm text-gray-600">
                            Results for: {interestLocations[interest.id] || "Your search"}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {paginatedResults && paginatedResults.length > 0 ? paginatedResults.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="group relative rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-200"
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
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-lg">{pkg.title}</h4>
                                        <Pencil className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                        {pkg.description}
                                    </p>
                                    <div className="space-y-3">
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
                                            <Button onClick={() => alert('Navigating to Facebook Messenger...')} className="flex-1 h-8 text-sm px-3 bg-[#1877F2] hover:bg-[#0e6ae3]">
                                                <Facebook className="h-3 w-3 mr-1" />
                                                Facebook
                                            </Button>
                                            <Button onClick={() => alert('Navigating to WhatsApp...')} className="flex-1 h-8 text-sm px-3 bg-[#25D366] hover:bg-[#1ebd59]">
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
                            <div className="col-span-4 text-center py-4 text-gray-500">
                                No packages to display. Try adjusting your pagination.
                            </div>
                        )}
                    </div>

                    {cachedResults.length > 0 && (
                        <div className="flex items-center justify-end mt-6">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-gray-500">
                                    {currentPage} / {totalPages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
                                    <Button className="bg-[#1877F2] hover:bg-[#0e6ae3]" onClick={() => {
                                        alert('Navigating to Facebook Messenger...');
                                    }}>
                                        <Facebook className="h-4 w-4 mr-2" />
                                        Facebook
                                    </Button>
                                    <Button className="bg-[#25D366] hover:bg-[#1ebd59]" onClick={() => {
                                        alert('Navigating to WhatsApp...');
                                    }}>
                                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        WhatsApp
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