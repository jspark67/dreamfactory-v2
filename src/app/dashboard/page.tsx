"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bell,
    LayoutGrid,
    List,
    MoreHorizontal,
    Play,
    Plus,
    Search,
    Settings,
    Trash2,
    X,
} from "lucide-react";

type Project = {
    id: string;
    title: string;
    thumbnail: string;
    createdAt: number;
};

const fallbackThumbs = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
];

function formatTitle(date = new Date()) {
    return date
        .toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
        .replace(",", " -");
}

function makeId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `proj-${Date.now()}`;
}

export default function DashboardPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>(() => {
        if (typeof window === "undefined") return [];
        const saved = window.localStorage.getItem("df-projects");
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as Project[];
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch {
                // ignore corrupted storage
            }
        }
        const now = Date.now();
        return [
            { id: makeId(), title: formatTitle(new Date(now)), thumbnail: fallbackThumbs[0], createdAt: now },
            {
                id: makeId(),
                title: "Nov 24 - 17:48",
                thumbnail: fallbackThumbs[1],
                createdAt: now - 86400000,
            },
        ];
    });
    const [query, setQuery] = useState("");
    const [view, setView] = useState<"grid" | "list">("grid");
    const [sort, setSort] = useState<"newest" | "oldest">("newest");

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem("df-projects", JSON.stringify(projects));
        }
    }, [projects]);

    const handleAdd = () => {
        const next: Project = {
            id: makeId(),
            title: formatTitle(),
            thumbnail: fallbackThumbs[Math.floor(Math.random() * fallbackThumbs.length)],
            createdAt: Date.now(),
        };
        setProjects((prev) => [next, ...prev]);
        router.push(`/project/${next.id}`);
    };

    const handleTitleChange = (id: string, title: string) => {
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, title } : p)));
    };

    const handleDelete = (id: string) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
    };

    const filtered = useMemo(() => {
        const normalized = query.toLowerCase().trim();
        const sorted = [...projects].sort((a, b) =>
            sort === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
        );
        if (!normalized) return sorted;
        return sorted.filter((p) => p.title.toLowerCase().includes(normalized) || p.id.toLowerCase().includes(normalized));
    }, [projects, query, sort]);

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="fixed inset-0 -z-20 bg-gradient-to-b from-[#0a0a14] via-black to-[#06080f]" />
            <div className="fixed inset-0 -z-10 opacity-70 bg-[radial-gradient(circle_at_10%_10%,rgba(97,73,255,0.22),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(76,211,255,0.22),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(255,139,197,0.18),transparent_30%)]" />

            <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">Flow</span>
                        <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                            Flow TV
                        </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/70">
                        <button aria-label="Notifications">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button aria-label="Settings">
                            <Settings className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-xs">beta</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 space-y-10">
                <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 via-white/5 to-white/0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08),transparent_40%)]" />
                    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Update
                            </div>
                            <h1 className="text-3xl font-semibold sm:text-4xl">Veo 3.1 + New Controls</h1>
                            <p className="max-w-2xl text-sm text-white/70">
                                Bringing audio, precise editing, and higher quality outputs powered by Veo 3.1. Flow for
                                DreamFactory keeps the same cinematic defaults.
                            </p>
                        </div>
                        <div className="relative h-28 w-full max-w-xs overflow-hidden rounded-xl border border-white/10 bg-black/60">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-transparent to-blue-500/30" />
                            <div className="flex h-full items-center justify-center text-sm text-white/70">
                                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                                    <Play className="h-4 w-4" />
                                    <span>Watch demo</span>
                                </div>
                            </div>
                            <button
                                aria-label="Close banner"
                                className="absolute right-2 top-2 rounded-full bg-black/40 p-1 text-white/70 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            <span className="rounded-full bg-white/10 px-3 py-1">Projects</span>
                            <span className="rounded-full border border-white/10 px-3 py-1">Veo 3.1</span>
                            <span className="rounded-full border border-white/10 px-3 py-1">Gemini</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/70">
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                <Search className="h-4 w-4" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search projects"
                                    className="w-28 bg-transparent text-sm outline-none placeholder:text-white/40"
                                />
                            </div>
                            <button
                                onClick={() => setSort((prev) => (prev === "newest" ? "oldest" : "newest"))}
                                className="rounded-full border border-white/10 px-3 py-1"
                            >
                                {sort === "newest" ? "Newest" : "Oldest"}
                            </button>
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                                <button
                                    aria-label="Grid view"
                                    onClick={() => setView("grid")}
                                    className={`rounded-full p-2 ${view === "grid" ? "bg-white/10" : ""}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    aria-label="List view"
                                    onClick={() => setView("list")}
                                    className={`rounded-full p-2 ${view === "list" ? "bg-white/10" : ""}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {view === "grid" ? (
                        <div className="grid gap-5 md:grid-cols-3">
                            {filtered.map((project) => (
                                <div
                                    key={project.id}
                                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-blue-500/5"
                                >
                                    <Link href={`/project/${project.id}`} className="block">
                                        <div className="relative aspect-video overflow-hidden">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url(${project.thumbnail})` }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs">
                                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                                Veo 3.1
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <div className="max-w-[70%]">
                                            <input
                                                value={project.title}
                                                onChange={(e) => handleTitleChange(project.id, e.target.value)}
                                                className="w-full bg-transparent text-sm font-semibold text-white/90 outline-none"
                                                aria-label="Project title"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={`/project/${project.id}`}
                                                className="rounded-full border border-white/10 px-3 py-1 text-xs hover:bg-white/10"
                                            >
                                                Open
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="rounded-full p-2 text-red-400 hover:bg-white/10"
                                                aria-label="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <button className="rounded-full p-2 text-white/60 hover:bg-white/10" aria-label="More">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((project) => (
                                <div
                                    key={project.id}
                                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg shadow-blue-500/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-cover bg-center"
                                            style={{ backgroundImage: `url(${project.thumbnail})` }}
                                        />
                                        <div>
                                            <input
                                                value={project.title}
                                                onChange={(e) => handleTitleChange(project.id, e.target.value)}
                                                className="w-full bg-transparent text-sm font-semibold text-white/90 outline-none"
                                                aria-label="Project title"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Link
                                            href={`/project/${project.id}`}
                                            className="rounded-full border border-white/10 px-3 py-1 text-xs hover:bg-white/10"
                                        >
                                            Open
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="rounded-full p-2 text-red-400 hover:bg-white/10"
                                            aria-label="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <button className="rounded-full p-2 text-white/60 hover:bg-white/10" aria-label="More">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="flex justify-center">
                    <button
                        onClick={handleAdd}
                        className="flex min-w-[200px] flex-col items-center gap-2 rounded-full bg-white/10 px-6 py-5 text-sm font-semibold text-white/80 hover:bg-white/15"
                    >
                        <Plus className="h-5 w-5" />
                        새 프로젝트
                    </button>
                </section>
            </main>
        </div>
    );
}
