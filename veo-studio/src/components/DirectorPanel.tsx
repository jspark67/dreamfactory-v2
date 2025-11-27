/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import type { Video } from '@google/genai';
import PromptForm from './PromptForm';
import LoadingIndicator from './LoadingIndicator';
import VideoResult from './VideoResult';
import { generateVideo } from '../services/geminiService';
import {
    AppState,
    GenerationMode,
    VeoModel,
    AspectRatio,
    Resolution,
} from '../types';
import type { GenerateVideoParams, VideoFile } from '../types';

interface DirectorPanelProps {
    projectId?: string;
    sceneId?: string;
    selectedImage?: string | null;
    script?: string;
    onVideoGenerated?: (videoUrl: string) => void;
    hideSceneInfo?: boolean;
    initialMode?: GenerationMode;
}

const DirectorPanel: React.FC<DirectorPanelProps> = ({
    projectId = 'demo-project',
    sceneId = 'demo-scene',
    selectedImage = null,
    script,
    onVideoGenerated,
    hideSceneInfo = false,
    initialMode = GenerationMode.FRAMES_TO_VIDEO,
}) => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoUri, setVideoUri] = useState<string | null>(null); // Original Google API URL
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [lastConfig, setLastConfig] = useState<GenerateVideoParams | null>(null);

    // New: Store video object and blob for extend functionality
    const [lastVideoObject, setLastVideoObject] = useState<Video | null>(null);
    const [lastVideoBlob, setLastVideoBlob] = useState<Blob | null>(null);

    // Initialize form with selected image
    const [initialFormValues, setInitialFormValues] = useState<GenerateVideoParams | null>(null);

    useEffect(() => {
        // Pre-populate form
        setInitialFormValues({
            prompt: script || '',
            model: VeoModel.VEO_FAST,
            aspectRatio: AspectRatio.LANDSCAPE,
            resolution: Resolution.P720,
            mode: initialMode,
            startFrame: null,
            endFrame: null,
            referenceImages: [],
            styleImage: null,
            inputVideo: null,
            inputVideoObject: null,
            isLooping: false,
        });
    }, [selectedImage, sceneId, script, initialMode]);

    const handleGenerate = async (config: GenerateVideoParams) => {
        setAppState(AppState.LOADING);
        setErrorMessage(null);
        setLastConfig(config);
        setInitialFormValues(null); // Reset form values

        try {
            // Use direct Veo API for full functionality (extend, etc.)
            const { objectUrl, blob, video, uri } = await generateVideo(config);

            setVideoUrl(objectUrl);
            setVideoUri(uri); // Store original Google API URL
            setLastVideoBlob(blob);
            setLastVideoObject(video);
            setAppState(AppState.SUCCESS);

            if (onVideoGenerated) {
                onVideoGenerated(objectUrl);
            }
        } catch (error) {
            console.error('Video generation failed:', error);
            const rawMessage = error instanceof Error ? error.message : 'Unknown error';

            // Improved error messages
            let userFriendlyMessage = `비디오 생성 실패: ${rawMessage}`;

            if (typeof rawMessage === 'string') {
                if (rawMessage.includes('Requested entity was not found.')) {
                    userFriendlyMessage = '모델을 찾을 수 없습니다. API 키를 확인해주세요.';
                } else if (
                    rawMessage.includes('API_KEY_INVALID') ||
                    rawMessage.includes('API key not valid') ||
                    rawMessage.toLowerCase().includes('permission denied')
                ) {
                    userFriendlyMessage = 'API 키가 유효하지 않습니다. 환경 설정을 확인해주세요.';
                } else if (rawMessage.includes('quota')) {
                    userFriendlyMessage = 'API 할당량이 초과되었습니다. 나중에 다시 시도해주세요.';
                } else if (rawMessage.includes('timeout')) {
                    userFriendlyMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
                }
            }

            setErrorMessage(userFriendlyMessage);
            setAppState(AppState.ERROR);
        }
    };

    const handleRetry = () => {
        if (lastConfig) {
            handleGenerate(lastConfig);
        }
    };

    const handleNewVideo = () => {
        setAppState(AppState.IDLE);
        setVideoUrl(null);
        setVideoUri(null);
        setErrorMessage(null);
        setLastConfig(null);
        setLastVideoObject(null);
        setLastVideoBlob(null);
        setInitialFormValues(null);
    };

    const handleExtend = async () => {
        if (lastConfig && lastVideoBlob && lastVideoObject) {
            try {
                const file = new File([lastVideoBlob], 'last_video.mp4', {
                    type: lastVideoBlob.type,
                });
                const videoFile: VideoFile = { file, base64: '' };

                // Preserve previous settings but allow user to modify
                setInitialFormValues({
                    ...lastConfig, // Keep all previous settings
                    mode: GenerationMode.EXTEND_VIDEO,
                    prompt: '', // Start with blank prompt for user to enter new one
                    inputVideo: videoFile,
                    inputVideoObject: lastVideoObject,
                    resolution: Resolution.P720, // Extend requires 720p
                    // Keep previous images if they exist, user can modify them
                    startFrame: lastConfig.startFrame || null,
                    endFrame: lastConfig.endFrame || null,
                    referenceImages: lastConfig.referenceImages || [],
                    styleImage: lastConfig.styleImage || null,
                    isLooping: false,
                });

                setAppState(AppState.IDLE);
                setVideoUrl(null);
                setErrorMessage(null);
            } catch (error) {
                console.error('Failed to prepare video for extension:', error);
                const message = error instanceof Error ? error.message : 'Unknown error';
                setErrorMessage(`비디오 확장 준비 실패: ${message}`);
                setAppState(AppState.ERROR);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Scene Info Header */}
            {!hideSceneInfo && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">🎬 Director - Video Generation</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Scene ID:</span>
                            <span className="ml-2 text-gray-900 font-medium">{sceneId || 'No scene selected'}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Project ID:</span>
                            <span className="ml-2 text-gray-900 font-medium">{projectId}</span>
                        </div>
                    </div>
                    {script && (
                        <div className="mt-4">
                            <span className="text-gray-600 text-sm">Script Reference:</span>
                            <p className="mt-2 text-gray-800 text-sm bg-white rounded-lg p-3 max-h-20 overflow-y-auto border border-gray-200">
                                {script}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Selected Image Preview */}
            {selectedImage && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Selected Image</h3>
                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 max-w-md">
                        <img
                            src={selectedImage}
                            alt="Selected for video generation"
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            {appState === AppState.LOADING && <LoadingIndicator />}

            {appState === AppState.SUCCESS && videoUrl && (
                <VideoResult
                    videoUrl={videoUrl}
                    videoUri={videoUri}
                    videoBlob={lastVideoBlob}
                    onRetry={handleRetry}
                    onNewVideo={handleNewVideo}
                    onExtend={handleExtend}
                    canExtend={lastConfig?.resolution === Resolution.P720}
                />
            )}

            {appState === AppState.ERROR && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-red-900 mb-2">생성 실패</h3>
                    <p className="text-red-700 mb-4">{errorMessage}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                        >
                            다시 시도
                        </button>
                        <button
                            onClick={handleNewVideo}
                            className="px-6 py-2 border-2 border-gray-300 hover:border-gray-900 text-gray-900 font-medium rounded-lg transition-colors"
                        >
                            새 비디오
                        </button>
                    </div>
                </div>
            )}

            {(appState === AppState.IDLE || appState === AppState.ERROR) && (
                <PromptForm
                    onGenerate={handleGenerate}
                    initialValues={initialFormValues}
                />
            )}
        </div>
    );
};

export default DirectorPanel;
