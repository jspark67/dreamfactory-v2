/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black border-t border-gray-800/50 mt-auto">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-sm text-gray-500">
                        © 2024 DreamFactory. Powered by{' '}
                        <span className="text-cyan-400">Google Gemini</span> &{' '}
                        <span className="text-blue-400">Veo</span>
                    </div>
                    <div className="flex space-x-8 text-sm">
                        <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                            Documentation
                        </a>
                        <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                            GitHub
                        </a>
                        <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                            Support
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
