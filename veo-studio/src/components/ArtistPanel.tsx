/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { CheckIcon, SparklesIcon } from './icons';
import type { ArtistResponse } from '../types';

interface ArtistPanelProps {
    projectId?: string;
    sceneId?: string;
    script?: string;
    onImageSelected?: (imageUrl: string) => void;
    hideSceneInfo?: boolean;
}

const ArtistPanel: React.FC<ArtistPanelProps> = ({
    projectId = 'demo-project',
    sceneId = 'demo-scene',
    script = '',
    onImageSelected,
    hideSceneInfo = false,
}) => {
    const [visualPrompt, setVisualPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<string>('Waiting...');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const handleRunArtist = async () => {
        if (!sceneId || !visualPrompt) {
            setOutput('Error: Please provide Scene ID and Visual Prompt');
            return;
        }

        setLoading(true);
        setOutput('Running Artist Agent...');
        setImageUrls([]);
        setSelectedImage(null);

        try {
            const response = await fetch('http://localhost:8000/api/step/artist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    scene_id: sceneId,
                    input_text: visualPrompt,
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data: ArtistResponse = await response.json();
            setOutput(JSON.stringify(data, null, 2));

            // Extract image URLs from response
            if (data.image_urls && data.image_urls.length > 0) {
                setImageUrls(data.image_urls);
            } else {
                // Try to parse from result string
                const jsonMatch = data.result?.match(/\[.*\]/s);
                if (jsonMatch) {
                    const paths = JSON.parse(jsonMatch[0]);
                    setImageUrls(paths);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setOutput(`Error: ${errorMessage}`);
            console.error('Artist Agent error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndConfirm = async () => {
        if (!selectedImage) {
            alert('Please select an image first');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(
                `http://localhost:8000/api/scene/${sceneId}/update`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        project_id: projectId,
                        selected_image: selectedImage,
                        visual_prompt: visualPrompt,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to save: ${response.statusText}`);
            }

            if (onImageSelected) {
                onImageSelected(selectedImage);
            }
            alert('Image saved successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Error: ${errorMessage}`);
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-indigo-400">🎨 Artist Agent (Images)</h2>

                {/* Scene ID Display */}
                {!hideSceneInfo && (
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
                )}

                {/* Script Display */}
                {!hideSceneInfo && script && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Script Reference:
                        </label>
                        <textarea
                            value={script}
                            readOnly
                            rows={4}
                            className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 text-sm resize-none"
                        />
                    </div>
                )}

                {/* Visual Prompt Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Visual Prompt:
                    </label>
                    <textarea
                        value={visualPrompt}
                        onChange={(e) => setVisualPrompt(e.target.value)}
                        rows={4}
                        placeholder="Describe the visual style and appearance..."
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                </div>

                {/* Run Button */}
                <button
                    onClick={handleRunArtist}
                    disabled={loading || !sceneId || !visualPrompt}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {loading ? 'Running...' : 'Run Artist'}
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

            {/* Image Grid */}
            {imageUrls.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-purple-400">
                        🖼️ Generated Images
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {imageUrls.map((url, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedImage(url)}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${selectedImage === url
                                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/50'
                                    : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <img
                                    src={url}
                                    alt={`Generated image ${index + 1}`}
                                    className="w-full h-auto"
                                />
                                {selectedImage === url && (
                                    <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-2">
                                        <CheckIcon className="w-6 h-6 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Save & Confirm Button */}
                    <button
                        onClick={handleSaveAndConfirm}
                        disabled={!selectedImage || saving}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckIcon className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save & Confirm Selected Image'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ArtistPanel;
