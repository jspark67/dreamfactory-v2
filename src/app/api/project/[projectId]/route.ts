import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const projectId = (await params).projectId;

    try {
        const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${pythonBackendUrl}/api/project/${projectId}`);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch project status' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching project status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
