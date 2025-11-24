"use client";

import React from "react";
import { Player } from "@remotion/player";
import { AbsoluteFill, Img, useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { SceneWithState } from "@/providers/CollaborationProvider";

// --- Remotion Composition for Ken Burns ---

const KenBurnsComposition: React.FC<{
    imageUrl: string;
    config: {
        zoomStart: number;
        zoomEnd: number;
        panX: number;
        panY: number;
    };
}> = ({ imageUrl, config }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const scale = interpolate(frame, [0, durationInFrames], [config.zoomStart, config.zoomEnd], {
        extrapolateRight: "clamp",
    });

    const translateX = interpolate(frame, [0, durationInFrames], [0, config.panX], {
        extrapolateRight: "clamp",
    });

    const translateY = interpolate(frame, [0, durationInFrames], [0, config.panY], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill style={{ overflow: "hidden" }}>
            <Img
                src={imageUrl}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                }}
            />
        </AbsoluteFill>
    );
};

// --- Main Player Component ---

interface MoviePlayerProps {
    scene: SceneWithState;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({ scene }) => {
    if (!scene) {
        return <div className="w-full h-full bg-black flex items-center justify-center text-gray-500">No Scene Selected</div>;
    }

    // 1. Priority: Veo Video
    if (scene.videoUrl) {
        return (
            <div className="w-full h-full bg-black">
                <video
                    src={scene.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                />
            </div>
        );
    }

    // 2. Fallback: Remotion Ken Burns
    if (scene.imageUrl && scene.videoComposition) {
        const { config } = scene.videoComposition;
        const durationInSeconds = config.duration || 4;
        const fps = 30;

        return (
            <div className="w-full h-full bg-black">
                <Player
                    component={KenBurnsComposition}
                    inputProps={{
                        imageUrl: scene.imageUrl,
                        config: config,
                    }}
                    durationInFrames={Math.floor(durationInSeconds * fps)}
                    compositionWidth={1920}
                    compositionHeight={1080}
                    fps={fps}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                    controls
                    autoPlay
                    loop
                />
            </div>
        );
    }

    // 3. Fallback: Static Image
    if (scene.imageUrl) {
        return (
            <div className="w-full h-full bg-black relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={scene.imageUrl} alt="Scene Preview" className="w-full h-full object-contain" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-white font-mono bg-black/50 px-2 py-1 rounded">Static Preview</span>
                </div>
            </div>
        )
    }

    // 4. Empty State
    return (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-400">
            <div className="text-center">
                <p>Waiting for content...</p>
                <p className="text-xs mt-2 opacity-50">Generate script and images to preview</p>
            </div>
        </div>
    );
};
