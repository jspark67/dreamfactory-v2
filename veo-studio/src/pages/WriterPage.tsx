/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import WriterPanel from '../components/WriterPanel';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const WriterPage: React.FC = () => {
    const { projectId, setProjectId, setCurrentScene } = useAppContext();
    const navigate = useNavigate();
    const [notification, setNotification] = useState<string | null>(null);

    const handleScriptGenerated = (sceneId: string, script: string) => {
        setCurrentScene({
            scene_id: sceneId,
            project_id: projectId,
            script: script,
        });
        setNotification(`Script generated for scene: ${sceneId}`);
        setTimeout(() => setNotification(null), 3000);

        // Auto-navigate to Artist page
        setTimeout(() => navigate('/artist'), 1500);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">📝 Writer Agent</h1>
                <p className="text-gray-400">Generate scripts and dialogue for your video scenes</p>
            </div>

            {notification && (
                <div className="mb-6 px-4 py-3 bg-green-900/20 border border-green-500/50 rounded-lg text-green-400">
                    {notification}
                </div>
            )}

            <WriterPanel
                projectId={projectId}
                onProjectIdChange={setProjectId}
                onScriptGenerated={handleScriptGenerated}
            />
        </div>
    );
};

export default WriterPage;
