import React from 'react';
import DirectorPanel from '../components/DirectorPanel';
import { GenerationMode } from '../types';

const ImageToVideoPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Simple Header */}
            <section className="py-12 px-6 lg:px-8 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                        AI 이미지 → 비디오
                    </h1>
                    <p className="text-lg text-gray-600">
                        이미지를 업로드하고 고품질 비디오로 변환하세요.
                    </p>
                </div>
            </section>

            {/* Generator Section */}
            <section className="py-12 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <DirectorPanel
                        hideSceneInfo={true}
                        initialMode={GenerationMode.FRAMES_TO_VIDEO}
                    />
                </div>
            </section>
        </div>
    );
};

export default ImageToVideoPage;
