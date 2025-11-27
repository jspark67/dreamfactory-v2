/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import DirectorPanel from '../components/DirectorPanel';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const DirectorPage: React.FC = () => {
    const { projectId, currentScene, selectedImage, setCurrentScene, setVideoUrl } = useAppContext();
    const navigate = useNavigate();
    const [notification, setNotification] = useState<string | null>(null);

    const handleVideoGenerated = (videoUrl: string) => {
        setVideoUrl(videoUrl);
        if (currentScene) {
            setCurrentScene({
                ...currentScene,
                videoUrl: videoUrl,
            });
        }
        setNotification('Video generated successfully!');
        setTimeout(() => setNotification(null), 5000);
    };

    if (!currentScene || !selectedImage) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">Prerequisites Not Met</h3>
                    <p className="text-yellow-300 mb-4">
                        {!currentScene && 'Please generate a script in the Writer page first.'}
                        {currentScene && !selectedImage && 'Please select an image in the Artist page first.'}
                    </p>
                    <button
                        onClick={() => navigate(!currentScene ? '/writer' : '/artist')}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        {!currentScene ? 'Go to Writer' : 'Go to Artist'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">🎬 Director - Video Generation</h1>
                <p className="text-gray-400">Create cinematic videos using Veo AI</p>
            </div>

            {notification && (
                <div className="mb-6 px-4 py-3 bg-green-900/20 border border-green-500/50 rounded-lg text-green-400">
                    {notification}
                </div>
            )}

            <DirectorPanel
                projectId={projectId}
                sceneId={currentScene.scene_id}
                selectedImage={selectedImage}
                script={currentScene.script}
                onVideoGenerated={handleVideoGenerated}
            />
        </div>
    );
};

export default DirectorPage;
