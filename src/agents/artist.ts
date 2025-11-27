import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Interfaces ---

export interface ArtistInput {
    visualPrompt: string;
    referenceImageUrls: string[];
}

export interface ArtistOutput {
    imageUrl: string;
    revisedPrompt?: string;
    consistencyScore?: number;
    consistencyFeedback?: string;
}

// --- Configuration ---

// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// --- Helper Functions ---

type InlinePart = {
    inlineData: {
        data: string;
        mimeType: string;
    };
};

async function urlToPart(url: string): Promise<InlinePart> {
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
        console.error("Error fetching image for vision check:", error);
        throw new Error("Failed to fetch reference image.");
    }
}

// --- Core Logic ---

/**
 * Generates an image using Gemini 3.0 Image Pro with reference image injection.
 */
async function generateImageTool(prompt: string, referenceImageUrls: string[]): Promise<string> {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    // Note: using 'any' for model as image generation specific types might be in preview
    // @ts-expect-error image model types are preview-only
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    // Construct payload: Pass reference images as parts of the content
    const parts: Array<{ text: string } | InlinePart> = [{ text: prompt }];

    for (const url of referenceImageUrls) {
        try {
            const imagePart = await urlToPart(url);
            parts.push(imagePart);
        } catch {
            console.warn(`Failed to fetch reference image ${url}, skipping.`);
        }
    }

    const payload = {
        contents: [{ parts: parts }],
    };

    try {
        // @ts-expect-error generateContent with this payload may not be fully typed yet
        const result = await model.generateContent(payload);
        const response = result.response;

        // Assuming the response contains the image URL or data
        // For this implementation, we'll assume the API returns a signed URL or base64
        // Adjust based on actual API response structure. 
        // If it returns base64, we might need to upload it to storage first.
        // For now, let's assume it returns a list of images and we take the first one.

        // Mocking the return for now if actual API behavior differs, 
        // but aiming for the structure: result.response.images[0].url or similar
        // If the SDK returns inline data, we would convert to a blob URL or upload.

        // Extract image from candidates
        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0] as InlinePart | undefined;

        if (part?.inlineData?.data) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || "image/jpeg";
            return `data:${mimeType};base64,${base64Data}`;
        }

        throw new Error("No image returned from generation model.");

    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
}

/**
 * Checks consistency between the generated image and the reference image using Gemini 3.0 Vision.
 */
async function checkConsistency(
    generatedImageUrl: string,
    referenceImageUrl: string
): Promise<{ score: number; feedback: string }> {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro" });

    const generatedPart = await urlToPart(generatedImageUrl);
    const referencePart = await urlToPart(referenceImageUrl);

    const prompt = `
    Do these two images depict the exact same character? 
    Rate the similarity on a scale of 0 to 100.
    List specific differences in facial features, hair, clothing, or style.
    
    Output format:
    Score: [Number]
    Differences: [Text description]
  `;

    const result = await model.generateContent([prompt, referencePart, generatedPart]);
    const text = result.response.text();

    // Parse the text response
    const scoreMatch = text.match(/Score:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

    const feedbackMatch = text.match(/Differences:\s*([\s\S]*)/i);
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : "No specific feedback provided.";

    return { score, feedback };
}

/**
 * Main function to generate a consistent character image with self-correction loop.
 */
export async function generateConsistentImage(input: ArtistInput): Promise<ArtistOutput> {
    let currentPrompt = input.visualPrompt;
    let attempts = 0;
    const maxRetries = 2;

    while (attempts <= maxRetries) {
        try {
            console.log(`Attempt ${attempts + 1}: Generating image...`);
            const imageUrl = await generateImageTool(currentPrompt, input.referenceImageUrls);

            // If no reference images, we can't check consistency, so just return
            if (input.referenceImageUrls.length === 0) {
                return { imageUrl };
            }

            // Check consistency against the PRIMARY reference image (first one)
            console.log(`Attempt ${attempts + 1}: Checking consistency...`);
            const { score, feedback } = await checkConsistency(imageUrl, input.referenceImageUrls[0]);
            console.log(`Consistency Score: ${score}`);

            if (score >= 80) {
                return { imageUrl, consistencyScore: score, consistencyFeedback: feedback };
            }

            // If score is low, refine prompt and retry
            if (attempts < maxRetries) {
                console.log("Score too low. Refining prompt...");
                // Simple refinement strategy: Append negative feedback to prompt
                // In a real scenario, we might use an LLM to rewrite the prompt intelligently
                currentPrompt = `${input.visualPrompt}. Ensure consistency with reference: ${feedback}. Fix these issues: ${feedback}`;
            } else {
                // Max retries reached, return best effort (or the last one)
                console.warn("Max retries reached. Returning last generated image.");
                return {
                    imageUrl,
                    revisedPrompt: currentPrompt,
                    consistencyScore: score,
                    consistencyFeedback: feedback
                };
            }

            attempts++;
        } catch (error) {
            console.error("Error in generateConsistentImage loop:", error);
            // If it's a critical API error, we might want to stop or return a placeholder
            throw error;
        }
    }

    throw new Error("Failed to generate image after max retries.");
}
