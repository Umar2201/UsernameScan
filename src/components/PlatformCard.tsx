import React from "react";
import { PlatformResult } from "../lib/checkers";
import { platforms } from "../lib/platforms";

interface PlatformCardProps {
    result: PlatformResult;
}

export function PlatformCard({ result }: PlatformCardProps) {
    const platform = platforms.find((p) => p.id === result.platformId);
    if (!platform) return null;

    const statusColors = {
        available: "bg-green-100 text-green-800 border-green-200",
        taken: "bg-red-100 text-red-800 border-red-200",
        unknown: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const statusText = {
        available: "Available",
        taken: "Taken",
        unknown: "Unknown",
    };

    const actionLink = result.status === "available" ? platform.signupUrl : result.profileUrl;
    const actionText = result.status === "available" ? "Claim →" : result.status === "taken" ? "View Profile →" : "Check Manually →";

    return (
        <div className={`p-3 sm:p-4 rounded-lg border ${statusColors[result.status]} flex flex-col gap-2 sm:gap-3 transition-all hover:shadow-md`}>
            <div className="flex items-center gap-3">
                <span className={`text-xl sm:text-2xl ${platform.color}`}>{platform.icon}</span>
                <span className="font-semibold text-sm sm:text-base truncate">{platform.name}</span>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-xs sm:text-sm font-medium px-2 py-1 rounded-full bg-white/50 whitespace-nowrap">
                    {statusText[result.status]}
                </span>
                <a
                    href={actionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-semibold hover:underline whitespace-nowrap ml-2"
                >
                    {actionText}
                </a>
            </div>
        </div>
    );
}
