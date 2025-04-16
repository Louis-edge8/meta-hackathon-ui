"use client"

import { Button } from "@/components/ui/button"
import { Package } from "@/lib/services/search-packages"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ArrowRight, Edit, Facebook, Heart, Loader2, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { PackageDetails } from "../components/package-details"

// Extended Package type with interested_count
interface TrendingPackage extends Package {
    interested_count?: number;
}

export default function ProvidersPage() {
    const [trendingPackages, setTrendingPackages] = useState<TrendingPackage[]>([])
    const [proposedPackages, setProposedPackages] = useState<Package[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isProposedLoading, setIsProposedLoading] = useState(true)
    const [selectedPackage, setSelectedPackage] = useState<TrendingPackage | null>(null)
    const supabase = createClientComponentClient()

    useEffect(() => {
        fetchTrendingPackages()
        fetchProposedPackages()
    }, [])

    async function fetchTrendingPackages() {
        try {
            setIsLoading(true)
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                throw new Error("User not authenticated")
            }

            const response = await fetch("/api/trending-packages", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                }
            })

            if (!response.ok) {
                throw new Error("Failed to fetch trending packages")
            }

            const data = await response.json()
            const packages = data.packages || data.data || data || []
            setTrendingPackages(packages)
        } catch (error) {
            console.error("Error fetching trending packages:", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchProposedPackages() {
        try {
            setIsProposedLoading(true)
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                throw new Error("User not authenticated")
            }

            const response = await fetch("/api/proposed-packages", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                }
            })

            if (!response.ok) {
                throw new Error("Failed to fetch proposed packages")
            }

            const data = await response.json()
            const packages = data.packages || data.data || data || []
            setProposedPackages(packages)
        } catch (error) {
            console.error("Error fetching proposed packages:", error)
        } finally {
            setIsProposedLoading(false)
        }
    }

    const handleRandomizeProposals = () => {
        fetchProposedPackages()
    }

    return (
        <main className="flex-1 container mx-auto px-4 pb-8">
            <h1 className="text-3xl font-bold mb-6">Providers page</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trending packages section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Trending packages</h2>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : trendingPackages.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm">
                            No trending packages available.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[450px] overflow-y-auto">
                            {trendingPackages.map((pkg, index) => (
                                <div key={pkg.id} className="flex items-center border rounded-lg overflow-hidden hover:border-gray-400 transition-colors">
                                    {/* Ranking number */}
                                    <div className="px-3 py-4 flex items-center justify-center w-12">
                                        <span className="font-medium text-gray-700">{index + 1}</span>
                                    </div>

                                    {/* Image */}
                                    <div className="w-14 h-14 relative">
                                        <Image
                                            src={pkg.image_url || "https://placehold.co/600x400?text=No+Image"}
                                            alt={pkg.title || "Package image"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Title */}
                                    <div className="flex-1 px-3 py-4 truncate">
                                        <h3 className="font-medium text-sm line-clamp-1">{pkg.title}</h3>
                                    </div>

                                    {/* Interested count */}
                                    <div className="px-3 flex items-center gap-1 text-xs text-pink-500">
                                        <Heart className="h-3.5 w-3.5 fill-current" />
                                        <span>{pkg.interested_count || 0}</span>
                                    </div>

                                    {/* Arrow button */}
                                    <button
                                        onClick={() => setSelectedPackage(pkg)}
                                        className="px-3 py-4 text-gray-500 hover:text-gray-700"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Packages proposal section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">My packages</h2>

                    {isProposedLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : proposedPackages.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm">
                            No proposed packages available.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            {proposedPackages.map((pkg) => (
                                <div key={pkg.id} className="border rounded-lg p-4 relative">
                                    {/* Package image */}
                                    <div className="h-24 w-full relative mb-2 rounded overflow-hidden">
                                        <Image
                                            src={pkg.image_url || "https://placehold.co/600x400?text=No+Image"}
                                            alt={pkg.title || "Package image"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Title */}
                                    <div className="font-medium truncate">{pkg.title}</div>

                                    {/* Price */}
                                    <div className="text-sm">${pkg.price}</div>

                                    {/* Edit button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 w-full flex items-center justify-center gap-1"
                                        onClick={() => setSelectedPackage(pkg as TrendingPackage)}
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                        <span>Edit</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Generate more button */}
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={handleRandomizeProposals}
                            disabled={isProposedLoading}
                            className="flex items-center gap-2"
                        >
                            {isProposedLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            <span>Randomize proposals</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Package Details Dialog using new component */}
            <PackageDetails
                isOpen={!!selectedPackage}
                onClose={() => setSelectedPackage(null)}
                package={selectedPackage}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setSelectedPackage(null)}>
                            Details
                        </Button>
                        <Button className="bg-[#1877F2] hover:bg-[#0e6ae3]">
                            <Facebook className="h-4 w-4 mr-2" />
                            Publish to Facebook Marketplace
                        </Button>
                    </div>
                }
            />
        </main>
    )
} 