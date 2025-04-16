"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Location } from "@/lib/database.types"
import { Package } from "@/lib/services/search-packages"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { X } from "lucide-react"
import Image from "next/image"
import { useEffect, useState, WheelEvent } from "react"
import { toast } from "sonner"

interface TourPackageEditorProps {
    isOpen: boolean
    onClose: () => void
    mode?: 'add' | 'edit'
    initialData?: Package
    locations: Location[]
    onSuccess?: () => void
}

export default function TourPackageEditor({ isOpen, onClose, mode = 'add', initialData, locations, onSuccess }: TourPackageEditorProps) {
    const [title, setTitle] = useState(initialData?.title ?? "")
    const [price, setPrice] = useState(initialData?.price?.toString() ?? "")
    const [description, setDescription] = useState(initialData?.description ?? "")
    const [duration, setDuration] = useState(initialData?.duration_days?.toString() ?? "")
    const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "")
    const [locationId, setLocationId] = useState(initialData?.location_id ?? "")
    const [isLoading, setIsLoading] = useState(false)

    // Reset form when initialData changes
    useEffect(() => {
        setTitle(initialData?.title ?? "")
        setPrice(initialData?.price?.toString() ?? "")
        setDescription(initialData?.description ?? "")
        setDuration(initialData?.duration_days?.toString() ?? "")
        setImageUrl(initialData?.image_url ?? "")
        setLocationId(initialData?.location_id ?? "")
    }, [initialData])

    const supabase = createClientComponentClient()

    const handleWheel = (e: WheelEvent) => {
        e.stopPropagation()
    }

    const selectedLocation = locations.find(loc => loc.id === locationId)

    const validateForm = () => {
        if (!title) {
            toast.error("Please enter a title")
            return false
        }
        if (!price) {
            toast.error("Please enter a price")
            return false
        }
        if (!duration) {
            toast.error("Please enter duration")
            return false
        }
        if (!locationId) {
            toast.error("Please select a location")
            return false
        }
        if (!description) {
            toast.error("Please enter a description")
            return false
        }
        if (!imageUrl) {
            toast.error("Please enter an image URL")
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Please fill in all fields")
            return
        }

        try {
            setIsLoading(true)

            const packageData = {
                title,
                provider_id: initialData?.provider_id ?? "047d4c0e-7088-4a2a-aaca-7a8d32c90117",
                location_id: locationId,
                price: parseFloat(price),
                duration_days: parseInt(duration),
                highlights: description.split('\n\n').filter(line => line.trim().startsWith('◯')).map(line => line.replace('◯', '').trim()),
                description,
                image_url: imageUrl,
                location_vector: null,
                duration_vector: null
            }

            if (mode === 'add') {
                const { error } = await supabase
                    .from('travel_packages')
                    .insert([packageData])

                if (error) throw error
                toast.success("Package created successfully")
            } else {
                const { error } = await supabase
                    .from('travel_packages')
                    .update(packageData)
                    .eq('id', initialData?.id)

                if (error) throw error
                toast.success("Package updated successfully")
            }

            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Error saving package:', error)
            toast.error("Failed to save package")
        } finally {
            setIsLoading(false)
        }
    }

    const previewPackage: Package = {
        id: initialData?.id ?? "new",
        title: title,
        provider_id: initialData?.provider_id ?? "047d4c0e-7088-4a2a-aaca-7a8d32c90117",
        location_id: locationId,
        price: parseFloat(price) || 0,
        duration_days: parseInt(duration) || 1,
        highlights: description.split('\n\n').filter(line => line.trim().startsWith('◯')).map(line => line.replace('◯', '').trim()),
        description: description,
        image_url: imageUrl,
        location_vector: null,
        duration_vector: null
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto" onWheel={handleWheel}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <Input
                            className="text-3xl font-bold p-4 text-gray-800 w-2/3"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter tour package title"
                        />
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-500">
                                {mode === 'add' ? 'New Package' : 'Edit Package'}
                            </span>
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium whitespace-nowrap">Price ($):</label>
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium whitespace-nowrap">Duration (days):</label>
                                    <Input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium whitespace-nowrap">Location:</label>
                                <Select value={locationId} onValueChange={setLocationId}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select a location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map((location) => (
                                            <SelectItem key={location.id} value={location.id}>
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium whitespace-nowrap">Image URL:</label>
                                <Input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="flex-1"
                                    placeholder="Enter image URL"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[300px]"
                                    placeholder="Enter package description"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Preview</label>
                            <div className="space-y-4">
                                <div className="relative rounded-md overflow-hidden">
                                    <div className="aspect-[4/3] relative">
                                        <Image
                                            src={imageUrl || "/placeholder.svg"}
                                            alt="Tour preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-bold text-lg">{title || "Package Title"}</h3>
                                                <p className="font-bold">${price || "0"}</p>
                                                <p className="text-sm text-gray-500">{duration || "1"} day(s)</p>
                                                {selectedLocation && (
                                                    <p className="text-sm text-gray-500">in {selectedLocation.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="font-semibold mb-1">Details</h4>
                                                <p className="text-sm line-clamp-3">{description || "No description provided"}</p>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src="/placeholder.svg" />
                                                        <AvatarFallback>TS</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">Thao Snow</span>
                                                </div>
                                                <span className="text-sm text-gray-500">Seller details</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {mode === 'add' ? 'Creating...' : 'Saving...'}
                                </div>
                            ) : (
                                mode === 'add' ? 'Create Package' : 'Save Changes'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
} 