
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function testKey() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found.");
        return;
    }

    console.log(`Testing key: ${apiKey.substring(0, 5)}...`);
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Use the model manager to list models
        // Note: The SDK doesn't expose listModels directly on genAI instance in all versions, 
        // but we can try a simple generation with 'gemini-pro' which is the most standard.
        // Or we can try to use the listModels endpoint via fetch if SDK doesn't support it easily.

        console.log("Attempting to generate with 'gemini-pro'...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("✅ 'gemini-pro' worked! Response:", result.response.text());

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ 'gemini-pro' Failed:", message);
        console.error("Full Error:", JSON.stringify(error, null, 2));
    }
}

testKey();
