"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { Location, UserInterestInsert } from "@/lib/database.types"

interface InterestFormProps {
  locations: Location[]
  userId: string
}

export function InterestForm({ locations, userId }: InterestFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<Omit<UserInterestInsert, "user_id">>({
    location_id: "",
    budget: 0,
    priority_level: 1,
    activities: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "budget" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority_level" ? Number.parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, check if the user exists in the auth.users table
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) throw userError

      if (!userData || !userData.user) {
        throw new Error("User not authenticated properly")
      }

      // Log the user ID for debugging
      console.log("User ID from auth:", userData.user.id)
      console.log("User ID from props:", userId)

      // Use the server API route to handle the insert with admin privileges
      const response = await fetch("/api/interests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          user_id: 'be5e6527-e048-42e6-856c-93aaf1695311',
        }),
      })

      const result = await response.json()
      console.log("Success")

      if (!response.ok) {
        throw new Error(result.error || "Failed to save interest")
      }

      toast({
        title: "Success!",
        description: "Your travel interest has been saved.",
      })

      // Reset form
      setFormData({
        location_id: "",
        budget: 0,
        priority_level: 1,
        activities: "",
        notes: "",
      })

      // Refresh the page to show the new interest
      router.refresh()
    } catch (error: any) {
      console.error("Error saving interest:", error)
      toast({
        title: "Error saving interest",
        description: error.message || "An error occurred while saving your interest",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location_id">Location</Label>
        <Select
          value={formData.location_id}
          onValueChange={(value) => handleSelectChange("location_id", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}, {location.country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Budget (USD)</Label>
        <Input
          id="budget"
          name="budget"
          type="number"
          min="0"
          value={formData.budget}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority_level">Priority</Label>
        <Select
          value={formData.priority_level.toString()}
          onValueChange={(value) => handleSelectChange("priority_level", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((priority) => (
              <SelectItem key={priority} value={priority.toString()}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activities">Activities</Label>
        <Input
          id="activities"
          name="activities"
          value={formData.activities}
          onChange={handleChange}
          placeholder="e.g., Hiking, Museums, Food Tours"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Any additional notes about your interest"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Interest"}
      </Button>
    </form>
  )
}
