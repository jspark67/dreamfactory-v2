"""
Agent Framework for GenAI Agents
Refactored from veo-studio/src/services/agentFramework.ts
"""
from google import genai
from google.genai import types
import os
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class AgentTool:
    """
    Defines a tool that an Agent can use.
    Includes both the schema (for the model) and the implementation (for execution).
    """
    declaration: types.FunctionDeclaration
    execute: Callable[[Dict[str, Any]], Any]


@dataclass
class AgentConfig:
    """Configuration for creating a new Agent."""
    model: str
    system_instruction: Optional[str] = None
    temperature: float = 0.7
    tools: Optional[List[AgentTool]] = None


class Agent:
    """
    GenAI Agent capable of reasoning, using tools, and maintaining conversation state.
    """
    
    def __init__(self, config: AgentConfig):
        self.client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model_name = config.model
        self.system_instruction = config.system_instruction
        self.temperature = config.temperature
        self.tools: Dict[str, AgentTool] = {}
        self.gemini_tools: List[types.Tool] = []
        
        # Register tools if provided
        if config.tools:
            function_declarations = []
            for tool in config.tools:
                tool_name = tool.declaration.name
                self.tools[tool_name] = tool
                function_declarations.append(tool.declaration)
            
            if function_declarations:
                self.gemini_tools.append(
                    types.Tool(function_declarations=function_declarations)
                )
    
    def run(self, input_text: str) -> str:
        """
        Runs the agent with a given input.
        Handles the "Reasoning Loop" (Model -> Tool Call -> Execute -> Model) automatically.
        
        Args:
            input_text: User input
            
        Returns:
            Agent's response text
        """
        try:
            # Create chat session
            chat_config = {
                "model": self.model_name,
                "config": types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    temperature=self.temperature,
                ),
            }
            
            if self.gemini_tools:
                chat_config["config"].tools = self.gemini_tools
            
            chat = self.client.chats.create(**chat_config)
            
            # Send initial message
            response = chat.send_message(message=input_text)
            
            # Agent execution loop
            max_turns = 10  # Prevent infinite loops
            turns = 0
            
            while (
                hasattr(response, 'function_calls') and
                response.function_calls and
                len(response.function_calls) > 0 and
                turns < max_turns
            ):
                turns += 1
                function_response_parts = []
                
                # Execute all requested tools
                for call in response.function_calls:
                    tool = self.tools.get(call.name)
                    
                    if tool:
                        try:
                            print(f"Agent executing tool: {call.name}", call.args)
                            result = tool.execute(call.args)
                        except Exception as error:
                            print(f"Tool execution failed: {call.name}", error)
                            result = {
                                "error": str(error)
                            }
                    else:
                        result = {"error": f"Tool {call.name} not found"}
                    
                    # Construct response part for the model
                    function_response_parts.append(
                        types.Part(
                            function_response=types.FunctionResponse(
                                id=call.id,
                                name=call.name,
                                response={"result": result}
                            )
                        )
                    )
                
                # Send tool results back to the model
                if function_response_parts:
                    response = chat.send_message(message=function_response_parts)
            
            return response.text or ""
        
        except Exception as error:
            print(f"Agent run failed: {error}")
            raise


def create_director_agent() -> Agent:
    """
    Creates a Creative Director Agent for enhancing video prompts.
    Refactored from agentFramework.ts createDirectorAgent()
    """
    return Agent(
        config=AgentConfig(
            model="gemini-2.0-flash-exp",
            temperature=0.8,
            system_instruction="""You are a visionary Film Director and Cinematographer AI.

YOUR MISSION:
Transform brief, simple user ideas into rich, detailed, and cinematic video prompts suitable for high-end AI video generation models (like Veo).

GUIDELINES:
1.  **Expand Visuals**: Describe lighting (e.g., volumetric, chiaroscuro), texture (e.g., gritty, glossy), and colors.
2.  **Camera Work**: Specify camera movement (e.g., dolly zoom, tracking shot, drone pan) and lens types (e.g., macro, wide-angle).
3.  **Atmosphere**: Establish the mood (e.g., melancholic, euphoric, tense).
4.  **Conciseness**: Keep the output focused on the visual description. Do not include conversational filler like "Here is your prompt:". Just output the prompt.

EXAMPLE INPUT: "A cat eating ramen."
EXAMPLE OUTPUT: "Close-up, low-angle shot of a fluffy calico cat sitting at a neon-lit wooden cyberpunk ramen bar. Rain streams down the window in the background. The cat slurps noodles with intense focus. Cinematic lighting, blade runner style, 8k resolution, highly detailed fur texture."
""",
            tools=[]  # Can add tools in the future
        )
    )


# Convenience function for motion prompt enhancement
def enhance_motion_prompt(simple_prompt: str) -> str:
    """
    Enhance a simple motion prompt into a cinematic description.
    
    Args:
        simple_prompt: Simple user prompt
        
    Returns:
        Enhanced cinematic prompt
    """
    agent = create_director_agent()
    return agent.run(simple_prompt)
