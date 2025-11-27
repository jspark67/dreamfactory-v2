import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import AlertModal from '../components/AlertModal';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    useEffect(() => {
        // Skip Firebase auth if not configured
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const idToken = await currentUser.getIdToken();
                setToken(idToken);
            } else {
                setToken(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth || !googleProvider) {
            const message = `Firebase Auth가 설정되지 않았습니다.\n\n.env 파일에 Firebase 설정을 추가해주세요:\n- VITE_FIREBASE_API_KEY\n- VITE_FIREBASE_AUTH_DOMAIN\n- VITE_FIREBASE_PROJECT_ID\n- VITE_FIREBASE_STORAGE_BUCKET\n- VITE_FIREBASE_MESSAGING_SENDER_ID\n- VITE_FIREBASE_APP_ID`;
            setAlertMessage(message);
            return;
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, signInWithGoogle, logout }}>
            {!loading && children}
            {alertMessage && (
                <AlertModal
                    message={alertMessage}
                    onClose={() => setAlertMessage(null)}
                />
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
