import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Interfaces ---

export interface DirectorInput {
    imageUrl: string;
    script: string; // Dialogue or narration
    visualPrompt: string;
    audioPrompt?: string; // Optional additional audio instructions
}

export interface VideoComposition {
    type: "ken_burns";
    config: {
        zoomStart: number;
        zoomEnd: number;
        panX: number;
        panY: number;
        duration: number; // in seconds
    };
}

export interface DirectorOutput {
    videoUrl?: string;
    videoComposition?: VideoComposition;
    fallbackReason?: string;
}

// --- Configuration ---

// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// --- Helper Functions ---

function getRandomKenBurnsConfig(): VideoComposition["config"] {
    const zoomStart = 1.0;
    const zoomEnd = 1.1 + Math.random() * 0.2; // 1.1 to 1.3
    const panX = (Math.random() - 0.5) * 20; // -10 to 10
    const panY = (Math.random() - 0.5) * 20; // -10 to 10
    const duration = 3 + Math.random() * 2; // 3 to 5 seconds

    return { zoomStart, zoomEnd, panX, panY, duration };
}

async function urlToPart(url: string) {
    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return {
            inlineData: {
                data: Buffer.from(buffer).toString("base64"),
                mimeType: response.headers.get("content-type") || "image/jpeg",
            },
        };
    } catch (error) {
        console.error("Error fetching image for video generation:", error);
        throw new Error("Failed to fetch source image.");
    }
}

// --- Core Logic ---

/**
 * Generates a video using Veo 3.1.
 */
async function generateVideoVeo(input: DirectorInput): Promise<string> {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    // @ts-expect-error video generation model types may be preview-only
    const model = genAI.getGenerativeModel({ model: "veo-3.1" });

    const imagePart = await urlToPart(input.imageUrl);

    // Construct a rich prompt combining visuals and audio
    const fullPrompt = `
    Cinematic Video Generation.
    Visuals: ${input.visualPrompt}
    Audio: ${input.audioPrompt || "Ambient sound matching the scene."}
    Dialogue: "${input.script}"
  `;

    try {
        // @ts-expect-error generateContent payload for Veo is preview-only
        const result = await model.generateContent([fullPrompt, imagePart]);
        const response = result.response as { videos?: Array<{ url?: string; uri?: string }> };

        const videos = response?.videos ?? [];
        if (videos.length > 0) {
            return videos[0].url || videos[0].uri;
        }

        throw new Error("No video returned from generation model.");
    } catch (error) {
        console.error("Error generating video with Veo:", error);
        throw error;
    }
}

/**
 * Generates a fallback composition (Ken Burns effect) for Remotion.
 */
function generateVideoFallback(): DirectorOutput {
    console.log("Generating fallback video composition...");
    return {
        videoComposition: {
            type: "ken_burns",
            config: getRandomKenBurnsConfig(),
        },
        fallbackReason: "Veo generation failed or timed out.",
    };
}

/**
 * Main function to generate a scene video, handling fallbacks.
 */
export async function generateSceneVideo(input: DirectorInput): Promise<DirectorOutput> {
    try {
        console.log("Attempting to generate video with Veo 3.1...");
        // We might want to add a timeout here if the API doesn't support it natively
        // const videoUrl = await withTimeout(generateVideoVeo(input), 60000); 
        const videoUrl = await generateVideoVeo(input);
        return { videoUrl };
    } catch (error) {
        console.warn("Veo generation failed. Switching to fallback.", error);
        return generateVideoFallback();
    }
}
