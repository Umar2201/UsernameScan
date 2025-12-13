"use client";

import React, { useState } from "react";

interface AISuggestions {
    minimal: string[];
    professional: string[];
    niche: string[];
    creative: string[];
}

interface AISuggestionsProps {
    baseName: string;
}

export function AISuggestions({ baseName }: AISuggestionsProps) {
    const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedUsername, setCopiedUsername] = useState<string | null>(null);
    const [availability, setAvailability] = useState<Record<string, Record<string, "available" | "taken" | "unknown">>>({});

    const fetchSuggestions = async () => {
        setLoading(true);
        setError(null);
        setAvailability({}); // Reset availability

        try {
            const response = await fetch("/api/ai-usernames", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ baseName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate suggestions");
            }

            setSuggestions(data.suggestions);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Check availability when suggestions change
    React.useEffect(() => {
        if (!suggestions) return;

        const allNames = [
            ...suggestions.minimal,
            ...suggestions.professional,
            ...suggestions.niche,
            ...suggestions.creative
        ];

        const platformsToCheck = ["instagram", "twitter", "github"];

        // Check sequentially to avoid rate limits? Or just fire away.
        // Let's fire away but maybe with small delays if needed.
        allNames.forEach((name) => {
            platformsToCheck.forEach(async (platform) => {
                try {
                    const res = await fetch(`/api/check-username?username=${encodeURIComponent(name)}&platform=${platform}`);
                    const data = await res.json();
                    setAvailability(prev => ({
                        ...prev,
                        [name]: {
                            ...prev[name],
                            [platform]: data.status
                        }
                    }));
                } catch {
                    // ignore
                }
            });
        });
    }, [suggestions]);

    const copyToClipboard = async (username: string) => {
        try {
            await navigator.clipboard.writeText(username);
            setCopiedUsername(username);
            setTimeout(() => setCopiedUsername(null), 2000);
        } catch {
            console.error("Failed to copy");
        }
    };

    const styleLabels = {
        minimal: "Minimal",
        professional: "Professional",
        niche: "Niche",
        creative: "Creative",
    };

    const styleIcons = {
        minimal: "◯",
        professional: "◆",
        niche: "◈",
        creative: "✦",
    };

    // CTA button state (before generation)
    if (!suggestions && !loading && !error) {
        return (
            <div className="w-full max-w-5xl mx-auto mt-8 px-4">
                <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 border border-indigo-100">
                    <div className="text-center">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                            Want better username ideas?
                        </h3>
                        <p className="text-gray-600 mb-5 text-sm sm:text-base">
                            Our AI analyzes your scan and generates premium, brand-ready alternatives.
                        </p>
                        <button
                            onClick={fetchSuggestions}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <span className="text-lg">✨</span>
                            Improve this username with AI
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto mt-8 px-4">
                <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 border border-indigo-100">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 text-center">
                        Best Usernames That Are Likely Available Everywhere
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white/60 rounded-xl p-4 animate-pulse">
                                <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, j) => (
                                        <div key={j} className="h-8 bg-gray-200 rounded-full w-full"></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full max-w-5xl mx-auto mt-8 px-4">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 sm:p-8 border border-red-100">
                    <div className="text-center">
                        <p className="text-red-600 font-medium mb-4">{error}</p>
                        <button
                            onClick={fetchSuggestions}
                            className="px-5 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Results state
    return (
        <div className="w-full max-w-5xl mx-auto mt-8 px-4">
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 border border-indigo-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 text-center">
                    Best Usernames That Are Likely Available Everywhere
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(Object.keys(styleLabels) as Array<keyof typeof styleLabels>).map((style) => (
                        <div
                            key={style}
                            className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80"
                        >
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <span className="text-indigo-500">{styleIcons[style]}</span>
                                {styleLabels[style]}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestions?.[style]?.length > 0 ? (
                                    suggestions[style].map((username, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => copyToClipboard(username)}
                                            className={`relative px-3 py-1.5 bg-white border rounded-full text-sm font-medium text-gray-700 hover:shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${idx === 0 ? "border-indigo-300 ring-1 ring-indigo-100" : "border-gray-200 hover:border-indigo-300"
                                                }`}
                                            title="Click to copy"
                                        >
                                            {username}

                                            {/* Availability Dots */}
                                            <div className="flex gap-1 ml-1.5 pl-1.5 border-l border-gray-200">
                                                {["instagram", "twitter", "github"].map(p => (
                                                    <span
                                                        key={p}
                                                        className={`w-1.5 h-1.5 rounded-full ${availability[username]?.[p] === "available" ? "bg-green-500" :
                                                                availability[username]?.[p] === "taken" ? "bg-red-400" : "bg-gray-200"
                                                            }`}
                                                        title={`${p}: ${availability[username]?.[p] || "checking..."}`}
                                                    />
                                                ))}
                                            </div>

                                            {copiedUsername === username && <span className="text-xs text-green-600">✓</span>}

                                            {/* Best Pick Badge */}
                                            {idx === 0 && (
                                                <span className="absolute -top-2.5 -right-1 bg-yellow-100 text-yellow-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-yellow-200 shadow-sm z-10">
                                                    ⭐ Best Pick
                                                </span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No suggestions generated for this style.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={fetchSuggestions}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        ↻ Generate more suggestions
                    </button>
                </div>
            </div>
        </div>
    );
}
