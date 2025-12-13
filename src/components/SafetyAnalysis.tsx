"use client";

import React, { useState, useEffect } from "react";

interface SafetyAnalysisResult {
    username: string;
    scores: {
        scam_spam_risk: number;
        brand_safety: number;
        impersonation_confusion_risk: number;
    };
    final_verdict: "SAFE" | "USE WITH CAUTION" | "HIGH RISK";
    summary: string;
}

interface SEOAnalysisResult {
    username: string;
    scores: {
        availability_likelihood: number;
        seo_friendliness: number;
        memorability_clarity: number;
    };
    final_verdict: "STRONG CHOICE" | "AVERAGE" | "WEAK";
    summary: string;
}

interface ReputationAnalysisResult {
    username: string;
    scores: {
        bot_likelihood: number;
        spam_association_risk: number;
        trust_perception: number;
    };
    final_verdict: "CLEAN" | "QUESTIONABLE" | "POOR";
    summary: string;
}

type AnalysisType = "safety" | "seo" | "reputation";

interface SafetyAnalysisProps {
    username: string;
}

export function SafetyAnalysis({ username }: SafetyAnalysisProps) {
    const [activeTab, setActiveTab] = useState<AnalysisType>("safety");
    const [results, setResults] = useState<{
        safety: SafetyAnalysisResult | null;
        seo: SEOAnalysisResult | null;
        reputation: ReputationAnalysisResult | null;
    }>({ safety: null, seo: null, reputation: null });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    const [alternatives, setAlternatives] = useState<string[]>([]);
    const [loadingAlternatives, setLoadingAlternatives] = useState(false);

    const analyze = async (type: AnalysisType) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/analyze-username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, type }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Analysis failed");

            setResults(prev => ({ ...prev, [type]: data.analysis }));
        } catch (err) {
            setError("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const generateAlternatives = async () => {
        setLoadingAlternatives(true);
        try {
            const res = await fetch("/api/ai-usernames", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ baseName: username }),
            });
            const data = await res.json();
            if (data.suggestions) {
                // Flatten the categories to a single list for simplicity or take top picks
                const allSuggestions = Object.values(data.suggestions).flat() as string[];
                setAlternatives(allSuggestions.slice(0, 8)); // Show top 8
            }
        } catch (err) {
            console.error("Failed to generate alternatives", err);
        } finally {
            setLoadingAlternatives(false);
        }
    };

    const handleTabChange = (tab: AnalysisType) => {
        setActiveTab(tab);
        if (!results[tab] && !loading) {
            analyze(tab);
        }
    };

    const startAnalysis = () => {
        setInitialized(true);
        analyze("safety");
    };

    const getVerdictColor = (verdict: string) => {
        if (["SAFE", "STRONG CHOICE", "CLEAN"].includes(verdict)) return "bg-green-100 text-green-800 border-green-200";
        if (["HIGH RISK", "WEAK", "POOR"].includes(verdict)) return "bg-red-100 text-red-800 border-red-200";
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getVerdictTitle = (verdict: string) => {
        if (["SAFE", "STRONG CHOICE", "CLEAN"].includes(verdict)) return "✅ Recommended";
        if (["HIGH RISK", "WEAK", "POOR"].includes(verdict)) return "🚨 Not Recommended";
        return "⚠️ Use With Caution";
    };

    const getComparisonText = (score: number) => {
        if (score >= 80) return "Compared to most usernames, this one is significantly safer and more professional.";
        if (score >= 50) return "Compared to most usernames, this one is average but could be improved.";
        return "Compared to most usernames, this one carries higher risks.";
    };

    if (!initialized) {
        return (
            <div className="w-full max-w-5xl mx-auto mt-8 px-4">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Advanced Username Analysis</h3>
                    <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                        Evaluate <strong>{username}</strong> for Safety, SEO Quality, and Reputation signals.
                    </p>
                    <button
                        onClick={startAnalysis}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        🛡️ Analyze Username
                    </button>
                </div>
            </div>
        );
    }

    const renderScores = () => {
        const currentResult = results[activeTab];
        if (!currentResult) return null;

        const scores = currentResult.scores;
        const entries = Object.entries(scores);
        const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / entries.length;

        return (
            <div className="space-y-8">
                {/* Final Verdict Card */}
                <div className={`p-6 rounded-xl border-l-4 shadow-sm ${currentResult.final_verdict.includes("SAFE") || currentResult.final_verdict.includes("STRONG") || currentResult.final_verdict.includes("CLEAN") ? "bg-green-50 border-green-500" : currentResult.final_verdict.includes("HIGH") || currentResult.final_verdict.includes("WEAK") || currentResult.final_verdict.includes("POOR") ? "bg-red-50 border-red-500" : "bg-yellow-50 border-yellow-500"}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        {getVerdictTitle(currentResult.final_verdict)}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                        {currentResult.summary}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Scores Section */}
                    <div className="space-y-6">
                        {entries.map(([key, score]) => (
                            <div key={key}>
                                <div className="flex justify-between text-sm font-medium mb-2 capitalize">
                                    <span className="text-gray-700">{key.replace(/_/g, " ")}</span>
                                    <span className="text-gray-500">{score}/100</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(score)}`}
                                        style={{ width: `${score}%` }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Comparison Hint */}
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 italic flex items-center gap-2">
                                💡 {getComparisonText(avgScore)}
                            </p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Next Steps</h4>
                            <p className="text-gray-600 text-sm mb-6">
                                Not satisfied with this result? Our AI can generate optimized, safer alternatives for you.
                            </p>
                        </div>

                        <button
                            onClick={generateAlternatives}
                            disabled={loadingAlternatives}
                            className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex justify-center items-center gap-2"
                        >
                            {loadingAlternatives ? (
                                <span className="animate-spin">↻</span>
                            ) : (
                                "✨ Generate Safer Alternatives"
                            )}
                        </button>
                    </div>
                </div>

                {/* Alternatives List */}
                {alternatives.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-100 animate-fadeIn">
                        <h4 className="font-bold text-gray-800 mb-4">Recommended Alternatives</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {alternatives.map((alt, i) => (
                                <div key={i} className="p-3 bg-indigo-50 text-indigo-700 rounded-lg text-center font-medium text-sm border border-indigo-100">
                                    {alt}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-8 px-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/50">
                    <button
                        onClick={() => handleTabChange("safety")}
                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "safety" ? "text-indigo-600 border-b-2 border-indigo-600 bg-white" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        🛡️ Risk & Safety
                    </button>
                    <button
                        onClick={() => handleTabChange("seo")}
                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "seo" ? "text-indigo-600 border-b-2 border-indigo-600 bg-white" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        📈 SEO & Quality
                    </button>
                    <button
                        onClick={() => handleTabChange("reputation")}
                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "reputation" ? "text-indigo-600 border-b-2 border-indigo-600 bg-white" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        ⭐ Reputation
                    </button>
                </div>

                <div className="p-6 sm:p-8">
                    {loading ? (
                        <div className="animate-pulse space-y-6">
                            <div className="h-24 bg-gray-100 rounded-xl w-full mb-6"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                </div>
                                <div className="h-32 bg-gray-200 rounded-xl"></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button onClick={() => analyze(activeTab)} className="text-indigo-600 font-medium">Try Again</button>
                        </div>
                    ) : results[activeTab] ? (
                        renderScores()
                    ) : null}
                </div>
            </div>
        </div>
    );
}
