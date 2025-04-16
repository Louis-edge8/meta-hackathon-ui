"use client"

import { Button } from "@/components/ui/button"
import type { Package } from "@/lib/services/search-packages"
import { UserInterest } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"
import { SearchResults } from "./search-results"

interface SearchResultsWrapperProps {
    results: Record<string, Package[]>
    interestLocations: Record<string, string>
    currentInterestId?: string | null
    interest: UserInterest
}

export function SearchResultsWrapper({
    results,
    interestLocations,
    interest,
    currentInterestId
}: SearchResultsWrapperProps) {
    const resultsRef = useRef<HTMLDivElement>(null);
    const isLoading = currentInterestId && !results[currentInterestId];

    // Auto scroll to results when search completes
    useEffect(() => {
        // Scroll to results section when results are loaded
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [currentInterestId]);

    if (!isLoading && currentInterestId && !results[currentInterestId]) {
        return (
            <div ref={resultsRef} id="search-results-section" className="flex-1 flex flex-col">
                <div className="flex flex-col items-center justify-center py-12 flex-1">
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        No results found for this interest.
                    </p>
                    <Button
                        onClick={() => {
                            const section2 = document.getElementById('section-2');
                            section2?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        Back to Interests
                    </Button>
                </div>
            </div>
        );
    }
    return (
        <div ref={resultsRef} id="search-results-section" className="flex-1 flex flex-col">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 flex-1">
                    <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        Searching for perfect travel packages...
                    </p>
                </div>
            ) : (
                <div className="flex-1">
                    <SearchResults
                        results={currentInterestId ? results[currentInterestId] : []}
                        interest={interest}
                        interestLocations={interestLocations}
                    />
                </div>
            )}
        </div>
    );
} 