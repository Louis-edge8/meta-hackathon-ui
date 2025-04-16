"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { Location, UserInterestInsert } from "@/lib/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface InterestFormProps {
  locations: Location[];
  userId: string;
}

export function InterestForm({ locations, userId }: InterestFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [customLocations, setCustomLocations] = useState<string[]>([]);
  const [newCustomLocation, setNewCustomLocation] = useState("");
  const [isDropdownMode, setIsDropdownMode] = useState(true);

  const [formData, setFormData] = useState<Omit<UserInterestInsert, "user_id" | "locations_id" | "locations_text">>(
    {
      budget: 0,
      duration: 0,
      activities: "",
      notes: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "budget" ? Number.parseInt(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority_level" ? Number.parseInt(value) : value,
    }));
  };

  const handleLocationSelect = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (location && !selectedLocations.some((loc) => loc.id === locationId)) {
      setSelectedLocations((prev) => [...prev, location]);
    }
  };

  const removeLocation = (locationId: string) => {
    setSelectedLocations((prev) => prev.filter((loc) => loc.id !== locationId));
  };

  const addCustomLocation = () => {
    if (newCustomLocation.trim() && !customLocations.includes(newCustomLocation.trim())) {
      setCustomLocations((prev) => [...prev, newCustomLocation.trim()]);
      setNewCustomLocation("");
    }
  };

  const removeCustomLocation = (location: string) => {
    setCustomLocations((prev) => prev.filter((loc) => loc !== location));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, check if the user exists in the auth.users table
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      if (!userData || !userData.user) {
        throw new Error("User not authenticated properly");
      }

      // Prepare the locations data
      const locations_id = selectedLocations.map((loc) => loc.id);
      const locations_text = [
        ...selectedLocations.map((loc) => `${loc.name}, ${loc.country}`),
        ...customLocations
      ].join(" | ");

      // Use the server API route to handle the insert with admin privileges
      const response = await fetch("/api/interests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          locations_id,
          locations_text,
          user_id: userId,
        }),
      });

      const result = await response.json();
      console.log("Success");

      if (!response.ok) {
        throw new Error(result.error || "Failed to save interest");
      }

      toast({
        title: "Success!",
        description: "Your travel interest has been saved.",
      });

      // Reset form
      setFormData({
        budget: 0,
        duration: 0,
        activities: "",
        notes: "",
      });
      setSelectedLocations([]);
      setCustomLocations([]);
      setNewCustomLocation("");

      // Refresh the page to show the new interest
      router.refresh();
    } catch (error: any) {
      console.error("Error saving interest:", error);
      toast({
        title: "Error saving interest",
        description:
          error.message || "An error occurred while saving your interest",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className=" ">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {isDropdownMode ? (
              <Select onValueChange={handleLocationSelect}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select locations from database" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}, {location.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newCustomLocation}
                  onChange={(e) => setNewCustomLocation(e.target.value)}
                  placeholder="Add custom location"
                  className="flex-1 h-9"
                />
                <Button type="button" onClick={addCustomLocation} className="h-9">
                  Add
                </Button>
              </div>
            )}
          </div>
          <div className="group relative">
            <label
              className="relative inline-block h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-gray-900"
              title="Do you want custom location?"
            >
              <input
                className="peer sr-only"
                type="checkbox"
                checked={!isDropdownMode}
                onChange={(e) => setIsDropdownMode(!e.target.checked)}
              />
              <span
                className="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-gray-300 ring-[6px] ring-inset ring-white transition-all peer-checked:start-8 peer-checked:w-2 peer-checked:bg-white peer-checked:ring-transparent"
              ></span>
            </label>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Do you want custom location?
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedLocations.map((location) => (
            <Badge key={location.id} variant="secondary">
              {location.name}, {location.country}
              <button
                type="button"
                onClick={() => removeLocation(location.id)}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {customLocations.map((location) => (
            <Badge key={location} variant="secondary">
              {location}
              <button
                type="button"
                onClick={() => removeCustomLocation(location)}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 mt-1 mb-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="budget" className="w-40">Budget (USD) *</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            min="0"
            value={formData.budget}
            onChange={handleChange}
            required
            className="flex-1"
          />
        </div>

        <div className="flex items-center gap-4">
          <Label htmlFor="duration" className="w-40">Duration (Days) *</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="0"
            value={formData.duration}
            onChange={handleChange}
            required
            className="flex-1"
          />
        </div>

        <div className="flex items-center gap-4">
          <Label htmlFor="activities" className="w-40">Activities *</Label>
          <Input
            id="activities"
            name="activities"
            value={formData.activities}
            onChange={handleChange}
            placeholder="e.g., Hiking, Museums, Food Tours"
            required
            className="flex-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            placeholder="Any additional notes about your interest"
            rows={3}
            className="w-full"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Find & Generate Tour"}
      </Button>
    </form>
  );
}
