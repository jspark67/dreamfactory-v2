import { NextRequest, NextResponse } from 'next/server';

// --- Helper: Antigravity Integration (Placeholder) ---
async function logToAntigravityManager(projectId: string, step: string, status: string, details?: unknown) {
    // Future: Stream status to Antigravity console
    console.log(`[Antigravity] Project: ${projectId}, Step: ${step}, Status: ${status}`, details);
}

// --- API Handler ---

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as { projectId?: string; topic?: string };
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

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('Orchestrator Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
