import React from 'react';
import HeroSection from '../components/HeroSection';
import DirectorPanel from '../components/DirectorPanel';
import { GenerationMode } from '../types';

const TextToVideoPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-gray-200">
            <HeroSection
                title="AI 텍스트 → 비디오"
                subtitle="텍스트 프롬프트를 입력하고 고품질 비디오를 생성하세요. 기술 지식 없이도 가능합니다."
                ctaLabel="시작하기"
                ctaLink="#generator"
            />

            <div id="generator" className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <DirectorPanel
                    hideSceneInfo={true}
                    initialMode={GenerationMode.TEXT_TO_VIDEO}
                />
            </div>
        </div>
    );
};

export default TextToVideoPage;
