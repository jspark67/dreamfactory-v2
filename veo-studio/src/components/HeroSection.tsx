import React from 'react';

interface HeroSectionProps {
    title: string;
    subtitle: string;
    ctaLabel?: string;
    ctaLink?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, ctaLabel, ctaLink }) => {
    return (
        <section className="bg-black text-white py-20 flex flex-col items-center text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-6">
                {title}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mb-8">
                {subtitle}
            </p>
            {ctaLabel && ctaLink && (
                <a
                    href={ctaLink}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                    {ctaLabel}
                </a>
            )}
        </section>
    );
};

export default HeroSection;
