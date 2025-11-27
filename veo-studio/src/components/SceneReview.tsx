/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';

interface SceneReviewProps {
    sceneId: string;
    projectId: string;
    script: string;
    onScriptUpdate: (newScript: string) => void;
}

const SceneReview: React.FC<SceneReviewProps> = ({
    sceneId,
    projectId,
    script,
    onScriptUpdate,
}) => {
    const [editedScript, setEditedScript] = useState(script);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch(
                `http://localhost:8000/api/scene/${sceneId}/update`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        project_id: projectId,
                        script: editedScript,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to save: ${response.statusText}`);
            }

            setMessage({ type: 'success', text: 'Script saved successfully!' });
            onScriptUpdate(editedScript);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setMessage({ type: 'error', text: errorMessage });
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">
                ✏️ Review & Edit Script
            </h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                    Scene ID:
                </label>
                <input
                    type="text"
                    value={sceneId}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Script & Dialogue:
                </label>
                <textarea
                    value={editedScript}
                    onChange={(e) => setEditedScript(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-mono text-sm"
                />
            </div>

            <button
                onClick={handleSave}
                disabled={saving || editedScript === script}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
            >
                {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {message && (
                <div
                    className={`mt-4 px-4 py-3 rounded-lg ${message.type === 'success'
                            ? 'bg-green-900/20 border border-green-500/50 text-green-400'
                            : 'bg-red-900/20 border border-red-500/50 text-red-400'
                        }`}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default SceneReview;
