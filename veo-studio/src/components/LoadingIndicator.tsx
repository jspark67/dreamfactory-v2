/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';

const loadingMessages: string[] = [
    "AI가 카메라 앵글을 고민하는 중...",
    "픽셀들이 춤추는 법을 배우고 있어요...",
    "영화감독 AI가 커피 한 잔 하는 중☕",
    "프레임마다 마법을 뿌리는 중✨",
    "시간을 되감고 미래를 그리는 중...",
    "AI가 스필버그에게 영감을 받는 중🎬",
    "잠시만요, 거의 다 왔어요!",
    "영상에 감성을 불어넣는 중💫",
    "AI가 명장면을 연출하는 중...",
    "픽셀 하나하나에 생명을 불어넣는 중",
    "AI가 '액션!' 외치는 연습 중🎥",
    "디지털 먼지를 털어내는 중...",
    "창의력 센서를 최대치로 올리는 중📈",
    "평행우주에서 영감을 가져오는 중🌌",
    "광속으로 렌더링 중... 거의 다 왔어요!",
    "걱정 마세요, AI가 열심히 일하고 있어요",
    "양자 컴퓨터가 꿈을 꾸는 중💭",
    "별빛을 모아 영상을 만드는 중⭐",
    "오스카 수상 소감 준비하세요🏆"
];

function LoadingIndicator(): React.JSX.Element {
    const [messageIndex, setMessageIndex] = useState<number>(0);

    useEffect(() => {
        const intervalId: NodeJS.Timeout = setInterval(() => {
            setMessageIndex((prevIndex: number): number => (prevIndex + 1) % loadingMessages.length);
        }, 3000); // Change message every 3 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 border-4 border-t-transparent border-black rounded-full animate-spin"></div>
            <h2 className="text-2xl font-semibold mt-8 text-gray-900">비디오 생성 중</h2>
            <p className="mt-2 text-gray-600 text-center transition-opacity duration-500">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
}

export default LoadingIndicator;
