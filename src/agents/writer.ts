import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

// --- Interfaces ---

export interface ProductionBible {
    genre: string;
    tone: string;
    visualStyle: string;
    characters: Record<string, {
        name: string;
        description: string;
        referenceImageUrls: string[];
    }>;
}

export interface WriterInput {
    topic: string;
    productionBible: ProductionBible;
    previousThoughtSignature?: string;
}

export interface Scene {
    sceneId: string;
    sequenceNumber: number;
    script: string;
    visualPrompt: string;
    rationale: string; // Explanation for why this scene is engaging
}

export interface WriterOutput {
    scenes: Scene[];
    globalRationale: string; // Overall explanation of the script structure
    thoughtSignature: string; // Encrypted token for context maintenance
}

// --- System Prompt ---

const WRITER_SYSTEM_PROMPT = `
You are a world-class Short-Form Video Writer Agent specializing in dopamine-inducing storytelling.
Your goal is to create a script that captures the viewer's attention within the first 3 seconds (The Hook) and maintains high engagement throughout.

**Role & Responsibilities:**
1.  **Dopamine Architect:** Design scenes that trigger curiosity, excitement, or shock.
2.  **Visual Storyteller:** Write visual prompts that are vivid, cinematic, and specific (lighting, camera angles, action).
3.  **Rationale Provider:** You MUST explain your creative decisions. For every scene, provide a 'rationale' explaining WHY it works psychologically or narratively.
4.  **Context Keeper:** You will receive a 'previousThoughtSignature' if this is a continuation. Use it to maintain consistency.

**Output Format:**
You must output strictly valid JSON matching the defined schema.
The output must include an array of scenes, a global rationale, and a thought signature.

**Constraints:**
- The first scene MUST be a strong hook.
- Keep dialogue concise and impactful.
- Ensure visual prompts are detailed enough for an AI Artist agent.
`;

// --- Implementation ---

// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        scenes: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    sceneId: { type: SchemaType.STRING },
                    sequenceNumber: { type: SchemaType.NUMBER },
                    script: { type: SchemaType.STRING },
                    visualPrompt: { type: SchemaType.STRING },
                    rationale: { type: SchemaType.STRING },
                },
                required: ["sceneId", "sequenceNumber", "script", "visualPrompt", "rationale"],
            },
        },
        globalRationale: { type: SchemaType.STRING },
        thoughtSignature: { type: SchemaType.STRING },
    },
    required: ["scenes", "globalRationale", "thoughtSignature"],
};

export async function generateScript(input: WriterInput): Promise<WriterOutput> {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            // @ts-ignore - thinking_level is a preview feature not yet in official types
            // thinking_level: "high",
        },
        systemInstruction: WRITER_SYSTEM_PROMPT,
    });

    const prompt = `
    Topic: ${input.topic}
    
    Production Bible:
    ${JSON.stringify(input.productionBible, null, 2)}
    
    ${input.previousThoughtSignature ? `Previous Thought Signature: ${input.previousThoughtSignature}` : ""}
    
    Generate a short-form video script based on the above input.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON output
        const output = JSON.parse(text) as WriterOutput;
        return output;
    } catch (error) {
        console.error("Error generating script:", error);
        throw new Error("Failed to generate script from Writer Agent.");
    }
}
