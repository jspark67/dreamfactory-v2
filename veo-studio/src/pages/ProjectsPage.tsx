/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import ProjectSelector from '../components/ProjectSelector';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../types';

const ProjectsPage: React.FC = () => {
    const { setProjectId, setCurrentProject, setCurrentScene, setSelectedImage, setVideoUrl } = useAppContext();
    const navigate = useNavigate();

    const handleProjectLoad = (project: Project) => {
        setCurrentProject(project);
        setProjectId(project.project_id);

        // If project has scenes, load the first one and populate all fields
        if (project.scenes && project.scenes.length > 0) {
            const scene = project.scenes[0];
            setCurrentScene(scene);

            // Auto-populate selected image if available
            if (scene.selected_image) {
                setSelectedImage(scene.selected_image);
            }

            // Auto-populate video URL if available
            if (scene.videoUrl) {
                setVideoUrl(scene.videoUrl);
            }

            console.log('Loaded project with scene:', scene);

            // Navigate to Writer page to start workflow
            navigate('/writer');
        } else {
            // Reset state if no scenes
            setCurrentScene(null);
            setSelectedImage(null);
            setVideoUrl(null);

            // Navigate to Writer page to create new scene
            navigate('/writer');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">Projects</h1>
                <p className="text-gray-400">Load an existing project or start a new one</p>
            </div>

            <ProjectSelector onProjectLoad={handleProjectLoad} />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <div className="text-3xl mb-3">📝</div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Writer</h3>
                    <p className="text-sm text-gray-400">Generate scripts and dialogue for your scenes</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <div className="text-3xl mb-3">🎨</div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Artist</h3>
                    <p className="text-sm text-gray-400">Create visual concepts from your scripts</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <div className="text-3xl mb-3">🎬</div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Director</h3>
                    <p className="text-sm text-gray-400">Generate videos using Veo AI</p>
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;
