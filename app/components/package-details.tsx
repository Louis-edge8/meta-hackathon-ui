"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Package } from "@/lib/services/search-packages"
import Image from "next/image"
import { ReactNode } from "react"

// Extended Package type with interested_count
interface TrendingPackage extends Package {
    interested_count?: number;
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
    maxWidth = "500px"
}: PackageDetailsProps) {
    if (!pkg) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={`sm:max-w-[${maxWidth}] flex flex-col max-h-[80vh]`}>
                <DialogHeader className="pb-2">
                    <DialogTitle>{pkg.title}</DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto pr-2 flex-1">
                    <div className="space-y-4">
                        <div className="w-full h-48 relative rounded-md overflow-hidden">
                            <Image
                                src={pkg.image_url || "https://placehold.co/600x400?text=No+Image"}
                                alt={pkg.title || "Package image"}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <p className="text-sm text-gray-600">{pkg.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                                <span className="font-medium">Price</span>
                                <span>${pkg.price.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">Duration</span>
                                <span>{pkg.duration_days} days</span>
                            </div>
                            {'interested_count' in pkg && (
                                <div className="flex flex-col">
                                    <span className="font-medium">Interested</span>
                                    <span>{pkg.interested_count || 0} travelers</span>
                                </div>
                            )}
                        </div>

                        {pkg.highlights && pkg.highlights.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-1">Highlights</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                    {pkg.highlights.map((highlight, idx) => (
                                        <li key={idx}>{highlight}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex justify-end gap-2 pt-4 mt-2 border-t w-full">
                        {actions}
                    </div>
                )}

                {!actions && (
                    <div className="flex justify-end gap-2 pt-4 mt-2 border-t w-full">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
} 