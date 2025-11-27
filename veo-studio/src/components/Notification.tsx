/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { CheckIcon, XMarkIcon } from './icons';

interface NotificationProps {
    type: 'success' | 'error' | 'info';
    message: string;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
    const bgColor = {
        success: 'bg-green-900/20 border-green-500/50 text-green-400',
        error: 'bg-red-900/20 border-red-500/50 text-red-400',
        info: 'bg-blue-900/20 border-blue-500/50 text-blue-400',
    }[type];

    const Icon = type === 'success' ? CheckIcon : XMarkIcon;

    return (
        <div
            className={`fixed top-4 right-4 max-w-md px-4 py-3 rounded-lg border ${bgColor} shadow-lg z-50 flex items-start gap-3 animate-slide-in`}
        >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm">{message}</p>
            <button
                onClick={onClose}
                className="text-current hover:opacity-70 transition-opacity"
                aria-label="Close notification"
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Notification;
