/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import type { Project } from '../types';

interface ProjectSelectorProps {
    onProjectLoad: (project: Project) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onProjectLoad }) => {
    const [projects, setProjects] = useState<string[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/projects');
            if (!response.ok) {
                throw new Error(`Failed to fetch projects: ${response.statusText}`);
            }
            const data = await response.json();
            setProjects(data.projects || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadProject = async () => {
        if (!selectedProjectId) {
            setError('Please select a project');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:8000/api/project/${selectedProjectId}`
            );
            if (!response.ok) {
                throw new Error(`Failed to load project: ${response.statusText}`);
            }
            const data = await response.json();
            onProjectLoad(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error('Error loading project:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="p-6 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-indigo-400 mb-4">
                📂 Load Existing Project
            </h3>
            <div className="flex gap-3 items-center">
                <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">-- Select a project --</option>
                    {projects.map((projectId) => (
                        <option key={projectId} value={projectId}>
                            {projectId}
                        </option>
                    ))}
                </select>
                <button
                    onClick={loadProject}
                    disabled={loading || !selectedProjectId}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                    {loading ? 'Loading...' : '📥 Load Project'}
                </button>
                <button
                    onClick={fetchProjects}
                    disabled={loading}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                    🔄 Refresh
                </button>
            </div>
            {error && (
                <p className="mt-3 text-sm text-red-400 bg-red-900/20 border border-red-500/50 rounded px-3 py-2">
                    {error}
                </p>
            )}
        </div>
    );
};

export default ProjectSelector;
