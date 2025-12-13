
const MODEL = "mistralai/mistral-7b-instruct";
const TIMEOUT_MS = 15000;

export interface ReputationAnalysis {
    username: string;
    scores: {
        bot_likelihood: number;
        spam_association_risk: number;
        trust_perception: number;
    };
    final_verdict: "CLEAN" | "QUESTIONABLE" | "POOR";
    summary: string;
}

const REPUTATION_PROMPT = `You are a Username Reputation Analysis engine.

Your task is to assess whether a username shows signals of:
- prior bot usage
- spam or mass-created account patterns
- recycled or low-trust naming behavior

This analysis helps users avoid names that may carry
negative history or platform trust issues.

━━━━━━━━━━━━━━━━━━━━━━
INPUT
━━━━━━━━━━━━━━━━━━━━━━
Username: {{username}}

━━━━━━━━━━━━━━━━━━━━━━
EVALUATION CRITERIA
━━━━━━━━━━━━━━━━━━━━━━

1. Bot / Automation Likelihood
Evaluate whether the username:
- matches common bot or mass-generated patterns
- contains random-looking sequences
- feels mechanically constructed

2. Spam / Abuse Association Risk
Evaluate whether the username:
- resembles usernames often used in spam or abuse
- feels disposable or low-effort
- lacks personal or brand identity

3. Trust Perception
Evaluate whether the username:
- feels trustworthy to a human user
- would be taken seriously on public platforms

━━━━━━━━━━━━━━━━━━━━━━
SCORING RULES
━━━━━━━━━━━━━━━━━━━━━━
- Each category scored from 0 to 100
- Higher score = better reputation
- Be cautious and conservative
- If uncertain, slightly lower the score

━━━━━━━━━━━━━━━━━━━━━━
FINAL VERDICT
━━━━━━━━━━━━━━━━━━━━━━
Classify the username into ONE:
- CLEAN 🟢
- QUESTIONABLE 🟡
- POOR 🔴

━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON ONLY)
━━━━━━━━━━━━━━━━━━━━━━

{
  "username": "{{username}}",
  "scores": {
    "bot_likelihood": number,
    "spam_association_risk": number,
    "trust_perception": number
  },
  "final_verdict": "CLEAN | QUESTIONABLE | POOR",
  "summary": "One short sentence explaining the reputation assessment."
}

━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━
- Do NOT claim access to platform databases
- Do NOT state historical certainty
- Base judgments on naming patterns only
- Output JSON only`;

export async function analyzeReputation(username: string): Promise<ReputationAnalysis> {
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
                    { role: "system", content: REPUTATION_PROMPT.replace("{{username}}", username) },
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
            const result = JSON.parse(jsonStr) as ReputationAnalysis;

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
