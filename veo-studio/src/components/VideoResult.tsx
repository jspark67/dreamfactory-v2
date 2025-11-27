/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ArrowPathIcon, DownloadIcon, PlusIcon, SparklesIcon } from './icons';

interface VideoResultProps {
    videoUrl: string;
    videoUri?: string | null; // Original Google API URL
    videoBlob?: Blob | null;
    onRetry: () => void;
    onNewVideo: () => void;
    onExtend: () => void;
    canExtend: boolean;
}

const VideoResult: React.FC<VideoResultProps> = ({
    videoUrl,
    videoUri,
    videoBlob,
    onRetry,
    onNewVideo,
    onExtend,
    canExtend,
}) => {
    const handleDownload = async () => {
        try {
            console.log('Starting download...');

            // Method 1: Direct download from Google API URL (most reliable)
            if (videoUri) {
                console.log('Using original Google API URL');
                const apiKey = import.meta.env.VITE_API_KEY;
                const downloadUrl = videoUri.includes('key=')
                    ? videoUri
                    : `${videoUri}&key=${apiKey}`;

                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `veo-video-${Date.now()}.mp4`;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('Direct download initiated');
                return;
            }

            // Method 2: Use blob if available
            if (videoBlob) {
                console.log('Using existing blob');
                const url = URL.createObjectURL(videoBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `veo-video-${Date.now()}.mp4`;
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
                console.log('Blob download initiated');
                return;
            }

            // Method 3: Fallback to videoUrl
            console.log('Using videoUrl as fallback');
            const link = document.createElement('a');
            link.href = videoUrl;
            link.download = `veo-video-${Date.now()}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Download failed:', error);
            alert(
                `다운로드 실패\n\n` +
                `해결 방법:\n` +
                `1. 비디오를 우클릭 → "다른 이름으로 비디오 저장"\n` +
                `2. 다른 브라우저에서 시도 (Firefox, Safari)\n` +
                `3. Chrome 다운로드 설정 확인`
            );
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-8 p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
                🎉 비디오가 준비되었습니다!
            </h2>
            <div className="w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-black shadow-lg border border-gray-200">
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="w-full max-w-2xl bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-2">💡 다운로드가 안 되나요?</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>비디오를 <strong>우클릭</strong> → "다른 이름으로 비디오 저장" 선택</li>
                    <li>또는 Chrome 설정(<code>chrome://settings/downloads</code>)에서 "다운로드 전에 저장 위치 확인" 옵션 켜기</li>
                </ol>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 hover:border-gray-900 text-gray-900 font-medium rounded-lg transition-colors">
                    <ArrowPathIcon className="w-5 h-5" />
                    다시 생성
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors">
                    <DownloadIcon className="w-5 h-5" />
                    다운로드
                </button>
                <div className="relative group">
                    <button
                        onClick={onExtend}
                        disabled={!canExtend}
                        className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors ${canExtend
                            ? 'bg-black hover:bg-gray-800 text-white'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}>
                        <SparklesIcon className="w-5 h-5" />
                        비디오 확장
                    </button>
                    {!canExtend && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            1080p 비디오는 확장할 수 없습니다. 720p로 생성해주세요.
                        </div>
                    )}
                </div>
                <button
                    onClick={onNewVideo}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 hover:border-gray-900 text-gray-900 font-medium rounded-lg transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    새 비디오
                </button>
            </div>
        </div>
    );
};

export default VideoResult;
