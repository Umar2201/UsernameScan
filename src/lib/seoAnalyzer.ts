
const MODEL = "mistralai/mistral-7b-instruct";
const TIMEOUT_MS = 15000;

export interface SEOAnalysis {
    username: string;
    scores: {
        availability_likelihood: number;
        seo_friendliness: number;
        memorability_clarity: number;
    };
    final_verdict: "STRONG CHOICE" | "AVERAGE" | "WEAK";
    summary: string;
}

const SEO_PROMPT = `You are a Username Availability & SEO Quality Analysis engine.

Your task is to evaluate whether a username is:
- likely to be available across major platforms
- suitable for search visibility and discoverability
- easy to remember, spell, and pronounce

━━━━━━━━━━━━━━━━━━━━━━
INPUT
━━━━━━━━━━━━━━━━━━━━━━
Username: {{username}}

━━━━━━━━━━━━━━━━━━━━━━
EVALUATION CRITERIA
━━━━━━━━━━━━━━━━━━━━━━

1. Availability Likelihood
Estimate whether this username is:
- very common and likely already taken
- moderately unique
- highly unique and likely available

Base this on:
- word commonality
- length
- generic vs distinctive structure

2. SEO Friendliness
Evaluate whether the username:
- is easy to search
- avoids excessive ambiguity
- is not overly generic or meaningless
- could rank or be recognizable as a name

3. Memorability & Clarity
Evaluate whether the username:
- is easy to spell and pronounce
- is visually clean
- is easy to recall after one glance

━━━━━━━━━━━━━━━━━━━━━━
SCORING RULES
━━━━━━━━━━━━━━━━━━━━━━
- Each category scored from 0 to 100
- Higher score = better
- Be realistic and conservative
- Do NOT claim real-time availability checks

━━━━━━━━━━━━━━━━━━━━━━
FINAL VERDICT
━━━━━━━━━━━━━━━━━━━━━━
Classify the username as ONE:
- STRONG CHOICE ✅
- AVERAGE ⚠️
- WEAK ❌

━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON ONLY)
━━━━━━━━━━━━━━━━━━━━━━

{
  "username": "{{username}}",
  "scores": {
    "availability_likelihood": number,
    "seo_friendliness": number,
    "memorability_clarity": number
  },
  "final_verdict": "STRONG CHOICE | AVERAGE | WEAK",
  "summary": "One short sentence explaining the overall assessment."
}

━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━
- Do NOT claim real-time platform or domain checks
- Do NOT mention private or proprietary databases
- Base analysis only on linguistic and structural patterns
- Output JSON only`;

export async function analyzeSEO(username: string): Promise<SEOAnalysis> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://usernamescan.vercel.app",
                "X-Title": "UsernameScan",
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: SEO_PROMPT.replace("{{username}}", username) },
                    { role: "user", content: `Analyze this username: ${username}` },
                ],
                temperature: 0.3,
                max_tokens: 500,
                response_format: { type: "json_object" }
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";

        if (!content) {
            throw new Error("No content in API response");
        }

        try {
            const jsonStart = content.indexOf('{');
            const jsonEnd = content.lastIndexOf('}');
            if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON format");

            const jsonStr = content.substring(jsonStart, jsonEnd + 1);
            const result = JSON.parse(jsonStr) as SEOAnalysis;

            if (!result.scores || !result.final_verdict) {
                throw new Error("Incomplete analysis result");
            }

            return result;
        } catch (e) {
            console.error("Failed to parse AI response:", content);
            throw new Error("Failed to parse analysis results");
        }

    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error("Request timed out");
        }
        throw error;
    }
}
