import { NextResponse } from "next/server";
import { analyzeUsername } from "@/lib/safetyAnalyzer";
import { analyzeSEO } from "@/lib/seoAnalyzer";
import { analyzeReputation } from "@/lib/reputationAnalyzer";

export async function POST(request: Request) {
    try {
        const { username, type } = await request.json();

        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        let analysis;
        if (type === "seo") {
            analysis = await analyzeSEO(username);
        } else if (type === "reputation") {
            analysis = await analyzeReputation(username);
        } else {
            // Default to safety
            analysis = await analyzeUsername(username);
        }

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
            { error: "Failed to analyze username" },
            { status: 500 }
        );
    }
}
