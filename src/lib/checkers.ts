import { platforms } from "./platforms";

export type PlatformStatus = "available" | "taken" | "unknown";

export interface PlatformResult {
    platformId: string;
    status: PlatformStatus;
    profileUrl: string;
}

const TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// List of CORS proxies to try in order
const PROXIES = [
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// Helper to fetch using multiple proxies until one works
// Returns the response and its text content
async function fetchWithFallback(targetUrl: string): Promise<{ status: number; text: string } | null> {
    for (const proxyGen of PROXIES) {
        try {
            const proxyUrl = proxyGen(targetUrl);
            const res = await fetchWithTimeout(proxyUrl);

            // If we get a valid status code (200 or 404), return the response
            if (res.status === 200 || res.status === 404) {
                const text = await res.text();
                return { status: res.status, text };
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

// Helper: Check if text contains the username (case insensitive)
// Used to verify if we actually landed on a profile page
function hasUsernameInTitle(html: string, username: string): boolean {
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch) return false;
    const title = titleMatch[1].toLowerCase();
    return title.includes(username.toLowerCase());
}

// 1. GitHub: Use API (Direct, Reliable)
async function checkGithub(username: string): Promise<PlatformStatus> {
    try {
        const res = await fetchWithTimeout(`https://api.github.com/users/${username}`);
        if (res.status === 200) return "taken";
        if (res.status === 404) return "available";
        return "unknown";
    } catch {
        return "unknown";
    }
}

// 2. Reddit: Use JSON API (Direct, Reliable)
async function checkReddit(username: string): Promise<PlatformStatus> {
    try {
        const res = await fetchWithTimeout(`https://www.reddit.com/user/${username}/about.json`);
        if (!res.ok) {
            if (res.status === 404) return "available";
            return "unknown";
        }
        const data = await res.json();
        if (data && data.data && data.data.name) return "taken";
        return "available";
    } catch {
        return "unknown";
    }
}

// 3. Twitch: Positive Match Strategy
async function checkTwitch(username: string): Promise<PlatformStatus> {
    try {
        // Try Passport API directly first
        try {
            const res = await fetchWithTimeout(`https://passport.twitch.tv/usernames/${username}`, { method: "HEAD" });
            if (res.status === 200) return "taken";
            if (res.status === 204) return "available";
        } catch { }

        // Fallback: Check main page via proxy
        const res = await fetchWithFallback(`https://m.twitch.tv/${username}`);
        if (!res) return "unknown";

        if (res.status === 404) return "available";

        const lowerText = res.text.toLowerCase();

        // Negative checks (Explicit Not Found)
        if (
            lowerText.includes("content is unavailable") ||
            lowerText.includes("page not found") ||
            lowerText.includes("unless you've got a time machine")
        ) {
            return "available";
        }

        // Positive check: Does title contain username?
        // Twitch title is usually "Username - Twitch"
        if (hasUsernameInTitle(res.text, username)) {
            return "taken";
        }

        // If generic 200 OK but no username in title, likely a redirect to home -> Available
        return "available";
    } catch {
        return "unknown";
    }
}

// 4. ProductHunt: Positive Match Strategy
async function checkProductHunt(username: string): Promise<PlatformStatus> {
    const res = await fetchWithFallback(`https://www.producthunt.com/@${username}`);
    if (!res) return "unknown";

    if (res.status === 404) return "available";

    const lowerText = res.text.toLowerCase();
    if (lowerText.includes("page not found") || lowerText.includes("we couldn't find that")) {
        return "available";
    }

    // Positive check: Title should contain username
    if (hasUsernameInTitle(res.text, username)) {
        return "taken";
    }

    return "available";
}

// 5. Behance: Positive Match Strategy
async function checkBehance(username: string): Promise<PlatformStatus> {
    const res = await fetchWithFallback(`https://www.behance.net/${username}`);
    if (!res) return "unknown";

    if (res.status === 404) return "available";

    const lowerText = res.text.toLowerCase();
    if (lowerText.includes("we can't find that page") || lowerText.includes("oops! we can’t find that page")) {
        return "available";
    }

    // Positive check
    if (hasUsernameInTitle(res.text, username)) {
        return "taken";
    }

    return "available";
}

// 6. Dribbble: Positive Match Strategy
async function checkDribbble(username: string): Promise<PlatformStatus> {
    const res = await fetchWithFallback(`https://dribbble.com/${username}`);
    if (!res) return "unknown";

    if (res.status === 404) return "available";

    const lowerText = res.text.toLowerCase();
    if (lowerText.includes("whoops, that page is gone") || lowerText.includes("404")) {
        return "available";
    }

    // Positive check
    if (hasUsernameInTitle(res.text, username)) {
        return "taken";
    }

    return "available";
}

// 7. Pinterest: Positive Match Strategy
async function checkPinterest(username: string): Promise<PlatformStatus> {
    const res = await fetchWithFallback(`https://www.pinterest.com/${username}/`);
    if (!res) return "unknown";

    if (res.status === 404) return "available";

    const lowerText = res.text.toLowerCase();
    if (lowerText.includes("user not found") || lowerText.includes("sorry, we couldn't find that page")) {
        return "available";
    }

    // Positive check
    if (hasUsernameInTitle(res.text, username)) {
        return "taken";
    }

    return "available";
}

export async function runChecks(username: string): Promise<PlatformResult[]> {
    const checks = [
        { id: "github", fn: checkGithub },
        { id: "reddit", fn: checkReddit },
        { id: "twitch", fn: checkTwitch },
        { id: "producthunt", fn: checkProductHunt },
        { id: "behance", fn: checkBehance },
        { id: "dribbble", fn: checkDribbble },
        { id: "pinterest", fn: checkPinterest },
    ];

    const results = await Promise.all(
        checks.map(async ({ id, fn }) => {
            const status = await fn(username);
            const platform = platforms.find((p) => p.id === id)!;
            return {
                platformId: id,
                status,
                profileUrl: platform.profileUrl(username),
            };
        })
    );

    return results;
}
