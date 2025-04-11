"use client"

import type { Package } from "@/lib/services/search-packages"
import { SearchResults } from "./search-results"

interface SearchResultsWrapperProps {
    results: Record<string, Package[]>
    interestLocations: Record<string, string>
}

export function SearchResultsWrapper({ results, interestLocations }: SearchResultsWrapperProps) {


    return (
        <SearchResults
            results={results}
            interestLocations={interestLocations}
        />
    );
} 