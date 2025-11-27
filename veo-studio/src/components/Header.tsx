/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
    const location = useLocation();
    const { user, signInWithGoogle, logout } = useAuth();

    const navItems = [
        { path: '/ko/image-to-video', label: 'Image to Video', icon: '🖼️' },
        { path: '/ko/text-to-video', label: 'Text to Video', icon: '📝' },
        { path: '/ko/ai-image-generator', label: 'AI Image Generator', icon: '🎨' },
        { path: '/writer', label: 'Writer', icon: '✍️' },
        { path: '/artist', label: 'Artist', icon: '🎨' },
        { path: '/director', label: 'Director', icon: '🎬' },
    ];

    return (
        <header className="bg-black border-b border-gray-800/50 sticky top-0 z-50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group mr-8">
                        <div className="text-3xl transform group-hover:scale-110 transition-transform">🎬</div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                                DreamFactory
                            </h1>
                            <p className="text-xs text-gray-500">AI Video Studio</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex space-x-1 overflow-x-auto no-scrollbar">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                                        }`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side (Auth & Version) */}
                    <div className="ml-auto flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {user.photoURL && (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                            className="w-8 h-8 rounded-full border border-gray-700"
                                        />
                                    )}
                                    <span className="text-sm text-gray-300 hidden md:block">
                                        {user.displayName}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="text-xs text-gray-400 hover:text-white transition-colors border border-gray-700 rounded-full px-3 py-1"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={signInWithGoogle}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
