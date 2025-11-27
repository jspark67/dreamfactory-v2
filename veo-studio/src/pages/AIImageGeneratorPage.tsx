import React from 'react';
import HeroSection from '../components/HeroSection';
import ArtistPanel from '../components/ArtistPanel';

const AIImageGeneratorPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-gray-200">
            <HeroSection
                title="AI 이미지 생성기"
                subtitle="텍스트 프롬프트를 입력하고 고품질 이미지를 생성하세요. 간편하고 빠른 AI 이미지 생성."
                ctaLabel="시작하기"
                ctaLink="#generator"
            />

            <div id="generator" className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <ArtistPanel hideSceneInfo={true} />
            </div>
        </div>
    );
};

export default AIImageGeneratorPage;
