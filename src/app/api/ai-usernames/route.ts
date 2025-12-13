import { NextRequest, NextResponse } from "next/server";
import { generateAIUsernames } from "@/lib/aiGenerator";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { baseName, niche, style } = body;

        if (!baseName || typeof baseName !== "string") {
            return NextResponse.json(
                { error: "baseName is required" },
                { status: 400 }
            );
        }

        const suggestions = await generateAIUsernames(
            baseName.trim(),
            niche?.trim(),
            style?.trim()
        );

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("AI username generation error:", error);

        const message = error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
