/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import type { AgentType } from '../types';

interface AgentTabsProps {
    activeTab: AgentType;
    onTabChange: (tab: AgentType) => void;
}

const AgentTabs: React.FC<AgentTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs: { id: AgentType; label: string; icon: string }[] = [
        { id: 'writer', label: 'Writer', icon: '📝' },
        { id: 'artist', label: 'Artist', icon: '🎨' },
        { id: 'director', label: 'Director', icon: '🎬' },
    ];

    return (
        <div className="flex border-b border-gray-700 bg-gray-800/50">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 px-6 py-4 text-center font-semibold transition-all relative ${activeTab === tab.id
                            ? 'text-indigo-400 bg-gray-900/50'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                        }`}
                >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default AgentTabs;
