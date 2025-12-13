"use client";

import React, { useState } from "react";
import { PlatformResult } from "../lib/checkers";
import { PlatformCard } from "./PlatformCard";

interface ResultsGridProps {
    results: PlatformResult[];
    loading: boolean;
}

const PRIORITY_PLATFORMS = ["instagram", "tiktok", "youtube", "twitter", "github", "twitch"];

export function ResultsGrid({ results, loading }: ResultsGridProps) {
    const [showAll, setShowAll] = useState(false);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-5xl mx-auto mt-8 px-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (results.length === 0) return null;

    // Sort: Priority platforms first
    const sortedResults = [...results].sort((a, b) => {
        const aPrio = PRIORITY_PLATFORMS.indexOf(a.platformId);
        const bPrio = PRIORITY_PLATFORMS.indexOf(b.platformId);

        // Both are priority: maintain order in PRIORITY_PLATFORMS
        if (aPrio !== -1 && bPrio !== -1) return aPrio - bPrio;

        // Only a is priority
        if (aPrio !== -1) return -1;

        // Only b is priority
        if (bPrio !== -1) return 1;

        // Neither: keep original order
        return 0;
    });

    const visibleResults = showAll ? sortedResults : sortedResults.slice(0, 6);
    const hasHidden = sortedResults.length > 6;

    return (
        <div className="w-full max-w-5xl mx-auto mt-6 sm:mt-8 px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {visibleResults.map((result) => (
                    <PlatformCard key={result.platformId} result={result} />
                ))}
            </div>

            {!showAll && hasHidden && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => setShowAll(true)}
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors px-4 py-2 rounded-full hover:bg-gray-100"
                    >
                        Show more platforms ↓
                    </button>
                </div>
            )}
        </div>
    );
}
