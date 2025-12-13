"use client";

import React, { useState } from "react";
import { UsernameInput } from "../components/UsernameInput";
import { ResultsGrid } from "../components/ResultsGrid";
import { runChecks, PlatformResult } from "../lib/checkers";
import { SafetyAnalysis } from "@/components/SafetyAnalysis";

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<PlatformResult[]>([]);
    const [scannedUsername, setScannedUsername] = useState<string | null>(null);

    const handleScan = async (username: string) => {
        setLoading(true);
        setResults([]);
        setScannedUsername(username);

        // Check sessionStorage cache
        const cacheKey = `uscan_${username}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < 60000) { // 60s TTL
                setResults(data);
                setLoading(false);
                return;
            }
        }

        try {
            const scanResults = await runChecks(username);
            setResults(scanResults);

            // Save to cache
            sessionStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: scanResults
            }));
        } catch (error) {
            console.error("Scan failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="w-full flex flex-col items-center py-8 sm:py-12">
            <div className="text-center px-4 mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900">
                    UsernameScan
                </h1>
                <p className="text-lg sm:text-xl text-gray-600">
                    Check username availability instantly — across top platforms.
                </p>
            </div>

            <UsernameInput onScan={handleScan} loading={loading} />

            <ResultsGrid results={results} loading={loading} />

            {scannedUsername && results.length > 0 && !loading && (
                <SafetyAnalysis username={scannedUsername} />
            )}
        </main>
    );
}
