/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { SparklesIcon, Wand2Icon } from './icons';
import LoadingIndicator from './LoadingIndicator';
import VideoResult from './VideoResult';
import type { DirectorResponse } from '../types';

interface DirectorPanelProps {
    projectId: string;
    sceneId: string;
    selectedImage: string;
    onVideoGenerated: (videoUrl: string) => void;
}

const DirectorPanel: React.FC<DirectorPanelProps> = ({
    projectId,
    sceneId,
    selectedImage,
    onVideoGenerated,
}) => {
    const [motionPrompt, setMotionPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [output, setOutput] = useState<string>('Waiting...');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateMotionPrompt = async () => {
        if (!sceneId) {
            alert('Please select a scene first');
            return;
        }

        setEnhancing(true);
        try {
            const response = await fetch(
                `http://localhost:8000/api/scene/${sceneId}/motion-prompt`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ project_id: projectId }),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to generate motion prompt: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.motion_prompt) {
                setMotionPrompt(data.motion_prompt);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Error: ${errorMessage}`);
            console.error('Motion prompt generation error:', error);
        } finally {
            setEnhancing(false);
        }
    };

    const handleRunDirector = async () => {
        if (!sceneId || !selectedImage || !motionPrompt) {
            setOutput('Error: Please provide Scene ID, Selected Image, and Motion Prompt');
            return;
        }

        setLoading(true);
        setOutput('Running Director Agent...');
        setVideoUrl(null);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/step/director', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    scene_id: sceneId,
                    image_url: selectedImage,
                    prompt: motionPrompt,
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data: DirectorResponse = await response.json();
            setOutput(JSON.stringify(data, null, 2));

            // Extract video URL from response
            let extractedVideoUrl: string | null = null;

            if (data.videoUrl) {
                extractedVideoUrl = data.videoUrl;
            } else if (data.result) {
                const videoUrlMatch = data.result.match(
                    /(?:Video|saved).*?(\/static\/media\/.*?\.mp4|https?:\/\/.*?\.mp4)/i
                );
                if (videoUrlMatch) {
                    extractedVideoUrl = videoUrlMatch[1];
                }
            }

            if (extractedVideoUrl) {
                setVideoUrl(extractedVideoUrl);
                onVideoGenerated(extractedVideoUrl);
            } else {
                setError('No video URL found in response');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setOutput(`Error: ${errorMessage}`);
            setError(errorMessage);
            console.error('Director Agent error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setVideoUrl(null);
        setError(null);
        handleRunDirector();
    };

    const handleNewVideo = () => {
        setVideoUrl(null);
        setError(null);
        setMotionPrompt('');
        setOutput('Waiting...');
    };

    const handleExtend = () => {
        alert('Video extension feature coming soon!');
    };

    if (loading) {
        return <LoadingIndicator />;
    }

    if (videoUrl) {
        return (
            <VideoResult
                videoUrl={videoUrl}
                onRetry={handleRetry}
                onNewVideo={handleNewVideo}
                onExtend={handleExtend}
                canExtend={false}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-indigo-400">🎬 Director Agent (Video)</h2>

                {/* Scene ID Display */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Scene ID:
                    </label>
                    <input
                        type="text"
                        value={sceneId || 'No scene selected'}
                        readOnly
                        className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                </div>

                {/* Selected Image Preview */}
                {selectedImage && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Selected Image:
                        </label>
                        <div className="relative rounded-lg overflow-hidden border-2 border-indigo-500/50">
                            <img
                                src={selectedImage}
                                alt="Selected for video generation"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                )}

                {/* Motion Prompt */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Motion Prompt:
                        </label>
                        <button
                            onClick={handleGenerateMotionPrompt}
                            disabled={enhancing || !sceneId}
                            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {enhancing ? (
                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Wand2Icon className="w-3.5 h-3.5" />
                            )}
                            Generate Motion Prompt
                        </button>
                    </div>
                    <textarea
                        value={motionPrompt}
                        onChange={(e) => setMotionPrompt(e.target.value)}
                        rows={6}
                        placeholder="Describe the camera movement and motion..."
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                </div>

                {/* Run Button */}
                <button
                    onClick={handleRunDirector}
                    disabled={loading || !sceneId || !selectedImage || !motionPrompt}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {loading ? 'Running...' : 'Run Director'}
                </button>

                {/* Output Display */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Output:
                    </label>
                    <pre className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-300 text-sm overflow-x-auto whitespace-pre-wrap">
                        {output}
                    </pre>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-4 px-4 py-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectorPanel;
