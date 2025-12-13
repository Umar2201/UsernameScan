import React from "react";
import {
    SiYoutube,
    SiGithub,
    SiReddit,
    SiInstagram,
    SiX,
    SiTiktok,
    SiTwitch,
    SiSteam,
    SiLinkedin,
    SiTelegram,

    SiProducthunt,
    SiSnapchat,
} from "react-icons/si";

export interface Platform {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    profileUrl: (username: string) => string;
    signupUrl: string;
}

export const platforms: Platform[] = [
    {
        id: "youtube",
        name: "YouTube",
        icon: <SiYoutube />,
        color: "text-red-600",
        profileUrl: (u) => `https://www.youtube.com/@${u}`,
        signupUrl: "https://www.youtube.com/account",
    },
    {
        id: "github",
        name: "GitHub",
        icon: <SiGithub />,
        color: "text-gray-900",
        profileUrl: (u) => `https://github.com/${u}`,
        signupUrl: "https://github.com/signup",
    },
    {
        id: "reddit",
        name: "Reddit",
        icon: <SiReddit />,
        color: "text-orange-600",
        profileUrl: (u) => `https://www.reddit.com/user/${u}`,
        signupUrl: "https://www.reddit.com/register/",
    },
    {
        id: "instagram",
        name: "Instagram",
        icon: <SiInstagram />,
        color: "text-pink-600",
        profileUrl: (u) => `https://www.instagram.com/${u}/`,
        signupUrl: "https://www.instagram.com/accounts/emailsignup/",
    },
    {
        id: "twitter",
        name: "X / Twitter",
        icon: <SiX />,
        color: "text-black",
        profileUrl: (u) => `https://x.com/${u}`,
        signupUrl: "https://x.com/i/flow/signup",
    },
    {
        id: "tiktok",
        name: "TikTok",
        icon: <SiTiktok />,
        color: "text-black",
        profileUrl: (u) => `https://www.tiktok.com/@${u}`,
        signupUrl: "https://www.tiktok.com/signup",
    },
    {
        id: "twitch",
        name: "Twitch",
        icon: <SiTwitch />,
        color: "text-purple-600",
        profileUrl: (u) => `https://twitch.tv/${u}`,
        signupUrl: "https://www.twitch.tv/signup",
    },
    {
        id: "steam",
        name: "Steam",
        icon: <SiSteam />,
        color: "text-blue-900",
        profileUrl: (u) => `https://steamcommunity.com/id/${u}`,
        signupUrl: "https://store.steampowered.com/join/",
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        icon: <SiLinkedin />,
        color: "text-blue-700",
        profileUrl: (u) => `https://www.linkedin.com/in/${u}`,
        signupUrl: "https://www.linkedin.com/signup",
    },
    {
        id: "telegram",
        name: "Telegram",
        icon: <SiTelegram />,
        color: "text-blue-500",
        profileUrl: (u) => `https://t.me/${u}`,
        signupUrl: "https://telegram.org/",
    },

    {
        id: "producthunt",
        name: "Product Hunt",
        icon: <SiProducthunt />,
        color: "text-orange-500",
        profileUrl: (u) => `https://www.producthunt.com/@${u}`,
        signupUrl: "https://www.producthunt.com/auth/sign-up",
    },
    {
        id: "snapchat",
        name: "Snapchat",
        icon: <SiSnapchat />,
        color: "text-yellow-500",
        profileUrl: (u) => `https://www.snapchat.com/add/${u}`,
        signupUrl: "https://accounts.snapchat.com/accounts/signup",
    },
];
