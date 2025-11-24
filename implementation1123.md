# DreamFactory v2 백엔드 코드 리뷰 (2025-11-24)

## 1. 종합 리뷰 (Overall Review)

### **1.1. 총평 (Executive Summary)**

`dreamfactory-v2`의 백엔드는 **매우 인상적이고, 정교하게 설계된 AI 에이전트 시스템**입니다. FastAPI와 Google Generative AI(ADK) 기반의 현대적인 기술 스택을 활용하여, '총괄 프로듀서' 역할을 하는 감독(Supervisor) 에이전트가 작가(Writer), 아티스트(Artist), 감독(Director)으로 구성된 전문가 팀을 지휘하여 콘텐츠를 제작하는 진보적인 아키텍처를 성공적으로 구현했습니다.

프로토타입 단계임에도 불구하고, 최신 AI 에이전트 설계 패턴에 대한 깊은 이해를 보여주는 훌륭한 코드 베이스입니다.

### **1.2. 아키텍처 리뷰 (Architecture Review)**

*   **계층적 에이전트 시스템 (Hierarchical Agent System)**
    *   이 시스템의 핵심은 **`라우터 -> 감독 -> 전문가`**로 이어지는 계층 구조입니다. 사용자의 요청을 '라우터'가 분석하여 의도를 파악하고, '감독' 에이전트가 그 의도에 따라 전체 작업 흐름을 계획하고 지시하며, '전문가' 에이전트들이 실제 작업을 수행합니다. 이는 매우 유연하고 확장성이 뛰어난 최신 에이전트 아키텍처입니다.

*   **선언적 에이전트 정의 (Declarative Agent Definition)**
    *   각 에이전트의 로직을 코드로 하드코딩하는 대신, 자연어 프롬프트(Instruction)와 도구(Tools) 목록으로 정의하는 방식을 사용합니다. 이 덕분에 복잡한 작업 흐름을 프롬프트 수정만으로 쉽게 변경할 수 있는 엄청난 유연성을 가집니다.

*   **상태 관리 (State Management)**
    *   에이전트들의 각 작업 결과(대본, 이미지 URL 등)를 중앙 데이터베이스(현재는 JSON 파일)에 저장하고, 다음 단계의 에이전트가 그 결과를 읽어 작업하는 방식으로 전체 파이프라인의 상태를 관리합니다. 이는 비동기적으로 실행되는 여러 에이전트 간의 상태를 동기화하는 매우 영리하고 효과적인 방법입니다.

*   **API 설계 (API Design)**
    *   FastAPI의 `BackgroundTasks`를 활용하여 AI 작업처럼 오래 걸리는 프로세스를 백그라운드에서 처리함으로써, 클라이언트가 즉시 응답을 받을 수 있도록 한 점은 매우 훌륭한 설계입니다.

### **1.3. 코드 품질 및 우수 사례 (Code Quality & Best Practices)**

*   **모듈성**: API, 에이전트, 도구, 유틸리티 등 기능별로 코드가 명확하게 분리되어 구조가 깔끔합니다.
*   **가독성**: 코드 전반에 걸쳐 네이밍이 명확하고, 특히 에이전트 워크플로우를 추적하기 쉽도록 적절한 로깅(예: `👨‍💼`, `✍️`)을 사용한 점이 돋보입니다.
*   **프롬프트 엔지니어링**: 에이전트에게 내리는 지시(Instruction)는 역할, 목표, 작업 흐름, 도구 사용 예시까지 매우 명확하게 작성되어 있습니다. 이는 LLM 에이전트의 안정성을 극대화하는 교과서적인 프롬프트 작성법입니다.

### **1.4. 핵심 개선 제안 (Key Improvement Opportunities)**

1.  **동시성 문제 해결 (우선순위: 높음)**
    *   `utils/local_db.py`의 JSON 파일 접근은 여러 요청이 동시에 들어올 경우 데이터 유실의 위험이 있습니다. 이는 가장 먼저 해결해야 할 중대한 문제입니다.
    *   **해결책**: `asyncio.Lock`을 사용하여 파일 읽기/쓰기 작업을 감싸 원자성(atomic)을 보장해야 합니다.

2.  **도구 안정성 강화 (우선순위: 중간)**
    *   `tools/writer_tools.py`의 `save_scene_script`와 같은 함수들이 LLM 에이전트로부터 받은 데이터(dictionary)를 그대로 사용하고 있습니다.
    *   **해결책**: 에이전트가 잘못된 형식의 데이터를 넘겨줄 경우를 대비해, 함께 정의된 Pydantic 모델(`SceneScript`)을 사용하여 데이터 유효성을 검증하는 로직을 추가하면 코드가 훨씬 더 견고해집니다.

3.  **에러 핸들링 일관성 확보 (우선순위: 중간)**
    *   `api/routes.py`에서 아티스트 작업 실패 시 DB 상태를 'error'로 변경하는 로직은 훌륭하지만, 작가나 감독 작업에는 이 로직이 빠져있습니다.
    *   **해결책**: 모든 백그라운드 작업에 실패 시 DB 상태를 업데이트하는 에러 핸들링 로직을 일관되게 적용하여, 프론트엔드에서 작업 상태를 정확히 추적할 수 있도록 해야 합니다.

4.  **리팩토링 및 확장 (우선순위: 낮음)**
    *   **DB 로직 이전**: `main.py`의 테스트 API에 포함된 DB 검색 로직을 `local_db.py` 안의 유틸리티 함수로 옮겨 캡슐화하는 것이 좋습니다.
    *   **Firestore 전환**: 현재 목업(mock-up) 상태인 `get_project_bible` 함수를 구현하고, `local_db.py`의 기능을 `firestore_helpers.py`로 완전히 이전하여 확장성 있는 데이터베이스 시스템으로 전환하는 작업을 진행할 수 있습니다.

--- 

## 2. 세부 파일 분석 (Detailed File Analysis)

### `backend/requirements.txt`

```python
fastapi
uvicorn
google-genai
firebase-admin
python-dotenv
pydantic
requests
pillow
```

*   **분석**: 백엔드가 **FastAPI** 프레임워크를 기반으로 구축되었으며, **Google Generative AI SDK (`google-genai`)** 를 사용하여 핵심 AI 기능을 구현하고 **Firebase (`firebase-admin`)** 와 연동하는 현대적인 기술 스택을 사용하고 있음을 확인했습니다.

### `backend/main.py`

```python
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents import orchestrator
from tools.delegation_tools import delegate_to_writer, delegate_to_artist, delegate_to_director

try:
    from api.routes import router as api_router
    has_api_router = True
except ImportError:
    has_api_router = False

app = FastAPI()

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files (UI & Media)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

if has_api_router:
    app.include_router(api_router, prefix="/api")

class PipelineRequest(BaseModel):
    project_id: str
    topic: str

@app.post("/api/generate/full-scene")
async def generate_full_scene(request: PipelineRequest, background_tasks: BackgroundTasks):
    """
    Triggers the full Writer -> Artist -> Director pipeline using ADK.
    """
    background_tasks.add_task(
        orchestrator.run_adk_pipeline, 
        request.project_id, 
        request.topic
    )

    return {
        "status": "started",
        "message": "The AI production team has started working (ADK).",
        "project_id": request.project_id
    }

# --- Test Endpoints ---

class TestRequest(BaseModel):
    project_id: str
    input_text: str = ""  # optional, default empty
    prompt: str = ""      # optional video prompt
    scene_id: str = None
    image_url: str = None

@app.post("/api/test/writer")
async def test_writer(request: TestRequest):
    try:
        result = await delegate_to_writer(request.input_text, request.project_id)
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/test/artist")
async def test_artist(request: TestRequest):
    try:
        if not request.scene_id:
            return {"error": "scene_id required"}
        
        # Auto-fetch visual_prompt from DB if not provided
        visual_prompt = request.input_text
        if not visual_prompt or visual_prompt.strip() == "":
            # Extract project_id from scene data
            from utils.local_db import get_scene, _load_db
            db = _load_db()
            
            # Find the scene in any project
            scene_data = None
            project_id = request.project_id
            
            for pid, project in db.get("projects", {{}}).items():
                if request.scene_id in project.get("scenes", {{}}):
                    scene_data = project["scenes"][request.scene_id]
                    project_id = pid
                    break
            
            if scene_data and "visual_prompt" in scene_data:
                visual_prompt = scene_data["visual_prompt"]
            else:
                return {"error": f"Scene {request.scene_id} not found or has no visual_prompt"}
        
        result = await delegate_to_artist(request.scene_id, visual_prompt)
        return {
            "result": result,
            "visual_prompt_used": visual_prompt
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/test/director")
async def test_director(request: TestRequest):
    try:
        if not request.scene_id or not request.image_url:
            return {"error": "scene_id and image_url required"}
        # Use the explicit prompt field; fallback to input_text if prompt empty
        used_prompt = request.prompt or request.input_text
        result = await delegate_to_director(request.scene_id, request.image_url, used_prompt, request.project_id)
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "DreamFactory v2.1 Backend is running. Go to /static/index.html for testing."}
```

*   **분석**: `main.py`는 FastAPI의 모범 사례(Pydantic, Background Tasks)를 잘 활용하고 있습니다. 특히, 오래 걸리는 AI 작업을 백그라운드에서 처리하는 방식은 매우 효율적입니다. 다만, 테스트 엔드포인트 내에 데이터베이스 로직이 직접 노출되는 등 일부 코드 구조는 개선의 여지가 보입니다.

### `backend/api/routes.py`

```python
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from backend.agents.writer import WriterAgent
from backend.agents.artist import ArtistAgent
from backend.agents.director import DirectorAgent
from backend.utils.firestore_helpers import update_scene, get_project_bible, upload_to_storage
import uuid
import os

router = APIRouter()

class GenerateRequest(BaseModel):
    project_id: str
    scene_id: str = None
    agent_type: str # "writer", "artist", "director"
    input_context: dict

def run_writer_task(project_id: str, input_context: dict):
    agent = WriterAgent()
    try:
        # Fetch bible/context if needed
        # bible = get_project_bible(project_id)
        
        result = agent.generate_script(
            topic=input_context.get("topic"),
            genre=input_context.get("genre"),
            tone=input_context.get("tone")
        )
        
        # Save scenes to Firestore
        # This logic would iterate over result.scenes and create documents
        print(f"Writer task completed for project {project_id}")
        
    except Exception as e:
        print(f"Writer task failed: {e}")

def run_artist_task(project_id: str, scene_id: str, input_context: dict):
    agent = ArtistAgent()
    try:
        update_scene(project_id, scene_id, {"status": "generating_image"})
        
        image_bytes = agent.generate_image(
            prompt=input_context.get("visual_prompt")
        )
        
        # Save to file and upload
        temp_filename = f"temp_{scene_id}.png"
        with open(temp_filename, "wb") as f:
            f.write(image_bytes)
            
        public_url = upload_to_storage(temp_filename, f"projects/{project_id}/scenes/{scene_id}.png")
        os.remove(temp_filename)
        
        update_scene(project_id, scene_id, {
            "imageUrl": public_url,
            "status": "draft" # Ready for director
        })
        print(f"Artist task completed for scene {scene_id}")
        
    except Exception as e:
        print(f"Artist task failed: {e}")
        update_scene(project_id, scene_id, {"status": "error"})

def run_director_task(project_id: str, scene_id: str, input_context: dict):
    agent = DirectorAgent()
    try:
        update_scene(project_id, scene_id, {"status": "generating_video"})
        
        agent.generate_video(
            project_id=project_id,
            scene_id=scene_id,
            image_url=input_context.get("imageUrl"),
            prompt=input_context.get("visual_prompt") # Or specific video prompt
        )
        
    except Exception as e:
        print(f"Director task failed: {e}")

@router.post("/generate")
async def generate(request: GenerateRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    
    if request.agent_type == "writer":
        background_tasks.add_task(run_writer_task, request.project_id, request.input_context)
    elif request.agent_type == "artist":
        background_tasks.add_task(run_artist_task, request.project_id, request.scene_id, request.input_context)
    elif request.agent_type == "director":
        background_tasks.add_task(run_director_task, request.project_id, request.scene_id, request.input_context)
    else:
        raise HTTPException(status_code=400, detail="Invalid agent type")
        
    return {"status": "processing", "task_id": task_id}
```

*   **분석**: 개별 에이전트를 백그라운드 작업으로 실행하는 `/api/generate` 엔드포인트는 잘 구조화되어 있습니다. 특히 `run_artist_task`의 경우, 데이터베이스 상태 업데이트, 파일 처리, 클라우드 업로드, 에러 처리까지 모범적인 흐름을 보여줍니다. 다만, 다른 에이전트 작업들의 에러 처리 로직은 보강이 필요해 보입니다.

### `backend/agents/orchestrator.py`

```python
import logging
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from agents.router_agent import router_agent
from agents.supervisor_agent import supervisor_agent
from utils.local_db import get_latest_scene

logger = logging.getLogger("Orchestrator")

APP_NAME = "dreamfactory_backend"

async def run_adk_pipeline(project_id: str, topic: str):
    """
    Executes the Hybrid Pipeline: Router -> Supervisor -> Specialists.
    """
    session_service = InMemorySessionService()
    session_id = project_id 
    user_id = "system"

    try:
        # --- Step 1: Router (Intent Classification) ---
        logger.info(f"📡 [Router] Analyzing request: {topic}")
        
        router_runner = Runner(agent=router_agent, app_name=APP_NAME, session_service=session_service)
        content = types.Content(role='user', parts=[types.Part(text=topic)])
        
        intent = ""
        async for event in router_runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
            if event.is_final_response():
                intent = event.content.parts[0].text.strip()
        
        logger.info(f"📡 [Router] Intent detected: {intent}")

        # --- Step 2: Supervisor (Orchestration) ---
        if intent == "NEW_PROJECT":
            logger.info(f"👨‍💼 [Supervisor] Starting NEW_PROJECT workflow...")
            
            supervisor_runner = Runner(agent=supervisor_agent, app_name=APP_NAME, session_service=session_service)
            
            supervisor_prompt = f"Intent: NEW_PROJECT. Topic: {topic}. Project ID: {project_id}. Execute the full pipeline."
            content = types.Content(role='user', parts=[types.Part(text=supervisor_prompt)])
            
            async for event in supervisor_runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
                pass
                
            logger.info(f"✅ [Supervisor] Workflow completed.")
            
        else:
            logger.info(f"⚠️ [Router] Intent '{intent}' not fully implemented in MVP. Passing to Supervisor anyway.")
            supervisor_runner = Runner(agent=supervisor_agent, app_name=APP_NAME, session_service=session_service)
            supervisor_prompt = f"Intent: {intent}. Request: {topic}. Project ID: {project_id}. Handle accordingly."
            content = types.Content(role='user', parts=[types.Part(text=supervisor_prompt)])
            
            async for event in supervisor_runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
                pass

    except Exception as e:
        logger.error(f"❌ Pipeline Failed: {str(e)}")
```

*   **분석**: 백엔드의 핵심 아키텍처를 보여주는 파일입니다. **Google ADK(Agent Development Kit)**를 사용하여 **'라우터 -> 감독'**으로 이어지는 정교한 파이프라인을 구축했습니다. '라우터'가 사용자의 의도를 파악하면 '감독' 에이전트에게 작업을 위임하는 구조로, 매우 확장성 있고 견고한 설계입니다.

### `backend/agents/supervisor_agent.py`

```python
from google.adk.agents import Agent
from tools.delegation_tools import (
    delegate_to_writer, 
    delegate_to_artist, 
    delegate_to_director,
    get_latest_scene_info
)

# Define the Supervisor Agent
supervisor_agent = Agent(
    name="supervisor_agent",
    model="gemini-3.0-pro-preview", # Using Pro for better reasoning
    description="The Chief Producer managing the DreamFactory pipeline.",
    instruction="""
    You are the Chief Producer (Supervisor) of DreamFactory. 
    
    Your goal is to orchestrate the production of a video scene by coordinating the Writer, Artist, and Director. 
    
    **Workflow for 'NEW_PROJECT':**
    1. **Writer**: Call 'delegate_to_writer' with the topic and project_id.
    2. **Context**: Call 'get_latest_scene_info' to get the generated Scene ID and Visual Prompt.
    3. **Artist**: Call 'delegate_to_artist' with the Scene ID and Visual Prompt.
       - If the Artist returns an error or fails, ask the Writer to revise the prompt (not implemented in this MVP, but keep in mind).
    4. **Context**: Call 'get_latest_scene_info' again to get the Image URL.
    5. **Director**: Call 'delegate_to_director' with Scene ID, Image URL, Visual Prompt, and Project ID. 
    
    **Workflow for 'REVISE_SCENE':**
    - If the user wants to revise, call the appropriate agent directly. 
    
    Always confirm the completion of each step before moving to the next.
    """,
    tools=[
        delegate_to_writer, 
        delegate_to_artist, 
        delegate_to_director,
        get_latest_scene_info
    ]
)
```

*   **분석**: 코드가 아닌, **에이전트 설정 파일**입니다. LLM의 추론 능력을 이용해 전체 작업 흐름을 조율하는 **"감독 에이전트 패턴"**의 전형적인 예시입니다. 복잡한 로직을 코드로 짜는 대신, 프롬프트로 명확하게 정의하여 유연성을 극대화한 매우 강력하고 진보된 아키텍처입니다.

### `backend/tools/delegation_tools.py`

```python
import asyncio
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from agents.writer_agent import writer_agent
from agents.artist_agent import artist_agent
from agents.director_agent import director_agent
from utils.local_db import get_latest_scene

APP_NAME = "dreamfactory_backend"

async def delegate_to_writer(topic: str, project_id: str) -> str:
    print(f"👨‍💼 Supervisor: Delegating to Writer for '{topic}'...")
    session_service = InMemorySessionService()
    runner = Runner(agent=writer_agent, app_name=APP_NAME, session_service=session_service)
    
    # Create session first
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id="system",
        session_id=project_id
    )
    
    prompt = f"Topic: {topic}. Project ID: {project_id}. Write the next scene."
    content = types.Content(role='user', parts=[types.Part(text=prompt)])
    
    final_response = ""
    async for event in runner.run_async(user_id="system", session_id=project_id, new_message=content):
        if event.is_final_response():
            final_response = event.content.parts[0].text
            
    return final_response

async def delegate_to_artist(scene_id: str, visual_prompt: str) -> str:
    print(f"👨‍💼 Supervisor: Delegating to Artist for Scene {scene_id}...")
    session_service = InMemorySessionService()
    runner = Runner(agent=artist_agent, app_name=APP_NAME, session_service=session_service)
    
    # Create session first
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id="system",
        session_id=scene_id
    )
    
    prompt = f"Scene ID: {scene_id}. Visual Prompt: {visual_prompt}. Generate the image."
    content = types.Content(role='user', parts=[types.Part(text=prompt)])
    
    final_response = ""
    async for event in runner.run_async(user_id="system", session_id=scene_id, new_message=content):
        if event.is_final_response():
            final_response = event.content.parts[0].text
            
    return final_response

async def delegate_to_director(scene_id: str, image_url: str, prompt: str, project_id: str) -> str:
    print(f"👨‍💼 Supervisor: Delegating to Director for Scene {scene_id}...")
    session_service = InMemorySessionService()
    runner = Runner(agent=director_agent, app_name=APP_NAME, session_service=session_service)
    
    # Create session first
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id="system",
        session_id=scene_id
    )
    
    prompt = f"Scene ID: {scene_id}. Image URL: {image_url}. Prompt: {prompt}. Generate video. Project ID: {project_id}"
    content = types.Content(role='user', parts=[types.Part(text=prompt)])
    
    final_response = ""
    async for event in runner.run_async(user_id="system", session_id=scene_id, new_message=content):
        if event.is_final_response():
            final_response = event.content.parts[0].text
            
    return final_response

def get_latest_scene_info(project_id: str) -> dict:
    """
    Helper tool to get the latest scene info from Local DB.
    """
    latest = get_latest_scene(project_id)
    if latest:
        return latest
    return {"error": "No scene found"}
```

*   **분석**: 감독 에이전트가 사용하는 "도구"의 실제 구현부입니다. 감독 에이전트의 '생각'을 실제 '행동'으로 옮깁니다. 특히, `get_latest_scene_info`를 통해 DB를 중앙 상태 저장소(Shared State)처럼 사용하여 에이전트 간의 작업 결과를 동기화하는 방식이 매우 효율적입니다.

### `backend/agents/writer_agent.py`

```python
from google.adk.agents import Agent
from tools.writer_tools import save_scene_script, get_production_bible_tool

# Define the Writer Agent
writer_agent = Agent(
    name="writer_agent",
    model="gemini-2.0-flash-exp",  # Using publicly available model
    description="Professional screenwriter and director.",
    instruction="""
    You are the Lead Screenwriter for 'DreamFactory'.
    
    Your goal is to write the next scene of a story based on the provided topic.
    
    **IMPORTANT**: When calling 'save_scene_script', you MUST provide ALL required fields:
    - project_id: The project ID from the user's request
    - scene_data: A dictionary with these REQUIRED fields:
        * sequence_number: Integer (start with 1 for the first scene)
        * script: String (the full script with dialogue and action)
        * visual_prompt: String (detailed English description for image generation)
        * rationale: String (your reasoning for this scene)
        * characters_involved: List of strings (character names)
    
    Example call:
    save_scene_script(
        project_id="proj_test_001",
        scene_data={
            "sequence_number": 1,
            "script": "INT. NEON CITY - NIGHT\n\nA detective walks through rain...",
            "visual_prompt": "Cyberpunk city street at night, neon lights reflecting on wet pavement, detective in trench coat",
            "rationale": "Opening scene establishes the noir atmosphere",
            "characters_involved": ["Detective"]
        }
    )
    
    Always call this tool to save your work.
    """,
    tools=[save_scene_script, get_production_bible_tool]
)
```

*   **분석**: 계층 구조의 마지막인 '전문가 에이전트'의 예시입니다. 상위 에이전트(감독)로부터 목표를 부여받고, 자신만의 전문 도구(`save_scene_script` 등)를 사용해 과제를 수행합니다. 도구 사용법을 매우 상세하고 명확하게 지시하는 프롬프트 엔지니어링 기법이 특히 돋보입니다.

### `backend/tools/writer_tools.py`

```python
from pydantic import BaseModel, Field
from utils.local_db import save_scene, get_project_bible

# 1. Output Data Structure Definition
class SceneScript(BaseModel):
    sequence_number: int = Field(..., description="Scene number")
    script: str = Field(..., description="Full script including dialogue and stage directions")
    visual_prompt: str = Field(..., description="Specific English prompt for image generation")
    rationale: str = Field(..., description="Reasoning and intention behind this direction")
    characters_involved: list[str] = Field(..., description="List of character names in this scene")

# 2. Script Saving Tool
def save_scene_script(project_id: str, scene_data: dict) -> str:
    """
    Saves the written scene data to Local DB.
    """
    print(f"✍️ Writer: Saving scene {scene_data.get('sequence_number')}...")
    
    # Add status
    scene_data["status"] = "draft"
    
    scene_id = save_scene(project_id, scene_data)
    
    return f"Scene {scene_data['sequence_number']} saved successfully with ID {scene_id}."

# 3. Context Retrieval Tool
def get_production_bible_tool(project_id: str) -> dict:
    """
    Retrieves the project's world setting.
    """
    return get_project_bible(project_id)
```

*   **분석**: 작가 에이전트가 사용하는 도구의 구현부입니다. Pydantic 모델로 데이터 구조를 명확히 정의한 점, DB 로직을 깔끔하게 추상화한 점이 좋습니다. Pydantic 모델을 이용해 LLM이 넘겨준 데이터의 유효성 검증을 추가하면 더욱 안정성이 높아질 것입니다.

### `backend/utils/local_db.py`

```python
import json
import os
import time
from typing import Dict, Any, List

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_FILE = os.path.join(DATA_DIR, "db.json")

def _load_db() -> Dict[str, Any]:
    if not os.path.exists(DB_FILE):
        return {"projects": {{}}}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {"projects": {{}}}

def _save_db(data: Dict[str, Any]):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

def save_scene(project_id: str, scene_data: Dict[str, Any]) -> str:
    """Saves a new scene and returns its ID."""
    db = _load_db()
    
    if project_id not in db["projects"]:
        db["projects"][project_id] = {"scenes": {{}}}
        
    # Generate ID
    scene_id = f"scene_{{int(time.time())}}"
    scene_data["id"] = scene_id
    scene_data["createdAt"] = time.time()
    
    db["projects"][project_id]["scenes"][scene_id] = scene_data
    _save_db(db)
    
    return scene_id

def update_scene(project_id: str, scene_id: str, updates: Dict[str, Any]):
    """Updates an existing scene."""
    db = _load_db()
    if project_id in db["projects"] and scene_id in db["projects"][project_id]["scenes"]:
        db["projects"][project_id]["scenes"][scene_id].update(updates)
        _save_db(db)
    else:
        print(f"Warning: Scene {scene_id} in project {project_id} not found.")

def get_scene(project_id: str, scene_id: str) -> Dict[str, Any]:
    """Retrieves a scene."""
    db = _load_db()
    return db.get("projects", {{}}).get(project_id, {{}}).get("scenes", {{}}).get(scene_id)

def get_project_bible(project_id: str) -> Dict[str, Any]:
    """Mock production bible."""
    # In a real app, this would be loaded from DB.
    return {
        "genre": "Sci-Fi",
        "tone": "Dark, Cinematic",
        "characters": ["Neo", "Trinity"]
    }

def get_latest_scene(project_id: str) -> Dict[str, Any]:
    """Gets the most recently created scene."""
    db = _load_db()
    scenes = db.get("projects", {{}}).get(project_id, {{}}).get("scenes", {{}})
    if not scenes:
        return None
        
    # Sort by createdAt
    sorted_scenes = sorted(scenes.values(), key=lambda x: x.get("createdAt", 0), reverse=True)
    return sorted_scenes[0]
```

*   **분석**: 단일 JSON 파일을 데이터베이스로 사용하는 간단한 구현체입니다. 프로토타입 단계에서는 효과적이지만, **동시성 문제에 매우 취약**하다는 명백한 단점이 있습니다. 운영 환경에서는 `asyncio.Lock`을 추가하거나 Firestore와 같은 실제 데이터베이스로의 전환이 필수적입니다.
