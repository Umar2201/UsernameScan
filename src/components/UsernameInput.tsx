import React from "react";

interface UsernameInputProps {
    onScan: (username: string) => void;
    loading: boolean;
}

export function UsernameInput({ onScan, loading }: UsernameInputProps) {
    const [username, setUsername] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onScan(username.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md mx-auto mt-6 sm:mt-8 px-4">
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-5 py-3 sm:px-6 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                disabled={loading}
            />
            <button
                type="submit"
                disabled={!username.trim() || loading}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
            >
                {loading ? "Scanning..." : "Scan Now"}
            </button>
        </form>
    );
}
