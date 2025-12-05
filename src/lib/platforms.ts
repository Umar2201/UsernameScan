export interface Platform {
    id: string;
    name: string;
    icon: string;
    profileUrl: (username: string) => string;
    signupUrl: string;
}

export const platforms: Platform[] = [
    {
        id: "github",
        name: "GitHub",
        icon: "🐙",
        profileUrl: (u) => `https://github.com/${u}`,
        signupUrl: "https://github.com/signup",
    },
    {
        id: "reddit",
        name: "Reddit",
        icon: "🤖",
        profileUrl: (u) => `https://www.reddit.com/user/${u}`,
        signupUrl: "https://www.reddit.com/register/",
    },
    {
        id: "twitch",
        name: "Twitch",
        icon: "📺",
        profileUrl: (u) => `https://twitch.tv/${u}`,
        signupUrl: "https://www.twitch.tv/signup",
    },
    {
        id: "producthunt",
        name: "Product Hunt",
        icon: "🚀",
        profileUrl: (u) => `https://www.producthunt.com/@${u}`,
        signupUrl: "https://www.producthunt.com/auth/sign-up",
    },
    {
        id: "behance",
        name: "Behance",
        icon: "🎨",
        profileUrl: (u) => `https://www.behance.net/${u}`,
        signupUrl: "https://www.behance.net/signup",
    },
    {
        id: "dribbble",
        name: "Dribbble",
        icon: "🏀",
        profileUrl: (u) => `https://dribbble.com/${u}`,
        signupUrl: "https://dribbble.com/signup/new",
    },
    {
        id: "pinterest",
        name: "Pinterest",
        icon: "📌",
        profileUrl: (u) => `https://www.pinterest.com/${u}/`,
        signupUrl: "https://www.pinterest.com/signup",
    },
];
