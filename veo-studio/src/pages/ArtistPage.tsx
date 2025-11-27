/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import ArtistPanel from '../components/ArtistPanel';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ArtistPage: React.FC = () => {
    const { projectId, currentScene, setCurrentScene, setSelectedImage } = useAppContext();
    const navigate = useNavigate();
    const [notification, setNotification] = useState<string | null>(null);

    const handleImageSelected = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        if (currentScene) {
            setCurrentScene({
                ...currentScene,
                selected_image: imageUrl,
            });
        }
        setNotification('Image saved successfully!');
        setTimeout(() => setNotification(null), 3000);

        // Auto-navigate to Director page
        setTimeout(() => navigate('/director'), 1500);
    };

    if (!currentScene) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">No Scene Selected</h3>
                    <p className="text-yellow-300 mb-4">Please generate a script in the Writer page first.</p>
                    <button
                        onClick={() => navigate('/writer')}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Go to Writer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">🎨 Artist Agent</h1>
                <p className="text-gray-400">Generate visual concepts from your script</p>
            </div>

            {notification && (
                <div className="mb-6 px-4 py-3 bg-green-900/20 border border-green-500/50 rounded-lg text-green-400">
                    {notification}
                </div>
            )}

            <ArtistPanel
                projectId={projectId}
                sceneId={currentScene.scene_id}
                script={currentScene.script || ''}
                onImageSelected={handleImageSelected}
            />
        </div>
    );
};

export default ArtistPage;
