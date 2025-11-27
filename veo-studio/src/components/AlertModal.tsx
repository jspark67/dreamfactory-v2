import React from 'react';

interface AlertModalProps {
    message: string;
    onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md mx-4 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">⚠️ 알림</h3>
                <p className="text-gray-300 whitespace-pre-line mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                    확인
                </button>
            </div>
        </div>
    );
};

export default AlertModal;
