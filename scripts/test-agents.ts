
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file:", result.error);
}

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log(`API Key loaded: ${apiKey ? "YES" : "NO"}`);
if (apiKey) {
    console.log(`API Key prefix: ${apiKey.substring(0, 5)}...`);
} else {
    console.error("CRITICAL: NEXT_PUBLIC_GEMINI_API_KEY is missing!");
}

import { generateScript, WriterInput } from '../src/agents/writer';
import { generateConsistentImage, ArtistInput } from '../src/agents/artist';
import { generateSceneVideo, DirectorInput } from '../src/agents/director';

async function testAgents() {
    console.log("🚀 Starting DreamFactory v2.0 Agent Tests...\n");

    // --- Test 1: Writer Agent ---
    console.log("📝 Testing Writer Agent...");
    const writerInput: WriterInput = {
        topic: "A futuristic city where it rains neon light.",
        productionBible: {
            genre: "Sci-Fi",
            tone: "Melancholic",
            visualStyle: "Cyberpunk",
            characters: {
                "hero": {
                    name: "Kael",
                    description: "A weary detective with a cybernetic eye.",
                    referenceImageUrls: []
                }
            }
        }
    };

    let scriptOutput;
    try {
        scriptOutput = await generateScript(writerInput);
        console.log("✅ Writer Agent Success!");
        console.log("Scenes generated:", scriptOutput.scenes.length);
        console.log("Global Rationale:", scriptOutput.globalRationale);
        console.log("First Scene Script:", scriptOutput.scenes[0].script);
    } catch (error) {
        console.error("❌ Writer Agent Failed (API Error). Using MOCK data to continue test.");
        scriptOutput = {
            scenes: [{
                sceneId: "mock-scene-1",
                sequenceNumber: 1,
                script: "A neon rain falls on the city.",
                visualPrompt: "Cyberpunk city, neon rain, dark atmosphere",
                rationale: "Sets the mood."
            }],
            globalRationale: "Mock rationale",
            thoughtSignature: "mock-sig"
        };
    }

    // --- Test 2: Artist Agent ---
    console.log("\n🎨 Testing Artist Agent (using first scene)...");
    const firstScene = scriptOutput.scenes[0];
    const artistInput: ArtistInput = {
        visualPrompt: firstScene.visualPrompt,
        referenceImageUrls: [] // No reference for first image
    };

    let imageOutput;
    try {
        imageOutput = await generateConsistentImage(artistInput);
        console.log("✅ Artist Agent Success!");
        console.log("Image URL:", imageOutput.imageUrl);
        if (imageOutput.consistencyScore) {
            console.log("Consistency Score:", imageOutput.consistencyScore);
        }
    } catch (error) {
        console.error("❌ Artist Agent Failed:", error);
        // Continue to test Director with a placeholder if Artist fails
        imageOutput = { imageUrl: "https://via.placeholder.com/1920x1080.png?text=Fallback+Image" };
    }

    // --- Test 3: Director Agent ---
    console.log("\n🎬 Testing Director Agent...");
    const directorInput: DirectorInput = {
        imageUrl: imageOutput.imageUrl,
        script: firstScene.script,
        visualPrompt: firstScene.visualPrompt,
        audioPrompt: "Rain sounds, distant sirens."
    };

    try {
        const videoOutput = await generateSceneVideo(directorInput);
        console.log("✅ Director Agent Success!");
        if (videoOutput.videoUrl) {
            console.log("Video URL:", videoOutput.videoUrl);
        } else {
            console.log("Fallback Video Composition:", videoOutput.videoComposition);
            console.log("Fallback Reason:", videoOutput.fallbackReason);
        }
    } catch (error) {
        console.error("❌ Director Agent Failed:", error);
    }

    console.log("\n🎉 All Tests Completed.");
}

testAgents();
