"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Film, Play, Shield, Sparkles } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="fixed inset-0 -z-20 bg-gradient-to-b from-[#0a0a14] via-black to-[#06080f]" />
            <div className="fixed inset-0 -z-10 opacity-70 bg-[radial-gradient(circle_at_10%_10%,rgba(97,73,255,0.22),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(76,211,255,0.22),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(255,139,197,0.18),transparent_30%)]" />

            <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <Film className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">DreamFactory</p>
                            <p className="text-sm font-semibold">Flow Edition</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:-translate-y-0.5 transition"
                    >
                        Launch Flow
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-5 pb-16 pt-14">
                <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                            <Sparkles className="h-4 w-4 text-amber-300" />
                            Where the next wave of storytelling happens with Veo
                        </div>
                        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                            Flow for DreamFactory. <br />
                            Cinematic clips, scenes, and stories—without cold starts.
                        </h1>
                        <p className="max-w-2xl text-lg text-white/70">
                            Route intent, script with rationale, iterate with self-healing image QA, and ship Veo cuts
                            with reliable fallbacks. One pipeline, ready to launch.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 rounded-full bg-white text-black px-5 py-3 text-sm font-semibold shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition"
                            >
                                Open Flow Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <button className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 hover:border-white/50">
                                Watch the pipeline
                                <Play className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-300" />
                                Consistency QA loop
                            </div>
                            <div className="flex items-center gap-2">
                                <Film className="h-4 w-4 text-sky-300" />
                                Veo 3.1 + Gemini
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 via-white/0 to-white/0">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08),transparent_40%)]" />
                        <div className="flex h-full flex-col justify-between p-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    Update
                                </div>
                                <h2 className="text-2xl font-semibold">Veo 3.1 + New Controls</h2>
                                <p className="text-sm text-white/70">
                                    Audio, fine-grain editing, and higher quality outputs—mirrored in DreamFactory Flow.
                                </p>
                            </div>
                            <div className="relative mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/60">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-transparent to-blue-500/30" />
                                <div className="flex h-28 items-center justify-center text-sm text-white/70">
                                    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                                        <Play className="h-4 w-4" />
                                        <span>Preview demo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
