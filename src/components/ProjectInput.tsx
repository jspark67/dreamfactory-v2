"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { ProductionBible } from "@/agents/writer";

interface ProjectInputProps {
    onSubmit: (topic: string, productionBible: ProductionBible) => void;
    isLoading?: boolean;
}

export const ProjectInput: React.FC<ProjectInputProps> = ({
    onSubmit,
    isLoading = false,
}) => {
    const [topic, setTopic] = useState("");
    const [genre, setGenre] = useState("sci-fi");
    const [tone, setTone] = useState("dramatic");
    const [visualStyle, setVisualStyle] = useState("cinematic");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const productionBible: ProductionBible = {
            genre,
            tone,
            visualStyle,
            characters: {}, // Can be extended later
        };

        onSubmit(topic, productionBible);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
                <label htmlFor="topic" className="block text-sm font-medium text-gray-300">
                    What's your story about?
                </label>
                <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The future of AI, A day in the life of a robot, etc."
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                    disabled={isLoading}
                />
            </div>

            {/* Production Bible */}
            <div className="glass-effect rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Production Bible</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Genre */}
                    <div className="space-y-2">
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-300">
                            Genre
                        </label>
                        <select
                            id="genre"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading}
                        >
                            <option value="sci-fi">Sci-Fi</option>
                            <option value="fantasy">Fantasy</option>
                            <option value="horror">Horror</option>
                            <option value="comedy">Comedy</option>
                            <option value="drama">Drama</option>
                            <option value="documentary">Documentary</option>
                        </select>
                    </div>

                    {/* Tone */}
                    <div className="space-y-2">
                        <label htmlFor="tone" className="block text-sm font-medium text-gray-300">
                            Tone
                        </label>
                        <select
                            id="tone"
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading}
                        >
                            <option value="dramatic">Dramatic</option>
                            <option value="lighthearted">Lighthearted</option>
                            <option value="suspenseful">Suspenseful</option>
                            <option value="inspirational">Inspirational</option>
                            <option value="mysterious">Mysterious</option>
                        </select>
                    </div>

                    {/* Visual Style */}
                    <div className="space-y-2">
                        <label htmlFor="visualStyle" className="block text-sm font-medium text-gray-300">
                            Visual Style
                        </label>
                        <select
                            id="visualStyle"
                            value={visualStyle}
                            onChange={(e) => setVisualStyle(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading}
                        >
                            <option value="cinematic">Cinematic</option>
                            <option value="anime">Anime</option>
                            <option value="realistic">Realistic</option>
                            <option value="stylized">Stylized</option>
                            <option value="minimalist">Minimalist</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Your Short...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Create Short
                    </>
                )}
            </button>
        </form>
    );
};
