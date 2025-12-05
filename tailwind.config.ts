import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom dark theme colors
                dark: {
                    bg: "#0a0a0f",
                    card: "#13131a",
                    border: "#1e1e2e",
                    hover: "#1a1a24",
                },
                // Status colors
                available: {
                    DEFAULT: "#10b981",
                    bg: "rgba(16, 185, 129, 0.1)",
                },
                taken: {
                    DEFAULT: "#ef4444",
                    bg: "rgba(239, 68, 68, 0.1)",
                },
                unknown: {
                    DEFAULT: "#6b7280",
                    bg: "rgba(107, 114, 128, 0.1)",
                },
                // Accent gradient
                accent: {
                    start: "#8b5cf6",
                    end: "#06b6d4",
                },
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "shimmer": "shimmer 2s linear infinite",
                "gradient": "gradient 8s ease infinite",
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
            },
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                gradient: {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            backgroundSize: {
                "200%": "200% 200%",
            },
        },
    },
    plugins: [],
};

export default config;
