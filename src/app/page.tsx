"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProjectInput } from "@/components/ProjectInput";
import { StepIndicator, AgentStep } from "@/components/StepIndicator";
import { MoviePlayer } from "@/components/preview/MoviePlayer";
import { ProductionBible } from "@/agents/writer";
import { SceneWithState } from "@/providers/CollaborationProvider";
import { Film, Sparkles, Zap, CheckCircle, Play } from "lucide-react";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<AgentStep>("idle");
  const [completedSteps, setCompletedSteps] = useState<AgentStep[]>([]);
  const [scenes, setScenes] = useState<SceneWithState[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Polling Logic
  useEffect(() => {
    if (isGenerating && projectId) {
      pollingInterval.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/project/${projectId}`);
          if (!response.ok) return;

          const data = await response.json();
          const scenesDict = data.scenes || {};

          // Convert dict to array and sort
          const scenesArray: SceneWithState[] = Object.values(scenesDict).map((s: any) => ({
            sceneId: s.id,
            script: s.script,
            visualPrompt: s.visual_prompt,
            imageUrl: s.imageUrl,
            videoUrl: s.videoUrl,
            status: s.status,
            sequenceNumber: s.sequence_number
          })).sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));

          setScenes(scenesArray);

          // Determine Progress
          if (scenesArray.length > 0) {
            const allWritten = scenesArray.length > 0;
            const allDrawn = scenesArray.every(s => s.imageUrl);
            const allDirected = scenesArray.every(s => s.videoUrl);

            const newCompleted: AgentStep[] = [];
            if (allWritten) newCompleted.push("writing");
            if (allDrawn) newCompleted.push("drawing");
            if (allDirected) newCompleted.push("directing");
            setCompletedSteps(newCompleted);

            if (allDirected) {
              setIsGenerating(false);
              setCurrentStep("idle");
              if (pollingInterval.current) clearInterval(pollingInterval.current);
            } else if (allDrawn) {
              setCurrentStep("directing");
            } else if (allWritten) {
              setCurrentStep("drawing");
            } else {
              setCurrentStep("writing");
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [isGenerating, projectId]);

  const handleCreateShort = async (topic: string, productionBible: ProductionBible) => {
    try {
      setIsGenerating(true);
      setError(null);
      setCompletedSteps([]);
      setScenes([]);
      setCurrentStep("writing");

      // Generate a unique project ID
      const newProjectId = `project_${Date.now()}`;
      setProjectId(newProjectId);

      // Trigger Full Pipeline
      const response = await fetch("/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: newProjectId,
          topic,
          // productionBible is currently unused by the simplified backend endpoint, 
          // but we keep it for future use or pass it in input if needed.
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start production");
      }

    } catch (err: any) {
      console.error("Error creating short:", err);
      setError(err.message || "Failed to create short. Please try again.");
      setIsGenerating(false);
      setCurrentStep("idle");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black -z-10" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 -z-10" />

      {/* Navbar */}
      <nav className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">DreamFactory</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Beta v2.1
            </span>
            <a href="https://github.com/google-gemini/dreamfactory" target="_blank" className="text-sm text-gray-400 hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">

        {/* Hero Section */}
        {!isGenerating && scenes.length === 0 && (
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 hover:bg-white/10 transition-colors cursor-default">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Powered by Gemini 3.0 & Veo</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 tracking-tight">
              Create Viral Shorts <br />
              <span className="text-purple-500">in Seconds with AI</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Turn your ideas into professional video content automatically.
              The world's first fully autonomous AI production studio.
            </p>

            {/* Input Form */}
            <div className="max-w-xl mx-auto relative z-10">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 animate-pulse" />
              <div className="relative bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 p-2">
                <ProjectInput onSubmit={handleCreateShort} isLoading={isGenerating} />
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Try: "A cyberpunk detective in Neo-Seoul" or "The history of coffee in 30 seconds"
              </p>
            </div>

            {/* Features / Social Proof */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors">
                <Zap className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-gray-400">Generate complete scripts, storyboards, and videos in under 2 minutes.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors">
                <Film className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cinema Quality</h3>
                <p className="text-sm text-gray-400">Powered by Google's Veo model for high-fidelity video generation.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors">
                <CheckCircle className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Fully Autonomous</h3>
                <p className="text-sm text-gray-400">Our Agentic Workflow handles writing, directing, and editing for you.</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress & Preview Section */}
        {(isGenerating || scenes.length > 0) && (
          <div className="max-w-6xl mx-auto animate-fade-in-up">

            {/* Progress Bar */}
            <div className="mb-12">
              <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
              {isGenerating && (
                <p className="text-center text-sm text-gray-400 mt-4 animate-pulse">
                  {currentStep === 'writing' && "Writer Agent is crafting the script..."}
                  {currentStep === 'drawing' && "Artist Agent is visualizing scenes..."}
                  {currentStep === 'directing' && "Director Agent is filming on location (Veo)..."}
                </p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Sidebar: Scene List */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Scene List</h3>
                  <span className="text-xs text-gray-600">{scenes.length} Scenes</span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {scenes.map((scene, index) => (
                    <button
                      key={scene.sceneId}
                      onClick={() => setSelectedSceneIndex(index)}
                      className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${selectedSceneIndex === index
                          ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                        }`}
                    >
                      <div className="flex items-start gap-3 relative z-10">
                        <span className={`text-xs font-mono mt-1 ${selectedSceneIndex === index ? 'text-purple-400' : 'text-gray-500'}`}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium mb-1 truncate ${selectedSceneIndex === index ? 'text-white' : 'text-gray-300'}`}>
                            {scene.script || "Generating script..."}
                          </p>
                          <div className="flex items-center gap-2">
                            {scene.videoUrl ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20">Video Ready</span>
                            ) : scene.imageUrl ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">Image Ready</span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400 border border-gray-500/20">Processing</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}

                  {scenes.length === 0 && isGenerating && (
                    <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-xs text-gray-500">Initializing agents...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content: Player & Details */}
              <div className="lg:col-span-8 space-y-6">

                {/* Video Player Container */}
                <div className="relative aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl group">
                  {scenes[selectedSceneIndex] ? (
                    <MoviePlayer scene={scenes[selectedSceneIndex]} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                      <div className="text-center">
                        <Film className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-600">Select a scene to preview</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scene Details Card */}
                {scenes[selectedSceneIndex] && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-3">Script & Dialogue</h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-serif italic">
                          "{scenes[selectedSceneIndex].script}"
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-3">Visual Direction</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          {scenes[selectedSceneIndex].visualPrompt}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                {!isGenerating && scenes.length > 0 && (
                  <div className="flex justify-end pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        setScenes([]);
                        setCompletedSteps([]);
                        setCurrentStep("idle");
                        setProjectId(null);
                        setError(null);
                      }}
                      className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Create Another Short
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
