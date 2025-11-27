import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, Wand2, Video, ArrowRight, Check } from 'lucide-react';

const LandingPage: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Hero Section - Flow Style */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-6 lg:px-8 pt-20">
                <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Tagline */}
                    <p className="text-sm md:text-base text-gray-600 mb-6 tracking-wide uppercase font-medium">
                        AI 비디오 생성의 새로운 물결
                    </p>

                    {/* Main Headline - Large, Bold, Simple */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
                        상상을 영상으로
                        <br />
                        <span className="text-gray-500">만드는 AI 스튜디오</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                        Veo와 함께하는 차세대 스토리텔링.
                        <br />
                        영화 제작자를 위해, 영화 제작자와 함께 만든 AI 도구입니다.
                    </p>

                    {/* CTA Buttons - Clean, Minimal */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <Link
                            to="/ko/image-to-video"
                            className="group px-8 py-4 bg-black text-white rounded-full font-medium text-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
                        >
                            지금 시작하기
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="#gallery"
                            className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-full font-medium text-lg hover:border-gray-900 transition-all duration-300 flex items-center gap-2"
                        >
                            <Play className="w-5 h-5" />
                            작품 갤러리 보기
                        </Link>
                    </div>

                    {/* Subscription Info */}
                    <p className="text-sm text-gray-500">
                        매월 180 크레딧 무료 제공 ·{' '}
                        <a href="#pricing" className="underline hover:text-gray-900">
                            요금제 보기
                        </a>
                    </p>
                </div>
            </section>

            {/* Overview Section */}
            <section className="py-24 px-6 lg:px-8 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                        크리에이터를 위한
                        <br />
                        AI 영화 제작 도구
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 text-center leading-relaxed font-light max-w-3xl mx-auto">
                        Google의 가장 강력한 생성형 AI 모델을 사용하여
                        <br />
                        영화 같은 클립, 장면, 스토리를 매끄럽게 제작하세요.
                    </p>
                </div>
            </section>

            {/* Capabilities Section - Clean Grid */}
            <section id="capabilities" className="py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
                        주요 기능
                    </h2>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Capability 1 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <Wand2 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">
                                텍스트 → 비디오
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                텍스트 프롬프트만으로 고품질 비디오를 생성합니다. Veo 3.1의 강력한 성능을 경험하세요.
                            </p>
                        </div>

                        {/* Capability 2 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <Video className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">
                                프레임 → 비디오
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                이미지를 업로드하고 자연스러운 움직임이 있는 비디오로 변환합니다.
                            </p>
                        </div>

                        {/* Capability 3 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">
                                1080p 업스케일링
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                생성된 비디오를 Full HD 해상도로 업스케일링하여 최고의 품질을 제공합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How Filmmakers Use It - Minimal Cards */}
            <section className="py-24 px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                        크리에이터들의 작품
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-16">
                        전문 영화 제작자들이 AI로 만든 놀라운 작품들을 확인하세요
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Creator 1 */}
                        <div className="group cursor-pointer">
                            <div className="aspect-video bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:opacity-75 transition-opacity"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold">김민준</h3>
                            <p className="text-gray-600">단편 영화 감독</p>
                        </div>

                        {/* Creator 2 */}
                        <div className="group cursor-pointer">
                            <div className="aspect-video bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:opacity-75 transition-opacity"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold">이서연</h3>
                            <p className="text-gray-600">비주얼 아티스트</p>
                        </div>

                        {/* Creator 3 */}
                        <div className="group cursor-pointer">
                            <div className="aspect-video bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 group-hover:opacity-75 transition-opacity"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold">박지훈</h3>
                            <p className="text-gray-600">콘텐츠 크리에이터</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            to="#gallery"
                            className="inline-flex items-center gap-2 text-lg font-medium hover:underline"
                        >
                            더 많은 작품 보기
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Pricing Section - Flow Style */}
            <section id="pricing" className="py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                        지금 시작하세요
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-16">
                        매월 180 크레딧 무료 또는 아래 요금제로 업그레이드하세요
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="border-2 border-gray-200 rounded-3xl p-8 hover:border-gray-900 transition-all">
                            <h3 className="text-2xl font-bold mb-2">무료 플랜</h3>
                            <p className="text-gray-600 mb-6">시작하기에 완벽한 플랜</p>

                            <div className="mb-8">
                                <div className="text-4xl font-bold mb-2">₩0</div>
                                <div className="text-gray-600">매월 180 크레딧</div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Veo 3.1 텍스트 → 비디오</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>프레임 → 비디오</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>1080p 업스케일링</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>기본 편집 도구</span>
                                </li>
                            </ul>

                            <Link
                                to="/ko/image-to-video"
                                className="block w-full py-3 bg-black text-white rounded-full font-medium text-center hover:bg-gray-800 transition-all"
                            >
                                무료로 시작하기
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="border-2 border-black rounded-3xl p-8 relative bg-gray-50">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                                추천
                            </div>

                            <h3 className="text-2xl font-bold mb-2">Google AI Pro</h3>
                            <p className="text-gray-600 mb-6">전문가를 위한 강력한 도구</p>

                            <div className="mb-8">
                                <div className="text-4xl font-bold mb-2">₩24,900</div>
                                <div className="text-gray-600">월 구독</div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">무료 플랜의 모든 기능</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>무제한 생성 크레딧</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>Gemini 3 Pro 액세스</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>2TB 클라우드 스토리지</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>우선 지원</span>
                                </li>
                            </ul>

                            <a
                                href="#"
                                className="block w-full py-3 bg-black text-white rounded-full font-medium text-center hover:bg-gray-800 transition-all"
                            >
                                Pro로 업그레이드
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA - Minimal */}
            <section className="py-32 px-6 lg:px-8 bg-black text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8">
                        당신의 이야기를
                        <br />
                        AI와 함께 만들어보세요
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                        지금 바로 시작하세요. 회원가입 없이 무료로 사용 가능합니다.
                    </p>
                    <Link
                        to="/ko/image-to-video"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
                    >
                        지금 시작하기
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
