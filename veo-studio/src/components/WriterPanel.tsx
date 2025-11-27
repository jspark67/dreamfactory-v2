/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import type { WriterResponse, Scene } from '../types';

interface WriterPanelProps {
    projectId: string;
    onProjectIdChange: (projectId: string) => void;
    onScriptGenerated: (sceneId: string, script: string) => void;
}

const WriterPanel: React.FC<WriterPanelProps> = ({
    projectId,
    onProjectIdChange,
    onScriptGenerated,
}) => {
    const [topic, setTopic] = useState('A cyberpunk detective looking for a lost cat in neon rain.');
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<string>('Waiting...');
    const [generatedScene, setGeneratedScene] = useState<Scene | null>(null);

    const handleRunWriter = async () => {
        if (!projectId || !topic) {
            setOutput('Error: Please provide both Project ID and Topic');
            return;
        }

        setLoading(true);
        setOutput('Running Writer Agent...');

        try {
            const response = await fetch('http://localhost:8000/api/step/writer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    input_text: topic,
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data: WriterResponse = await response.json();
            setOutput(JSON.stringify(data, null, 2));

            // Extract scene ID from response
            const match = data.result?.match(/ID (scene_\d+)/);
            if (match) {
                const sceneId = match[1];
                // Fetch scene details to get the script
                const sceneResponse = await fetch(
                    `http://localhost:8000/api/scene/${sceneId}?project_id=${projectId}`
                );
                if (sceneResponse.ok) {
                    const sceneData: Scene = await sceneResponse.json();
                    setGeneratedScene(sceneData);
                    if (sceneData.script) {
                        onScriptGenerated(sceneId, sceneData.script);
                    }
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setOutput(`Error: ${errorMessage}`);
            console.error('Writer Agent error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-indigo-400">📝 Writer Agent (Script)</h2>

                {/* Project ID Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project ID:
                    </label>
                    <input
                        type="text"
                        value={projectId}
                        onChange={(e) => onProjectIdChange(e.target.value)}
                        placeholder="proj_test_001"
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Topic Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Topic / Idea:
                    </label>
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        rows={4}
                        placeholder="Describe your video idea..."
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                </div>

                {/* Run Button */}
                <button
                    onClick={handleRunWriter}
                    disabled={loading || !projectId || !topic}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {loading ? 'Running...' : 'Run Writer'}
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
            </div>

            {/* Scene Review Section */}
            {generatedScene && generatedScene.script && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-purple-400">
                        ✏️ Review & Edit Script
                    </h3>
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Scene ID:
                        </label>
                        <input
                            type="text"
                            value={generatedScene.scene_id}
                            readOnly
                            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Script & Dialogue:
                        </label>
                        <textarea
                            value={generatedScene.script}
                            readOnly
                            rows={10}
                            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 resize-none"
                        />
                    </div>
                    <p className="mt-3 text-sm text-gray-400">
                        💡 Script editing will be implemented in SceneReview component
                    </p>
                </div>
            )}
        </div>
    );
};

export default WriterPanel;
