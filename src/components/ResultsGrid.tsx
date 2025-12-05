import React from "react";
import { PlatformResult } from "../lib/checkers";
import { PlatformCard } from "./PlatformCard";

interface ResultsGridProps {
    results: PlatformResult[];
    loading: boolean;
}

export function ResultsGrid({ results, loading }: ResultsGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-5xl mx-auto mt-8 px-4">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (results.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 w-full max-w-5xl mx-auto mt-6 sm:mt-8 px-4">
            {results.map((result) => (
                <PlatformCard key={result.platformId} result={result} />
            ))}
        </div>
    );
}
