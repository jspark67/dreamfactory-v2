/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Project, Scene } from '../types';

interface AppContextType {
    projectId: string;
    setProjectId: (id: string) => void;
    currentProject: Project | null;
    setCurrentProject: (project: Project | null) => void;
    currentScene: Scene | null;
    setCurrentScene: (scene: Scene | null) => void;
    selectedImage: string | null;
    setSelectedImage: (image: string | null) => void;
    videoUrl: string | null;
    setVideoUrl: (url: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projectId, setProjectId] = useState<string>('proj_test_001');
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [currentScene, setCurrentScene] = useState<Scene | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    return (
        <AppContext.Provider
            value={{
                projectId,
                setProjectId,
                currentProject,
                setCurrentProject,
                currentScene,
                setCurrentScene,
                selectedImage,
                setSelectedImage,
                videoUrl,
                setVideoUrl,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};
