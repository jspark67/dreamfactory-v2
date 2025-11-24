"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, Timestamp } from "firebase/firestore";
import { Scene } from "@/agents/writer"; // Re-using Scene interface, might need extension

// Extend Scene interface for UI state if needed
export interface SceneWithState extends Scene {
    imageUrl?: string;
    videoUrl?: string;
    videoComposition?: any;
    status?: string;
    lockedBy?: string;
    lockedAt?: any;
}

interface CollaborationContextType {
    scenes: SceneWithState[];
    loading: boolean;
    lockField: (sceneId: string, field: string) => Promise<void>;
    unlockField: (sceneId: string, field: string) => Promise<void>;
    updateScene: (sceneId: string, data: Partial<SceneWithState>) => Promise<void>;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export const useCollaboration = () => {
    const context = useContext(CollaborationContext);
    if (!context) throw new Error("useCollaboration must be used within a CollaborationProvider");
    return context;
};

interface CollaborationProviderProps {
    projectId: string;
    children: React.ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ projectId, children }) => {
    const [scenes, setScenes] = useState<SceneWithState[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) return;

        const q = query(
            collection(db, "projects", projectId, "scenes"),
            orderBy("sequenceNumber", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const scenesData = snapshot.docs.map((doc) => ({
                sceneId: doc.id,
                ...doc.data(),
            })) as SceneWithState[];
            setScenes(scenesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [projectId]);

    const lockField = async (sceneId: string, field: string) => {
        // Placeholder for field-level locking logic
        // In a real app, we'd check if it's already locked by someone else
        // For now, we just update the 'lockedBy' field on the doc
        // const user = auth.currentUser;
        // if (!user) return;

        // await updateDoc(doc(db, "projects", projectId, "scenes", sceneId), {
        //   lockedBy: user.uid,
        //   lockedAt: Timestamp.now(),
        //   currentFocus: field
        // });
        console.log(`Locking ${field} in scene ${sceneId}`);
    };

    const unlockField = async (sceneId: string, field: string) => {
        // await updateDoc(doc(db, "projects", projectId, "scenes", sceneId), {
        //   lockedBy: null,
        //   lockedAt: null,
        //   currentFocus: null
        // });
        console.log(`Unlocking ${field} in scene ${sceneId}`);
    };

    const updateScene = async (sceneId: string, data: Partial<SceneWithState>) => {
        await updateDoc(doc(db, "projects", projectId, "scenes", sceneId), data);
    };

    return (
        <CollaborationContext.Provider value={{ scenes, loading, lockField, unlockField, updateScene }}>
            {children}
        </CollaborationContext.Provider>
    );
};
