import { platforms } from "./platforms";

export type PlatformStatus = "available" | "taken" | "unknown";

export interface PlatformResult {
    platformId: string;
    status: PlatformStatus;
    profileUrl: string;
}

async function checkPlatform(username: string, platformId: string): Promise<PlatformStatus> {
    try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}&platform=${platformId}`);
        if (!res.ok) return "unknown";
        const data = await res.json();
        return data.status;
    } catch {
        return "unknown";
    }
}

export async function runChecks(username: string): Promise<PlatformResult[]> {
    const results = await Promise.all(
        platforms.map(async (platform) => {
            const status = await checkPlatform(username, platform.id);
            return {
                platformId: platform.id,
                status,
                profileUrl: platform.profileUrl(username),
            };
        })
    );

    return results;
}
