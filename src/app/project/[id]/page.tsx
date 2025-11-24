"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { CollaborationProvider, useCollaboration, SceneWithState } from "@/providers/CollaborationProvider";
import { MoviePlayer } from "@/components/preview/MoviePlayer";
import { Loader2, Play, Image as ImageIcon, Video, PenTool } from "lucide-react";

// --- Inner Component to access Context ---

const WorkspaceContent = ({ projectId }: { projectId: string }) => {
    const { scenes, loading, updateScene } = useCollaboration();
    const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const activeScene = scenes.find((s) => s.sceneId === activeSceneId) || scenes[0];

    const handleGenerate = async (step: "writing" | "drawing" | "directing", input: any) => {
        setIsProcessing(true);
        try {
            const response = await fetch("/api/orchestrator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, step, input }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            // Firestore listener will update the UI automatically
        } catch (error) {
            console.error("Generation failed:", error);
            alert("Generation failed. Check console.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-black text-white"><Loader2 className="animate-spin mr-2" /> Loading Workspace...</div>;
    }

    return (
        <div className="flex h-screen bg-neutral-900 text-white overflow-hidden font-sans">
            {/* Left Panel: Editor */}
            <div className="w-1/2 flex flex-col border-r border-neutral-800">
                <header className="h-14 border-b border-neutral-800 flex items-center px-4 justify-between bg-neutral-950">
                    <h1 className="font-bold text-lg tracking-tight">DreamFactory <span className="text-xs font-normal text-neutral-500">v2.0</span></h1>
                    <div className="flex items-center space-x-2">
                        {/* Mock Presence Avatars */}
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-neutral-900 flex items-center justify-center text-xs">JS</div>
                        <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-neutral-900 flex items-center justify-center text-xs">AI</div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Project Level Controls (Mock) */}
                    <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700">
                        <h2 className="text-sm font-semibold mb-2 text-neutral-400 uppercase tracking-wider">Writer Agent</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleGenerate('writing', {
                                    topic: "Cyberpunk detective in rain",
                                    productionBible: {
                                        genre: "Cyberpunk",
                                        tone: "Dark",
                                        visualStyle: "Neon Noir",
                                        characters: {}
                                    }
                                })}
                                disabled={isProcessing}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium flex items-center disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PenTool className="w-4 h-4 mr-2" />}
                                Generate Script
                            </button>
                        </div>
                    </div>

                    {scenes.map((scene) => (
                        <div
                            key={scene.sceneId}
                            className={`p-4 rounded-xl border transition-all ${activeSceneId === scene.sceneId ? 'border-blue-500 bg-blue-900/10' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}
                            onClick={() => setActiveSceneId(scene.sceneId)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-mono text-neutral-500">SCENE {scene.sequenceNumber}</span>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleGenerate('drawing', {
                                                visualPrompt: scene.visualPrompt,
                                                referenceImageUrls: [], // TODO: Add reference images
                                                sceneId: scene.sceneId
                                            });
                                        }}
                                        className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                                        title="Generate Image"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleGenerate('directing', {
                                                imageUrl: scene.imageUrl,
                                                script: scene.script,
                                                visualPrompt: scene.visualPrompt,
                                                sceneId: scene.sceneId
                                            });
                                        }}
                                        className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
                                        title="Generate Video"
                                    >
                                        <Video className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">Script</label>
                                    <textarea
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-300 focus:border-blue-500 focus:outline-none transition-colors"
                                        rows={3}
                                        value={scene.script}
                                        onChange={(e) => updateScene(scene.sceneId, { script: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">Visual Prompt</label>
                                    <textarea
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs text-neutral-400 focus:border-blue-500 focus:outline-none transition-colors"
                                        rows={2}
                                        value={scene.visualPrompt}
                                        onChange={(e) => updateScene(scene.sceneId, { visualPrompt: e.target.value })}
                                    />
                                </div>
                                {scene.rationale && (
                                    <div className="bg-blue-900/20 border border-blue-900/50 p-2 rounded text-xs text-blue-300">
                                        <span className="font-semibold">AI Rationale:</span> {scene.rationale}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Preview */}
            <div className="w-1/2 bg-black flex flex-col">
                <div className="flex-1 relative">
                    <MoviePlayer scene={activeScene} />
                </div>
                <div className="h-48 border-t border-neutral-800 bg-neutral-900 p-4">
                    <h3 className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider">Timeline</h3>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {scenes.map(scene => (
                            <div
                                key={scene.sceneId}
                                onClick={() => setActiveSceneId(scene.sceneId)}
                                className={`flex-shrink-0 w-32 h-20 rounded border cursor-pointer overflow-hidden relative ${activeSceneId === scene.sceneId ? 'border-blue-500 ring-1 ring-blue-500' : 'border-neutral-700 opacity-60 hover:opacity-100'}`}
                            >
                                {scene.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-600">No Image</div>
                                )}
                                <div className="absolute bottom-1 right-1 text-[10px] bg-black/70 px-1 rounded text-white">
                                    {scene.sequenceNumber}
                                </div>
                            </div>
                        ))}
                    </div>
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
