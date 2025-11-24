import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { generateScript, WriterInput } from '@/agents/writer';
import { generateConsistentImage, ArtistInput } from '@/agents/artist';
import { generateSceneVideo, DirectorInput } from '@/agents/director';

// --- Interfaces ---

interface OrchestratorRequest {
    projectId: string;
    step: 'writing' | 'drawing' | 'directing';
    input: any; // Specific input type depends on step
}

// --- Helper: Antigravity Integration (Placeholder) ---
async function logToAntigravityManager(projectId: string, step: string, status: string, details?: any) {
    // Future: Stream status to Antigravity console
    console.log(`[Antigravity] Project: ${projectId}, Step: ${step}, Status: ${status}`, details);
}

// --- API Handler ---

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectId, topic } = body; // Simplified input for full pipeline

        if (!projectId || !topic) {
            return NextResponse.json({ error: 'Missing required fields: projectId, topic' }, { status: 400 });
        }

        await logToAntigravityManager(projectId, 'full-pipeline', 'STARTED');

        // Call Python Backend Full Pipeline
        const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${pythonBackendUrl}/api/generate/full-scene`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                project_id: projectId,
                topic: topic,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Python Backend Error: ${response.status} ${errorText}`);
        }

        const result = await response.json();

        await logToAntigravityManager(projectId, 'full-pipeline', 'DISPATCHED', result);
        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error('Orchestrator Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
