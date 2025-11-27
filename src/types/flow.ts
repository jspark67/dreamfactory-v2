/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// Types ported from veo-studio
// ============================================================================

export enum AppState {
    IDLE,
    LOADING,
    SUCCESS,
    ERROR,
}

export enum VeoModel {
    VEO_FAST = 'veo-3.1-fast-generate-preview',
    VEO = 'veo-3.1-generate-preview',
}

export enum AspectRatio {
    LANDSCAPE = '16:9',
    PORTRAIT = '9:16',
}

export enum Resolution {
    P720 = '720p',
    P1080 = '1080p',
}

export enum GenerationMode {
    TEXT_TO_VIDEO = 'Text to Video',
    FRAMES_TO_VIDEO = 'Frames to Video',
    REFERENCES_TO_VIDEO = 'References to Video',
    EXTEND_VIDEO = 'Extend Video',
    TEXT_TO_IMAGE = 'Text to Image', // Added for Image mode
}

export interface ImageFile {
    file: File;
    base64: string;
}

export interface VideoFile {
    file: File;
    base64: string;
}

export interface GenerateVideoParams {
    prompt: string;
    model: VeoModel;
    aspectRatio: AspectRatio;
    resolution: Resolution;
    mode: GenerationMode;
    startFrame?: ImageFile | null;
    endFrame?: ImageFile | null;
    referenceImages?: ImageFile[];
    styleImage?: ImageFile | null;
    inputVideo?: VideoFile | null;
    inputVideoObject?: unknown | null;
    isLooping?: boolean;
    // Added for compatibility with existing page.tsx logic if needed
    sceneId?: string;
    projectId?: string;
}

// ============================================================================
// New Types for Multi-Agent Workflow (kept from original flow.ts or expanded)
// ============================================================================

export type AgentType = 'writer' | 'artist' | 'director';

export interface Project {
    project_id: string;
    topic?: string;
    scenes?: Scene[];
}

export interface Scene {
    sceneId: string; // standardized to camelCase as per page.tsx usage
    projectId: string;
    script?: string;
    visualPrompt?: string;
    imageUrl?: string; // standardized
    imageUrls?: string[];
    selectedImage?: string;
    motionPrompt?: string;
    videoUrl?: string;
    sequenceNumber?: number;
}

export interface WriterResponse {
    result: string;
    scene_id?: string;
}

export interface ArtistResponse {
    result: string;
    image_urls?: string[];
}

export interface DirectorResponse {
    result: string;
    videoUrl?: string;
}
