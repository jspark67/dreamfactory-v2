"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CollaborationProvider, useCollaboration } from "@/providers/CollaborationProvider";
import { MoviePlayer } from "@/components/preview/MoviePlayer";
import { AspectRatio, GenerationMode, Resolution, VeoModel, GenerateVideoParams } from "@/types/flow";
import { ChevronRight, Loader2, Menu, Pencil, Search } from "lucide-react";
import PromptForm from "@/components/PromptForm";

import Link from "next/link";

type Mode = "video" | "image";

const WorkspaceContent = ({ projectId }: { projectId: string }) => {
    const { scenes, loading } = useCollaboration();
    const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>("video");
    const [lastParams, setLastParams] = useState<GenerateVideoParams | null>(null);

    const defaultProjectName = useMemo(() => {
        const now = new Date();
        const date = now.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
        });
        const time = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        return `${date} - ${time}`;
    }, []);
    const [projectName, setProjectName] = useState<string>(defaultProjectName);
    const [isEditingName, setIsEditingName] = useState<boolean>(false);

    // Sync project name from localStorage on mount
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const saved = window.localStorage.getItem("df-projects");
            if (saved) {
                const parsed = JSON.parse(saved) as { id: string; title: string }[];
                const found = parsed.find((p) => p.id === projectId);
                if (found) {
                    setProjectName(found.title);
                }
            }
        } catch (e) {
            console.error("Failed to load project name", e);
        }
    }, [projectId]);

    const activeScene = useMemo(
        () => scenes.find((s) => s.sceneId === activeSceneId) || scenes[0],
        [activeSceneId, scenes]
    );

    const handleGenerate = async (
        step: "writing" | "drawing" | "directing",
        input: Record<string, unknown>
    ) => {
        try {
            const response = await fetch("/api/orchestrator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, step, input }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
        } catch (error) {
            console.error("Generation failed:", error);
            alert("Generation failed. Check console.");
        }
    };

    const handlePromptFormSubmit = (params: GenerateVideoParams) => {
        setLastParams(params);
        if (params.mode === GenerationMode.TEXT_TO_IMAGE) {
            setMode("image");
            handleGenerate("drawing", {
                visualPrompt: params.prompt,
                referenceImageUrls: params.referenceImages?.map((img) => img.base64) || [],
                sceneId: activeScene?.sceneId,
                mode: params.mode,
                model: params.model,
                aspectRatio: params.aspectRatio,
                resolution: params.resolution,
            });
        } else {
            setMode("video");
            handleGenerate("directing", {
                imageUrl: activeScene?.imageUrl,
                script: activeScene?.script,
                visualPrompt: params.prompt,
                sceneId: activeScene?.sceneId,
                mode: params.mode,
                model: params.model,
                aspectRatio: params.aspectRatio,
                resolution: params.resolution,
                inputVideo: params.inputVideo,
                startFrame: params.startFrame,
                endFrame: params.endFrame,
                isLooping: params.isLooping,
            });
        }
    };

    const handleRetryVideo = () => {
        if (lastParams) {
            handlePromptFormSubmit(lastParams);
        } else if (activeScene) {
            handleGenerate("directing", {
                imageUrl: activeScene.imageUrl,
                script: activeScene.script,
                visualPrompt: activeScene.visualPrompt,
                sceneId: activeScene.sceneId,
                mode: GenerationMode.TEXT_TO_VIDEO,
                model: VeoModel.VEO_FAST,
                aspectRatio: AspectRatio.LANDSCAPE,
                resolution: Resolution.P720,
            });
        }
    };

    const videoModelLabel =
        lastParams?.model === VeoModel.VEO ? "Veo 3.1" : "Veo 3.1 - Fast";

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-black text-white"><Loader2 className="animate-spin mr-2" /> Loading Workspace...</div>;
    }

    return (
        <div className="relative min-h-screen bg-black text-white">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-32 pt-8">
                <header className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
                    <div className="flex flex-wrap items-center gap-3">
                        <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors">
                            DreamFactory
                        </Link>
                        <ChevronRight className="h-4 w-4 text-white/40" />
                        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
                            {isEditingName ? (
                                <input
                                    autoFocus
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value || defaultProjectName)}
                                    onBlur={() => setIsEditingName(false)}
                                    className="bg-transparent text-base font-semibold text-white outline-none"
                                    aria-label="Project name"
                                />
                            ) : (
                                <span className="text-base font-semibold text-white">{projectName}</span>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsEditingName(true)}
                                className="rounded-full p-1 hover:bg-white/10"
                                aria-label="프로젝트 수정"
                                title="프로젝트 수정"
                            >
                                <Pencil className="h-4 w-4 text-white/60" />
                            </button>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/40" />
                        <span className="text-white/50">장면 빌더</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-white/60 sm:flex">
                            <span className="text-white/50">클립 검색</span>
                            <Search className="h-4 w-4" />
                        </button>
                        <button aria-label="Menu" className="rounded-full p-2 hover:bg-white/10">
                            <Menu className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-xs">Live</span>
                        </div>
                    </div>
                </header>

                <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <div className="flex overflow-hidden rounded-full border border-white/10 bg-white/5">
                        <button
                            onClick={() => setMode("video")}
                            className={`px-4 py-2 ${mode === "video" ? "bg-white/20 text-white" : "text-white/70"}`}
                        >
                            Videos
                        </button>
                        <button
                            onClick={() => setMode("image")}
                            className={`px-4 py-2 ${mode === "image" ? "bg-white/20 text-white" : "text-white/70"}`}
                        >
                            Images
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f]">
                        <div className="relative">
                            {activeScene ? (
                                <MoviePlayer scene={activeScene} />
                            ) : (
                                <div className="flex aspect-video flex-col items-center justify-center gap-4 text-white/40">
                                    <div className="rounded-full bg-white/5 p-4">
                                        <Search className="h-8 w-8 opacity-50" />
                                    </div>
                                    <p>시작하려면 프롬프트 상자에 입력하세요.</p>
                                </div>
                            )}
                            <div className="absolute right-4 bottom-4 flex items-center gap-2 text-xs">
                                <span className="rounded-full bg-black/70 px-3 py-1 text-white/80">{videoModelLabel}</span>
                                <button
                                    aria-label="Open menu"
                                    className="rounded-full bg-black/70 p-2 text-white/70 hover:text-white"
                                    onClick={handleRetryVideo}
                                >
                                    …
                                </button>
                            </div>
                        </div>
                        <div className="px-5 py-4">
                            <p className="text-sm text-white/70">
                                {activeScene?.script || activeScene?.visualPrompt || "Give it to me"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-white/60">
                        <span>씬 선택</span>
                        <span>총 {scenes.length}개</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {scenes.map((scene) => (
                            <button
                                key={scene.sceneId}
                                onClick={() => setActiveSceneId(scene.sceneId)}
                                className={`relative h-20 min-w-[120px] overflow-hidden rounded-xl border ${activeSceneId === scene.sceneId
                                    ? "border-blue-400 ring-1 ring-blue-400/50"
                                    : "border-white/10 opacity-70 hover:opacity-100"
                                    }`}
                            >
                                {scene.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={scene.imageUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-white/5 text-[11px] text-white/60">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute bottom-1 right-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                                    {scene.sequenceNumber ?? "-"}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/85 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-white/60">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-white">프롬프트 다이얼로그</span>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-white/70">{videoModelLabel}</span>
                    </div>
                    <PromptForm onGenerate={handlePromptFormSubmit} initialValues={lastParams} />
                    <p className="text-[11px] text-white/40">Flow는 실수를 할 수 있으니 다시 한번 확인하세요.</p>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function ProjectPage() {
    const params = useParams();
    const projectId = params.id as string;

    return (
        <CollaborationProvider projectId={projectId}>
            <WorkspaceContent projectId={projectId} />
        </CollaborationProvider>
    );
}
