
const MODEL = "mistralai/mistral-7b-instruct";
const TIMEOUT_MS = 15000;

export interface SafetyAnalysis {
    username: string;
    scores: {
        scam_spam_risk: number;
        brand_safety: number;
        impersonation_confusion_risk: number;
    };
    final_verdict: "SAFE" | "USE WITH CAUTION" | "HIGH RISK";
    summary: string;
}

const SAFETY_PROMPT = `You are a Username Risk & Safety Evaluation engine.

Your sole responsibility is to assess whether a given username is
SAFE or RISKY to use in public on social platforms.

This analysis helps users avoid:
- scam-looking usernames
- spam or bot-like patterns
- untrustworthy first impressions
- brand-damaging names

━━━━━━━━━━━━━━━━━━━━━━
INPUT
━━━━━━━━━━━━━━━━━━━━━━
Username: {{username}}

━━━━━━━━━━━━━━━━━━━━━━
EVALUATION CRITERIA
━━━━━━━━━━━━━━━━━━━━━━

Evaluate the username across the following dimensions:

1. Scam / Spam Risk
- Does it resemble scam, phishing, or fake-account patterns?
- Does it use suspicious numbers, symbols, or misleading wording?
- Does it feel untrustworthy at first glance?

2. Brand Safety
- Does it sound clean and professional?
- Would a real creator or business confidently use it long-term?
- Does it avoid shady or misleading signals?

3. Impersonation / Confusion Risk
- Does it look like it imitates a known brand, platform, or person?
- Could it confuse users or appear deceptive?

━━━━━━━━━━━━━━━━━━━━━━
SCORING RULES
━━━━━━━━━━━━━━━━━━━━━━
- Each category must be scored from 0 to 100
- Higher score = safer
- Be conservative and realistic
- If uncertain, slightly lower the score rather than inflating it

━━━━━━━━━━━━━━━━━━━━━━
FINAL VERDICT
━━━━━━━━━━━━━━━━━━━━━━
Classify the username into ONE category:
- SAFE ✅
- USE WITH CAUTION ⚠️
- HIGH RISK 🚨

━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON ONLY)
━━━━━━━━━━━━━━━━━━━━━━

{
  "username": "{{username}}",
  "scores": {
    "scam_spam_risk": number,
    "brand_safety": number,
    "impersonation_confusion_risk": number
  },
  "final_verdict": "SAFE | USE WITH CAUTION | HIGH RISK",
  "summary": "One short, clear sentence explaining why the username received this verdict."
}

━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━
- Do NOT mention training data or private databases
- Do NOT claim certainty beyond linguistic and pattern-based analysis
- Do NOT add extra fields
- Output JSON only, no explanations outside JSON`;

export async function analyzeUsername(username: string): Promise<SafetyAnalysis> {
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
                    { role: "system", content: SAFETY_PROMPT.replace("{{username}}", username) },
                    { role: "user", content: `Analyze this username: ${username}` },
                ],
                temperature: 0.3, // Lower temperature for consistent analysis
                max_tokens: 500,
                response_format: { type: "json_object" } // Enforce JSON if supported, or just prompt
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
            // Parse JSON from content
            const jsonStart = content.indexOf('{');
            const jsonEnd = content.lastIndexOf('}');
            if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON format");

            const jsonStr = content.substring(jsonStart, jsonEnd + 1);
            const result = JSON.parse(jsonStr) as SafetyAnalysis;

            // Validate structure
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
