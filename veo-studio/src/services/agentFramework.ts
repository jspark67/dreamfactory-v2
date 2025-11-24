/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from '@google/genai';
import type {
    FunctionDeclaration,
    Part,
    Tool,
} from '@google/genai';

/**
 * --- Agent Framework Core ---
 * A flexible, modular framework for building GenAI Agents.
 */

/**
 * Defines a Tool that an Agent can use.
 * Includes both the schema (for the model) and the implementation (for execution).
 */
export interface AgentTool {
    declaration: FunctionDeclaration;
    execute: (args: any) => Promise<any> | any;
}

/**
 * Configuration for creating a new Agent.
 */
export interface AgentConfig {
    model: string;
    systemInstruction?: string;
    temperature?: number;
    tools?: AgentTool[];
}

/**
 * The GenAI Agent.
 * Autonomous entity capable of reasoning, using tools, and maintaining conversation state.
 */
export class Agent {
    private ai: GoogleGenAI;
    private modelName: string;
    private systemInstruction?: string;
    private temperature: number;
    private tools: Map<string, AgentTool>;
    private geminiTools: Tool[];

    constructor(config: AgentConfig) {
        this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
        this.modelName = config.model;
        this.systemInstruction = config.systemInstruction;
        this.temperature = config.temperature ?? 0.7;
        this.tools = new Map();
        this.geminiTools = [];

        // Register tools if provided
        if (config.tools) {
            const functionDeclarations: FunctionDeclaration[] = [];
            for (const tool of config.tools) {
                const toolName = tool.declaration.name || 'unknown_tool';
                this.tools.set(toolName, tool);
                functionDeclarations.push(tool.declaration);
            }
            if (functionDeclarations.length > 0) {
                this.geminiTools.push({ functionDeclarations });
            }
        }
    }

    /**
     * Runs the agent with a given input.
     * Handles the "Reasoning Loop" (Model -> Tool Call -> Execute -> Model) automatically.
     */
    async run(input: string): Promise<string> {
        try {
            // Initialize a new chat session for this run to maintain context during tool use
            const chat = this.ai.chats.create({
                model: this.modelName,
                config: {
                    systemInstruction: this.systemInstruction,
                    temperature: this.temperature,
                    tools: this.geminiTools.length > 0 ? this.geminiTools : undefined,
                },
            });

            // Send initial message
            let response = await chat.sendMessage({ message: input });

            // --- The Agent Execution Loop ---
            // If the model asks to call functions, we execute them and feed the results back.
            const maxTurns = 10; // Prevent infinite loops
            let turns = 0;

            while (
                response.functionCalls &&
                response.functionCalls.length > 0 &&
                turns < maxTurns
            ) {
                turns++;
                const functionResponseParts: Part[] = [];

                // Execute all requested tools in parallel
                await Promise.all(
                    response.functionCalls.map(async (call) => {
                        const tool = call.name ? this.tools.get(call.name) : undefined;
                        let result: any;

                        if (tool) {
                            try {
                                console.log(`Agent executing tool: ${call.name}`, call.args);
                                result = await tool.execute(call.args);
                            } catch (error) {
                                console.error(`Tool execution failed: ${call.name}`, error);
                                result = {
                                    error:
                                        error instanceof Error ? error.message : 'Unknown error',
                                };
                            }
                        } else {
                            result = { error: `Tool ${call.name} not found` };
                        }

                        // Construct the response part for the model
                        functionResponseParts.push({
                            functionResponse: {
                                id: call.id,
                                name: call.name,
                                response: { result: result },
                            },
                        });
                    }),
                );

                // Send tool results back to the model to continue the conversation
                if (functionResponseParts.length > 0) {
                    response = await chat.sendMessage({ message: functionResponseParts });
                }
            }

            return response.text || '';
        } catch (error) {
            console.error('Agent run failed:', error);
            throw error;
        }
    }
}

/**
 * --- Agent Blueprint: Creative Director ---
 * A specific implementation of an Agent using the Agent Framework.
 */
export const createDirectorAgent = () => {
    return new Agent({
        model: 'gemini-2.5-flash',
        temperature: 0.8,
        systemInstruction: `You are a visionary Film Director and Cinematographer AI.

YOUR MISSION:
Transform brief, simple user ideas into rich, detailed, and cinematic video prompts suitable for high-end AI video generation models (like Veo).

GUIDELINES:
1.  **Expand Visuals**: Describe lighting (e.g., volumetric, chiaroscuro), texture (e.g., gritty, glossy), and colors.
2.  **Camera Work**: Specify camera movement (e.g., dolly zoom, tracking shot, drone pan) and lens types (e.g., macro, wide-angle).
3.  **Atmosphere**: Establish the mood (e.g., melancholic, euphoric, tense).
4.  **Conciseness**: Keep the output focused on the visual description. Do not include conversational filler like "Here is your prompt:". Just output the prompt.

EXAMPLE INPUT: "A cat eating ramen."
EXAMPLE OUTPUT: "Close-up, low-angle shot of a fluffy calico cat sitting at a neon-lit wooden cyberpunk ramen bar. Rain streams down the window in the background. The cat slurps noodles with intense focus. Cinematic lighting, blade runner style, 8k resolution, highly detailed fur texture."`,
        // In the future, we could add tools here, e.g., a tool to look up camera lenses or color palettes.
        tools: [],
    });
};
