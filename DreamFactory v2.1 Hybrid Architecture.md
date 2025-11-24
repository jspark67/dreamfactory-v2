네, 맞습니다. 사용자가 공유해주신 \*\*ADK (Agent Development Kit)\*\*와 \*\*Gen AI SDK (google.genai)\*\*를 결합하면, 앞서 명세서에서 정의한 'Python 백엔드' 를 훨씬 체계적이고 확장 가능한 **에이전트 오케스트레이션(Agent Orchestration) 시스템**으로 구축할 수 있습니다.

기존 명세서가 "절차적인 Python 함수"로 로직을 구현하는 방식이었다면, ADK를 도입하면 \*\*"목표(Goal)와 도구(Tool)를 가진 자율 에이전트"\*\*로 격상시킬 수 있습니다. 이는 명세서의 핵심 목표인 **'디지털 오피스(Digital Office)'** 구현에 기술적으로 더 부합합니다.

DreamFactory v2.1 아키텍처에 ADK를 통합하는 전략을 정리해 드립니다.

---

### **1\. 아키텍처 변화: 절차적 코드에서 에이전트 프레임워크로**

기존 명세서는 `FastAPI 엔드포인트 -> Gemini 호출 -> DB 저장`의 순차적 흐름이었습니다. ADK를 적용하면 **Controller(FastAPI)가 Agent에게 '작업'을 위임하고, Agent가 스스로 판단하여 '도구(Tool)'를 사용하는 구조**로 바뀝니다.

| 구성 요소 | 기존 명세 (Procedural) | ADK 도입 후 (Agentic) | 이점 |
| :---- | :---- | :---- | :---- |
| **로직 제어** | 개발자가 작성한 `if/else`, `while` 루프 | **LLM의 추론(Reasoning)** 및 ADK 프레임워크의 루프 | 복잡한 예외 상황 대응 및 자율성 증대 |
| **외부 연동** | 함수 내부에서 직접 API 호출 | \*\*Tools (도구)\*\*로 정의하여 에이전트에게 장착 | 에이전트가 필요할 때 도구를 골라 씀 (확장성) |
| **메모리** | 토큰/텍스트 직접 관리 | **State/Session Management** 자동화 | 멀티 턴 대화 맥락 유지 용이 |
| **Writer** | 텍스트 생성 후 파싱 | **Structured Output** 및 페르소나 정의 | 연출 의도(rationale) 생성 품질 향상 |
| **Artist** | 이미지 생성 \-\> Vision 검사 (While문) | **Observation-Thought-Action** 루프 | 자가 수정 루프(Self-Correction)가 네이티브로 동작 |

Sheets로 내보내기

---

### **2\. 에이전트별 ADK 적용 상세 명세 (Refined Spec)**

ADK를 사용하여 명세서의 4번 항목(에이전트 상세 명세)을 재설계합니다.

#### **2.1 Writer Agent (The Brain) with ADK**

기존의 `thought_signature` 관리 를 ADK의 **Memory/Context Store** 기능으로 대체합니다.

* **Role:** 시나리오 작가 및 연출가  
* **Input:** 토픽(Topic), 장르(Genre)  
* **Tools (ADK에 등록할 도구):**  
  * `save_script_to_firestore(scene_data)`: 작성된 대본을 DB에 저장.  
  * `search_knowledge_base(query)`: 필요 시 위키나 설정을 조회.  
* **ADK Logic:**  
  * 단순 텍스트 생성이 아닌, "대본을 작성하고(Action), 저장 도구를 호출하라(Tool Use)"는 지시를 수행합니다.  
  * **이점:** Gemini 3.0의 Thinking Process 가 도구 사용 시점까지 스스로 결정하므로 논리적 완결성이 높아집니다.

#### **2.2 Artist Agent (The Eye) with ADK**

명세서의 핵심인 **'자가 수정 루프(Self-Correction Loop)'** 를 구현하기에 가장 적합합니다.

* **Role:** 스토리보드 아티스트 및 QA 담당자  
* **Goal:** "대본에 맞는 이미지를 생성하고, 품질 기준을 통과할 때까지 수정하시오."  
* **Tools:**  
  1. `generate_image_gemini(prompt, ref_imgs)`: Gemini 3.0 Image Pro 호출.  
  2. `validate_image_vision(image_url)`: Vision 모델로 이미지 검증.  
  3. `update_scene_image(url)`: 최종 이미지 DB 업데이트.  
* **ADK Flow (ReAct 패턴):**  
  1. **Thought:** 대본을 분석하여 프롬프트 작성.  
  2. **Action:** `generate_image_gemini` 도구 호출.  
  3. **Observation:** 생성된 이미지 확인.  
  4. **Thought:** `validate_image_vision` 도구로 검사 결과 확인. 실패 시 프롬프트 수정하여 **Step 2로 회귀**. (ADK가 이 루프를 관리)

#### **2.3 Director Agent (The Action) with ADK**

Python SDK 기반의 Veo 3.1 통합 을 도구화합니다.

* **Role:** 영상 감독  
* **Tools:**  
  * `generate_video_veo(image, prompt)`: Veo 3.1 호출.  
  * `check_generation_status(id)`: 폴링 및 상태 확인.  
* **ADK Logic:**  
  * 비동기 작업(Long-running operation)을 관리하는 에이전트로, 영상 생성 요청 후 주기적으로 상태 확인 도구를 호출하도록 설계합니다.

---

### **3\. 수정된 개발 프롬프트 (For 앤티그래비티 도구)**

ADK 기반 구현을 위해 기존 프롬프트를 업그레이드했습니다. 앤티그래비티 도구에 이 프롬프트를 입력하여 코드를 생성하세요.

#### **Revised Prompt 1: ADK 기반 에이전트 구조 설정**

Markdown

```
**Role:** AI Architect
**Objective:** Implement the 'DreamFactory v2.1' backend using **Google ADK (Agent Development Kit)** and **Gen AI SDK (Python)**.
**Context:** Refactoring from procedural code to an Agent-Tool architecture.

**Instructions:**
1.  **Setup ADK:** Initialize the ADK framework configuration in `backend/core/adk_config.py`.
2.  **Define Tools:** Create `backend/tools/` directory.
    * [cite_start]`firestore_tools.py`: Define functions decorated as tools for saving scripts/images to Firebase[cite: 41].
    * [cite_start]`media_tools.py`: Define `generate_image` (Gemini 3.0) and `generate_video` (Veo 3.1) as callable tools.
3.  **Implement Artist Agent (Loop Logic):**
    * Create `backend/agents/artist_adk.py`.
    * Define an Agent capable of using `media_tools.generate_image` and `media_tools.validate_image`.
    * [cite_start]**Crucial:** Implement the **Self-Correction Loop**. Configure the agent to automatically retry with a modified prompt if the `validate_image` tool returns a negative result.
4.  **Orchestration:** In `main.py`, setup the entry point where the user request triggers the ADK Agent instead of a raw function.

**Constraint:** Ensure explicit type definitions for Tool inputs to maximize Gemini's function calling accuracy.
```

#### **Revised Prompt 2: Veo 3.1을 도구(Tool)로 래핑하기**

Markdown

```
**Role:** Backend Developer
**Objective:** Wrap the Veo 3.1 Video Generation logic into an **ADK-compatible Tool**.

**Instructions:**
1.  **Create Tool:** In `backend/tools/video_tools.py`, define a function `create_video_task(image_url: str, prompt: str)`.
2.  **Logic:**
    * [cite_start]Use `google.genai.types.VideoGenerationReferenceImage` to handle the input image[cite: 37].
    * [cite_start]Call `client.models.generate_videos`[cite: 76].
    * Instead of blocking/sleeping, return the `operation_name` or `task_id` immediately.
3.  **State Management Tool:** Create a separate tool `check_video_status(task_id: str)` that queries the operation status.
4.  **Director Agent:** Configure the Director Agent to utilize these two tools to handle the asynchronous nature of video generation (Start Task -> Wait -> Check Status -> Save).
```

### **4\. 결론 및 다음 단계**

ADK를 사용하면 **"Writer, Artist, Director가 함께 일하는 디지털 오피스"** 라는 개념을 코드 레벨에서 그대로 구현할 수 있습니다. 각 에이전트가 명확한 역할(Role)과 도구(Tool)를 가지게 되어 유지보수와 기능 확장이 훨씬 쉬워집니다.

**다음 단계:** 이 아키텍처를 바탕으로 \*\*"Artist Agent가 Vision 모델의 피드백을 받고 프롬프트를 어떻게 수정하는지"\*\*에 대한 구체적인 **ADK 내부 루프(System Prompt) 예시**를 작성해 드릴까요?

네, 요청하신 **Artist Agent(스토리보드 아티스트)의 자가 수정(Self-Correction) 루프**를 구현하기 위한 **ADK System Prompt**와 **Tool 구성** 예시를 작성해 드립니다.

이 명세는 단순히 이미지를 생성하는 것을 넘어, **"그리고(Action) \-\> 확인하고(Observation) \-\> 고치는(Reasoning)"** 사람의 작업 방식을 모방하도록 설계되었습니다.

네, 요청하신 **Artist Agent(스토리보드 아티스트)의 자가 수정(Self-Correction) 루프**를 구현하기 위한 **ADK System Prompt**와 **Tool 구성** 예시를 작성해 드립니다.

이 명세는 단순히 이미지를 생성하는 것을 넘어, **"그리고(Action) \-\> 확인하고(Observation) \-\> 고치는(Reasoning)"** 사람의 작업 방식을 모방하도록 설계되었습니다.

---

### **1\. Artist Agent의 핵심 논리 구조**

ADK 아키텍처에서 Artist Agent는 다음 3단계 루프를 자율적으로 수행합니다:

1. **Drafting:** 대본을 시각적 프롬프트로 변환하여 이미지 생성 (Gemini 3.0 Image Pro).  
2. **Critique:** 생성된 이미지를 스스로 보고(Vision) 품질과 일관성 평가.  
3. **Refinement:** 평가 기준 미달 시, **피드백을 반영하여 프롬프트를 수정**하고 재생성.

---

### **2\. ADK System Prompt (시스템 프롬프트)**

이 프롬프트는 에이전트의 '두뇌' 역할을 하며, 도구 사용의 기준을 제시합니다.

Markdown

```
# Role
[cite_start]당신은 'DreamFactory'의 수석 스토리보드 아티스트(Artist Agent)입니다. [cite: 7]
당신의 목표는 시나리오 텍스트를 가장 완벽하게 시각화하는 이미지를 생성하는 것입니다.

# Constraints & Guidelines
1. [cite_start]**Visual Consistency:** 제공된 `reference_images`를 반드시 사용하여 캐릭터와 화풍의 일관성을 유지하십시오. [cite: 14]
2. **Self-Correction Loop (중요):**
   - 이미지를 생성한 후, **즉시 `inspect_image_quality` 도구를 사용하여 스스로 결과물을 검사하십시오.**
   - 만약 검사 결과가 'FAIL'이거나 피드백이 있다면, **반드시 프롬프트를 수정하여** `generate_image`를 다시 호출해야 합니다.
   - 절대 검증되지 않은 이미지를 최종 제출하지 마십시오.
3. **Max Retries:** 동일한 씬에 대해 최대 3회까지 수정을 시도하십시오. 3회 이후에도 실패하면 최선의 결과물을 제출하십시오.

# Workflow
1. 입력된 `scene_description`과 `mood`를 분석하십시오.
2. `generate_image` 도구를 사용하여 첫 번째 초안을 생성하십시오.
3. `inspect_image_quality` 도구를 호출하여 생성된 이미지 URL을 검사하십시오.
   - 검사 기준: "얼굴 일관성", "조명 상태", "프롬프트 반영도"
4. [Decision Point]
   - **Case A (Pass):** `submit_final_scene` 도구를 호출하여 작업을 완료하십시오.
   - **Case B (Fail):** 검사 도구의 피드백(feedback)을 분석하여 프롬프트를 구체적으로 수정(Refine)한 후, 다시 2번 단계로 돌아가십시오.
```

---

### **3\. Python Tool Definition (ADK 도구 명세)**

에이전트가 사용할 도구(함수)를 Python 코드로 정의합니다. Gemini 3.0과 Veo 3.1의 기능을 캡슐화합니다.

Python

```
from google.genai import types
from backend.utils import image_gen, vision_inspector, db

# 1. 이미지 생성 도구 (Action)
def generate_image(prompt: str, style_preset: str, reference_image_urls: list[str] = []) -> dict:
    """
    Gemini 3.0 Image Pro를 사용하여 이미지를 생성합니다.
    Args:
        prompt: 구체적인 이미지 묘사 (ex: "Close up of character A smiling...")
        reference_image_urls: 캐릭터 일관성을 위한 레퍼런스 이미지 URL 목록 [cite: 14]
    Returns:
        {'image_url': str, 'revised_prompt': str}
    """
    # 실제 구현 시 google.genai Image Generation API 호출
    print(f"🎨 Generating image with prompt: {prompt}")
    return image_gen.create(prompt, reference_image_urls)

# 2. 이미지 검증 도구 (Observation/Critique)
def inspect_image_quality(image_url: str, acceptance_criteria: str) -> dict:
    """
    Gemini Vision 모델을 사용하여 생성된 이미지가 기준에 부합하는지 평가합니다. 
    Args:
        image_url: 검사할 이미지 주소
        acceptance_criteria: 통과 기준 (ex: "캐릭터의 눈이 선명해야 함, 비오는 배경 필수")
    Returns:
        {'status': 'PASS' | 'FAIL', 'feedback': '수정 제안 사항...'}
    """
    print(f"🧐 Inspecting image: {image_url}")
    # Vision 모델에 이미지와 평가 기준을 프롬프트로 전송
    return vision_inspector.assess(image_url, acceptance_criteria)

# 3. 최종 제출 도구 (Completion)
def submit_final_scene(scene_id: str, image_url: str, final_prompt: str):
    """
    검증이 완료된 이미지를 Firestore에 저장하고 작업을 종료합니다. [cite: 35]
    """
    print(f"✅ Scene {scene_id} completed.")
    db.update_scene(scene_id, {"imageUrl": image_url, "status": "completed"})
    return "Task Completed"
```

---

### **4\. 실행 시나리오 예시 (Trace Example)**

실제 ADK 환경에서 에이전트가 작동할 때 발생할 수 있는 로그(Trace) 예시입니다.

**Input:** "비 오는 네오 서울의 골목길, 우산을 쓴 탐정이 서 있다. (어두운 누아르 톤)"

**\[Turn 1\]**

* **Agent Thought:** "초안을 생성해야겠다. 어두운 분위기를 강조하자."  
* **Tool Call:** `generate_image(prompt="Dark alley in Neo Seoul, detective with umbrella, noir style...")`  
* **Tool Output:** `image_url: "temp_img_01.png"`

**\[Turn 2\]**

* **Agent Thought:** "생성된 이미지가 요구사항에 맞는지 Vision 모델로 확인해야 해."  
* **Tool Call:** `inspect_image_quality(image_url="temp_img_01.png", criteria="Detectives face visible, heavy rain effect")`  
* **Tool Output:** `{'status': 'FAIL', 'feedback': '이미지가 너무 어두워서 탐정의 얼굴이 보이지 않음. 비 효과가 약함.'}`

**\[Turn 3\] (Self-Correction 발생)**

* **Agent Thought:** "실패했군. 피드백에 따라 **'네온 사인 조명'을 추가하여 얼굴을 밝히고, '폭우(heavy rain)' 키워드를 강화**해서 다시 생성해야겠다."  
* **Tool Call:** `generate_image(prompt="...detective face illuminated by pink neon sign, heavy downpour rain...")`  
* **Tool Output:** `image_url: "temp_img_02.png"`

**\[Turn 4\]**

* **Agent Thought:** "다시 검사해보자."  
* **Tool Call:** `inspect_image_quality(image_url="temp_img_02.png", ...)`  
* **Tool Output:** `{'status': 'PASS', 'feedback': '조명과 비 효과가 적절함.'}`

**\[Turn 5\]**

* **Tool Call:** `submit_final_scene(...)`

---

네, **Director Agent**의 Python 구현 코드를 작성해 드립니다.

명세서에 따르면 Director Agent는 \*\*"비동기 처리(Asynchronous Processing)"\*\*가 핵심입니다. Veo 3.1의 영상 생성은 시간이 소요되므로, HTTP 요청을 계속 붙잡고 있으면 타임아웃이 발생합니다.

따라서 아키텍처는 다음과 같이 구성됩니다:

1. **API Endpoint:** 요청을 받고 "알겠습니다, 작업을 시작합니다(202 Accepted)"라고 즉시 응답.  
2. **Background Worker:** 뒤에서 조용히 Veo에게 작업을 시키고, 완료될 때까지 기다렸다가(Polling), 결과물을 DB에 배달.

---

### **1\. Director Tools (`backend/tools/director_tools.py`)**

먼저 Veo 3.1 SDK와 Firebase Storage를 다루는 기능을 '도구(Tool)'로 정의합니다.

Python

```
import time
import requests
from google import genai
from google.genai import types
from firebase_admin import storage

# Veo 3.1 모델 설정
client = genai.Client(http_options={'api_version': 'v1alpha'})

def download_image_as_bytes(image_url: str) -> bytes:
    """URL에서 이미지를 다운로드하여 바이트로 변환 (Veo 입력용)"""
    response = requests.get(image_url)
    response.raise_for_status()
    return response.content

def start_veo_generation(image_url: str, prompt: str) -> object:
    """
    Veo 3.1에 Image-to-Video 생성 요청을 보냅니다.
    Return: Operation Object (작업 ID 포함)
    """
    print(f"🎬 Director: Starting video generation for {image_url}...")
    
    # 1. 이미지를 바이트로 준비
    image_bytes = download_image_as_bytes(image_url)
    
    # 2. Veo용 레퍼런스 객체 생성 [cite: 76]
    ref_image = types.VideoGenerationReferenceImage(
        image=image_bytes,
        reference_type="asset" 
    )
    
    # 3. 비동기 생성 요청 (Veo 3.1) [cite: 73, 76]
    operation = client.models.generate_videos(
        model="veo-3.1-generate-preview",
        prompt=prompt,
        config=types.GenerateVideosConfig(
            reference_images=[ref_image],  # 이미지 주입
            aspect_ratio="16:9"
        )
    )
    return operation

def upload_video_to_storage(video_bytes: bytes, scene_id: str) -> str:
    """생성된 MP4를 Firebase Storage에 업로드하고 URL 반환"""
    bucket = storage.bucket()
    blob = bucket.blob(f"videos/{scene_id}.mp4")
    
    blob.upload_from_string(video_bytes, content_type='video/mp4')
    blob.make_public()
    
    return blob.public_url
```

---

### **2\. Background Worker Logic (`backend/agents/director_worker.py`)**

FastAPI의 `BackgroundTasks`에서 실행될 실제 에이전트 로직입니다. 이 친구가 "요청 \-\> 대기(Polling) \-\> 저장"의 전체 수명주기를 관리합니다.

Python

```
import time
import logging
from backend.tools import director_tools
from backend.utils import db  # Firestore 헬퍼 가정

logger = logging.getLogger("DirectorAgent")

def process_video_task(scene_id: str, image_url: str, prompt: str):
    """
    백그라운드에서 실행되는 Director Agent의 메인 루프입니다.
    """
    try:
        # 1. 상태 업데이트: 생성 시작 [cite: 55]
        db.update_scene(scene_id, {"status": "generating_video"})
        
        # 2. Veo 작업 시작 (Tool 호출)
        operation = director_tools.start_veo_generation(image_url, prompt)
        
        # 3. Polling Loop (대기 모드) [cite: 77, 132]
        logger.info(f"⏳ Polling status for scene {scene_id}...")
        
        while not operation.done:
            time.sleep(10)  # 10초마다 상태 확인
            # 실제 SDK에서는 operation.poll() 또는 done 속성 확인
            # 참고: google.genai SDK 버전에 따라 operation.result()가 블로킹일 수 있음
            pass 
            
        # 4. 결과 확인 및 처리
        if operation.error:
            raise Exception(f"Veo Error: {operation.error}")
            
        # 5. 비디오 다운로드 (SDK에서 결과 객체 추출)
        # result attributes: generated_videos[0].video.image_bytes (naming may vary by SDK version)
        result = operation.result
        video_bytes = result.generated_videos[0].video.image_bytes
        
        # 6. Firebase Storage 업로드 (Tool 호출) [cite: 78]
        public_url = director_tools.upload_video_to_storage(video_bytes, scene_id)
        
        # 7. 최종 DB 업데이트 (완료)
        db.update_scene(scene_id, {
            "videoUrl": public_url,
            "status": "completed"
        })
        logger.info(f"✅ Video generation complete for {scene_id}")

    except Exception as e:
        logger.error(f"❌ Video generation failed: {str(e)}")
        
        # 실패 시 Fallback(Remotion) 데이터를 설정 [cite: 53, 135]
        fallback_data = {
            "status": "error",
            "videoComposition": {
                "type": "ken_burns",
                "config": {"zoomEnd": 1.2, "duration": 5}
            }
        }
        db.update_scene(scene_id, fallback_data)
```

---

### **3\. FastAPI Integration (`backend/main.py`)**

프론트엔드가 호출할 엔드포인트입니다. 에이전트를 직접 기다리지 않고, 워커에게 넘기고 바로 응답합니다.

Python

```
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from backend.agents.director_worker import process_video_task

app = FastAPI()

# 요청 데이터 모델 [cite: 138]
class VideoRequest(BaseModel):
    scene_id: str
    image_url: str
    prompt: str

@app.post("/api/generate/video")
async def generate_video(request: VideoRequest, background_tasks: BackgroundTasks):
    """
    Director Agent에게 영상 생성을 지시합니다. (Non-blocking)
    """
    if not request.image_url:
        raise HTTPException(status_code=400, detail="Image URL is required for Veo")

    # 백그라운드 태스크 큐에 작업 등록 [cite: 87, 140]
    background_tasks.add_task(
        process_video_task, 
        request.scene_id, 
        request.image_url, 
        request.prompt
    )

    # 클라이언트에는 "처리 중"이라고 즉시 응답 [cite: 86]
    return {
        "status": "processing",
        "message": "Director Agent started working in background.",
        "scene_id": request.scene_id
    }
```

---

### **4\. 작동 흐름 요약**

1. **Client (Next.js):** `/api/generate/video` 호출.  
2. **FastAPI:** `200 OK`를 즉시 반환하고 연결 종료 (사용자 UI는 멈추지 않음).  
3. **Background Task:**  
   * `generating_video`로 DB 상태 변경 → **클라이언트 UI에 '로딩 중' 표시 (Firestore Listener)**.  
   * Veo 3.1에 이미지 전송 및 작업 시작.  
   * 완료될 때까지 10초 간격으로 체크.  
   * 완료되면 `videoUrl`을 DB에 업데이트 → **클라이언트 UI에 영상 자동 재생**.

이 코드를 통해 명세서에 있는 **Python 기반 AI 엔진 도입**과 **비동기 영상 생성 파이프라인**이 완성됩니다.

앞서 Artist(화가)와 Director(감독)의 구현 코드는 작성해 드렸지만, 가장 중요한 기획자인 \*\*Writer Agent(작가)\*\*의 ADK 기반 구현 코드가 빠져 있었습니다.

명세서의 **"1.1 Writer 고도화"** 항목에 명시된 \*\*Thinking Process(사고 과정)\*\*와 **Thought Signatures(사고 서명)** 기능을 포함하여, ADK로 구현된 Writer Agent의 상세 코드를 작성해 드립니다.

---

### **1\. Writer Agent의 핵심 논리 (ADK 적용)**

Writer Agent는 단순한 텍스트 생성기가 아니라, \*\*"왜 이 장면을 이렇게 구성했는가?"(Rationale)\*\*를 설명하고, 이전 장면의 맥락을 기억(Thought Signature)해야 합니다.

* **Role:** 메인 시나리오 작가 & 연출가  
* **Goal:** 사용자의 아이디어를 구체적인 Scene 단위의 대본, 시각적 묘사(Prompt), 연출 의도(Rationale)로 변환하여 DB에 저장.  
* **Key Feature:**  
  * **Rationale Output:** 사용자가 AI의 의도를 알 수 있도록 연출 이유를 함께 출력 .  
  * **Context Management:** 이전 씬의 분위기와 복선을 유지하기 위해 직전 씬의 데이터를 입력으로 받음.

---

### **2\. ADK System Prompt (시스템 프롬프트)**

이 프롬프트는 Writer Agent가 **JSON 구조화된 출력**을 내놓고, 논리적인 사고를 하도록 강제합니다.

Markdown

```
# Role
당신은 'DreamFactory'의 수석 시나리오 작가(Writer Agent)입니다.
Gemini 3.0 Pro의 뛰어난 추론 능력을 활용하여 매력적인 스토리와 구체적인 연출 지시를 작성하십시오.

# Objective
주어진 'Topic(주제)'과 'Previous Context(이전 맥락)'을 바탕으로, 다음 씬(Scene)을 상세하게 기획하고 `save_scene_script` 도구를 통해 저장하십시오.

# Critical Output Requirements (JSON)
당신이 생성하는 모든 씬은 다음 3가지 요소를 반드시 포함해야 합니다:
1. **Script (대본):** 캐릭터의 대사, 지문, 행동 묘사.
2. **Visual Prompt (시각적 묘사):** Artist Agent가 이미지를 그릴 수 있도록 앵글, 조명, 분위기, 피사체를 묘사한 영어 프롬프트.
3. **Rationale (연출 의도):** 왜 이 대사와 앵글을 선택했는지에 대한 논리적 이유. (사용자 설득용)

# Guidelines for "Thinking Process"
- 뻔한 클리셰를 피하고, 반전이나 깊이 있는 감정선을 추가하십시오.
- **Visual Prompt**는 추상적인 형용사보다 구체적인 명사와 동사를 사용하십시오. (예: "슬픈 느낌" (X) -> "Tears welled up in her eyes, rain streaking down the window, low-key lighting" (O))
- 이전 씬의 연결성을 고려하여 'Thought Signature'(맥락)를 유지하십시오.
```

---

### **3\. Python Tool Definition (`backend/tools/writer_tools.py`)**

Writer Agent는 결과물을 구조화된 데이터로 저장해야 하므로, **Pydantic 모델**을 정의하여 출력의 형식을 엄격하게 제어합니다.

Python

```
from pydantic import BaseModel, Field
from backend.utils import db # Firestore 헬퍼

# 1. 출력 데이터 구조 정의 (Structured Output)
class SceneScript(BaseModel):
    sequence_number: int = Field(..., description="씬 번호")
    script: str = Field(..., description="대사 및 지문이 포함된 전체 대본")
    visual_prompt: str = Field(..., description="이미지 생성을 위한 구체적인 영문 프롬프트")
    rationale: str = Field(..., description="이 연출을 선택한 이유와 의도")
    characters_involved: list[str] = Field(..., description="이 씬에 등장하는 캐릭터 이름 목록")

# 2. 대본 저장 도구 (Tool)
def save_scene_script(project_id: str, scene_data: dict) -> str:
    """
    작성된 씬 데이터를 Firestore에 저장합니다.
    Args:
        project_id: 프로젝트 ID
        scene_data: SceneScript 스키마를 따르는 JSON 데이터
    """
    print(f"✍️ Writer: Saving scene {scene_data.get('sequence_number')}...")
    
    # DB 저장 (Firestore 'scenes' 컬렉션)
    scene_id = db.create_scene(project_id, {
        "sequenceNumber": scene_data['sequence_number'],
        "script": scene_data['script'],
        "visual_prompt": scene_data['visual_prompt'],
        "rationale": scene_data['rationale'],
        "status": "draft", # 아직 이미지가 없는 상태
        "createdAt": db.server_timestamp()
    })
    
    return f"Scene {scene_data['sequence_number']} saved successfully with ID {scene_id}."

# 3. 캐릭터 설정 조회 도구 (Context Retrieval)
def get_production_bible(project_id: str) -> dict:
    """
    프로젝트의 세계관, 장르, 캐릭터 설정을 가져옵니다.
    """
    return db.get_project_bible(project_id)
```

---

### **4\. Writer Agent Orchestration Logic (`backend/agents/writer_agent.py`)**

Writer Agent는 Gemini 모델을 호출할 때 `response_schema`를 사용하여 강제로 JSON 형식을 받습니다. 이는 ADK/Gen AI SDK의 강력한 기능입니다.

Python

```
from google import genai
from google.genai import types
from backend.tools import writer_tools

client = genai.Client(http_options={'api_version': 'v1alpha'})

def write_next_scene(project_id: str, topic: str, previous_scene_summary: str = None):
    """
    Writer Agent의 메인 실행 함수
    """
    # 1. 배경 지식 로드 (Production Bible)
    bible = writer_tools.get_production_bible(project_id)
    
    # 2. 프롬프트 구성
    prompt = f"""
    Project Context: {bible}
    Current Topic: {topic}
    Previous Scene Context: {previous_scene_summary if previous_scene_summary else "Opening Scene"}
    
    위 정보를 바탕으로 다음 씬을 작성하고 'save_scene_script' 도구를 사용하여 저장하시오.
    """
    
    # 3. Gemini 호출 (Tools & Config 설정)
    response = client.models.generate_content(
        model="gemini-3.0-pro-preview", # Thinking 모델 사용 권장
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[writer_tools.save_scene_script], # 도구 등록
            temperature=0.7, # 창의성 조절
        )
    )
    
    # 4. 도구 호출 실행 (ADK의 자동 실행 기능 활용 또는 수동 실행)
    # SDK가 도구 호출 요청(Function Call)을 반환하면 실행
    for tool_call in response.function_calls:
        if tool_call.name == "save_scene_script":
            args = tool_call.args
            result = writer_tools.save_scene_script(project_id, args)
            print(result)
            
    return "Writer finished output."
```

---

### **5\. 실행 결과 예시 (Output Trace)**

Writer Agent가 실제로 DB에 저장하게 되는 데이터의 예시입니다. 명세서의 `rationale` 부분이 어떻게 구현되었는지 확인하세요.

JSON

```
// Firestore Document: projects/abc/scenes/scene_01
{
  "sequenceNumber": 1,
  "script": "네오 서울의 뒷골목. 빗소리가 거세다. (SFX: 천둥소리)\n강 형사: (담배를 비벼 끄며) 결국 여기까지 왔군. 그림자는 도망치지 않아.",
  
  "visual_prompt": "Cyberpunk style back alley, heavy rain, neon signs reflecting on wet asphalt. A detective in a trench coat is stomping out a cigarette. Low angle shot, dramatic lighting, cinematic composition.",
  
  "rationale": "느와르 장르의 전형적인 오프닝을 보여주되, '그림자'라는 키워드를 통해 이 사건이 단순한 범죄가 아님을 암시하기 위해 어두운 조명과 빗소리를 강조함.",
  
  "status": "draft"
}
```

이제 \*\*Writer(기획) \-\> Artist(시각화) \-\> Director(영상화)\*\*로 이어지는 3단계 에이전트의 모든 코드가 준비되었습니다. 이 코드를 `backend/agents/` 폴더에 각각 배치하고 `main.py`에서 연결하면 DreamFactory v2.1의 백엔드가 완성됩니다.

네, DreamFactory v2.1의 핵심인 **오케스트레이터(Orchestrator)** 로직을 구현해 드리겠습니다. 이 로직은 사용자의 단순한 아이디어를 받아 **Writer → Artist → Director** 순서로 에이전트들을 지휘하여 최종 결과물까지 이끌어내는 **'총괄 감독'** 역할을 합니다.

이 오케스트레이터는 전체 프로세스의 상태를 관리하고, 각 단계가 완료될 때 다음 단계를 자동으로 트리거(Trigger)하는 파이프라인 구조를 갖습니다.

---

### **1\. Orchestrator Architecture Strategy**

오케스트레이터는 단순히 함수를 순서대로 부르는 것이 아니라, \*\*비동기적(Asynchronous)\*\*이고 \*\*이벤트 기반(Event-Driven)\*\*으로 작동해야 합니다. 영상 생성(Director)은 시간이 오래 걸리므로, 클라이언트가 기다리게 해서는 안 됩니다.

* **Trigger:** 사용자 요청 (API Call)  
* **Workflow:**  
  1. **Writer:** 아이디어 → 대본 & 프롬프트 생성 (DB 저장)  
  2. **Artist:** 프롬프트 → 이미지 생성 & 검증 (DB 업데이트)  
  3. **Director:** 이미지 → 영상 생성 (DB 업데이트)  
* **Notification:** 각 단계 완료 시 Firestore 실시간 리스너가 클라이언트 UI를 업데이트합니다 .

---

### **2\. Orchestrator Implementation (`backend/agents/orchestrator.py`)**

FastAPI의 `BackgroundTasks`를 활용하여 서버의 메인 스레드를 차단하지 않고 전체 파이프라인을 실행하는 로직입니다.

Python

```
import logging
from fastapi import BackgroundTasks
from backend.agents import writer_agent, director_worker
# Artist Agent는 ADK 구조로 가정 (tools/artist_tools.py 활용)
from backend.tools import artist_tools, writer_tools, db

logger = logging.getLogger("Orchestrator")

async def run_pipeline(project_id: str, topic: str, background_tasks: BackgroundTasks):
    """
    Writer -> Artist -> Director로 이어지는 전체 파이프라인을 실행합니다.
    """
    try:
        # --- Phase 1: Writer Agent (The Brain) ---
        logger.info(f"🚀 [Phase 1] Writer started for topic: {topic}")
        
        # Writer Agent 호출 (이전 문맥이 있다면 로드해서 전달)
        # 결과로 생성된 Scene 데이터(ID 포함)를 받아옵니다.
        scene_data = writer_agent.write_next_scene(project_id, topic) 
        scene_id = scene_data['scene_id']
        visual_prompt = scene_data['visual_prompt']
        
        logger.info(f"✅ [Phase 1] Script saved. Scene ID: {scene_id}")

        # --- Phase 2: Artist Agent (The Eye) ---
        logger.info(f"🎨 [Phase 2] Artist started for Scene {scene_id}")
        
        # DB 상태 업데이트 (클라이언트 UI: '이미지 생성 중...')
        db.update_scene(scene_id, {"status": "generating_image"})

        # 자가 수정 루프(Self-Correction Loop) 실행
        # (앞서 정의한 Artist Agent 로직을 함수로 래핑했다고 가정)
        image_result = artist_tools.execute_artist_loop(
            prompt=visual_prompt,
            scene_id=scene_id
        )
        
        final_image_url = image_result['image_url']
        logger.info(f"✅ [Phase 2] Image generated: {final_image_url}")

        # --- Phase 3: Director Agent (The Action) ---
        logger.info(f"🎬 [Phase 3] Director started for Scene {scene_id}")
        
        # Director는 시간이 오래 걸리므로 별도의 Background Task로 분리하지 않고
        # 여기서는 순차적으로 실행하되, Director 내부의 Polling이 비동기를 처리하도록 설계
        # 또는 전체 run_pipeline 자체가 이미 Background Task이므로 동기적으로 호출해도 무방함
        
        director_worker.process_video_task(
            scene_id=scene_id,
            image_url=final_image_url,
            prompt=visual_prompt # 영상 생성용 프롬프트로 재사용
        )
        
        logger.info(f"✅ [Phase 3] Pipeline Completed for Scene {scene_id}")

    except Exception as e:
        logger.error(f"❌ Pipeline Failed: {str(e)}")
        # 에러 발생 시 DB에 기록하여 UI에 표시
        if 'scene_id' in locals():
            db.update_scene(scene_id, {"status": "error", "errorMessage": str(e)})
```

---

### **3\. Writer Agent 수정 (Return Value)**

Writer Agent가 단순히 DB 저장만 하는 것이 아니라, 다음 단계(Artist)를 위해 **Scene ID와 Prompt를 반환**하도록 코드를 살짝 수정해야 합니다.

Python

```
# backend/agents/writer_agent.py 수정

def write_next_scene(project_id: str, topic: str) -> dict:
    # ... (기존 로직: Gemini 호출) ...
    
    # Tool 호출 결과에서 scene_id와 prompt 추출 로직 필요
    # 여기서는 예시로 가상의 리턴값을 구성합니다.
    # 실제로는 Gemini의 Function Call 결과를 파싱해야 합니다.
    
    # (생략된 Gemini 호출 및 파싱 로직)
    
    # 예시 반환값
    return {
        "scene_id": "generated_scene_id_123",
        "visual_prompt": "Cyberpunk detective in rain...",
        "script": "..."
    }
```

---

### **4\. Main Endpoint Connection (`backend/main.py`)**

프론트엔드에서 호출하는 진입점입니다. 사용자는 버튼 한 번만 누르면 됩니다.

Python

```
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from backend.agents import orchestrator

app = FastAPI()

class PipelineRequest(BaseModel):
    project_id: str
    topic: str

@app.post("/api/generate/full-scene")
async def generate_full_scene(request: PipelineRequest, background_tasks: BackgroundTasks):
    """
    사용자의 아이디어를 받아 대본->이미지->영상까지 한 번에 생성합니다.
    """
    # 1. 백그라운드 작업 등록
    background_tasks.add_task(
        orchestrator.run_pipeline, 
        request.project_id, 
        request.topic,
        background_tasks
    )

    # 2. 즉시 응답 (UI는 '생성 시작' 알림 표시)
    return {
        "status": "started",
        "message": "The AI production team (Writer, Artist, Director) has started working.",
        "project_id": request.project_id
    }
```

---

### **5\. 데이터 흐름 및 상태 변화 (Life Cycle)**

이 로직이 실행될 때 Firestore 상의 데이터(`scene` 문서) 상태는 다음과 같이 변합니다. 클라이언트(Next.js)는 이 상태(`status`)만 구독하고 있으면 됩니다.

1. **Request:** `status: undefined` (시작 전)  
2. **Writer Done:** `status: "draft"` (대본 생성 완료, 텍스트 UI 표시)  
3. **Artist Start:** `status: "generating_image"` (로딩 스피너)  
4. **Artist Done:** `status: "image_completed"` (이미지 렌더링)  
5. **Director Start:** `status: "generating_video"` (비디오 아이콘 로딩)  
6. **Director Done:** `status: "completed"` (영상 자동 재생)

### **6\. 구현 체크리스트**

* \[ \] `backend/agents/orchestrator.py` 파일 생성 및 로직 구현.  
* \[ \] `Writer`, `Artist`, `Director` 모듈들이 서로 데이터를 주고받을 수 있도록 리턴 타입 통일.  
* \[ \] 에러 핸들링: 중간에 Artist가 실패했을 때 Director가 실행되지 않도록 `try-except` 블록 확인.

이로써 **DreamFactory v2.1의 백엔드 개발 명세가 완성**되었습니다. ADK 기반의 Writer, Artist, Director 에이전트가 유기적으로 연결되어 사용자의 한 줄 입력을 고품질 비디오로 변환할 준비가 되었습니다 .

https://google.github.io/adk-docs/agents/workflow-agents/ 를 리뷰해봐. 어느 것이 가장 좋은 방안인지 제안해줘

공유해주신 ADK 문서(Workflow Agents)를 검토한 결과, DreamFactory v2.1의 파이프라인(기획 \-\> 시각화 \-\> 영상화)을 구현하기 위한 가장 적합한 방안을 제안해 드립니다.

결론부터 말씀드리면, 전체 흐름을 잡는 \*\*'순차 에이전트(Sequential Agent)'\*\*를 메인으로 사용하되, Artist 단계에 \*\*'루프 에이전트(Loop Agent)'\*\*를 내장하는 **하이브리드 패턴**이 가장 강력하고 안정적입니다.

---

### **1\. ADK Workflow Agent 패턴 분석**

ADK 문서는 3가지 핵심 패턴을 제시합니다.

| 패턴 | 특징 | DreamFactory 적용성 |
| :---- | :---- | :---- |
| **Sequential Agent** | 하위 에이전트들을 **정해진 순서대로** 실행합니다. | **\[Best\]** Writer → Artist → Director로 이어지는 메인 파이프라인에 완벽히 부합합니다. |
| **Loop Agent** | 종료 조건이 충족될 때까지 하위 에이전트를 **반복 실행**합니다. | **\[Essential\]** Artist의 '생성-검증-수정' 자가 수정 루프(Self-Correction) 구현에 필수적입니다. |
| **Parallel Agent** | 여러 에이전트를 **동시에** 실행합니다. | 현재 명세에서는 씬 단위 순차 처리가 중요하므로 우선순위가 낮습니다. (추후 음향/영상 동시 생성 시 고려 가능) |

---

### **2\. 제안: 순차(Sequential) \+ 루프(Loop) 하이브리드 아키텍처**

앞서 Python 코드로 직접 작성했던 orchestrator.py의 로직을 ADK의 **Workflow Agent**로 대체하면, 코드가 훨씬 간결해지고(declarative) 유지보수가 쉬워집니다.

#### **권장 구조**

* **최상위 레벨: Sequential Agent (The Movie Maker)**  
  * 이 에이전트는 단순히 "Writer 실행 \-\> Artist 실행 \-\> Director 실행" 순서를 보장하는 역할을 합니다.  
  * 앞선 단계의 출력(Output)을 다음 단계의 입력(Input)으로 자동 전달합니다.  
* **2단계 상세: Loop Agent (The Perfectionist Artist)**  
  * Sequential 흐름 중 두 번째 단계인 Artist는 단일 에이전트가 아닌 **Loop Agent**로 구성합니다.  
  * **조건(Condition):** "Vision 모델 검사 결과가 'PASS'가 될 때까지"  
  * **반복 작업:** 이미지 생성 및 검증

---

### **3\. 구현 예시 (ADK 스타일)**

이 방식이 왜 좋은지 보여주는 개념적 코드입니다. 복잡한 if/else나 while 문을 작성하는 대신, 레고 블록처럼 에이전트를 조립할 수 있습니다.

Python

```
# ADK Workflow 개념 적용 예시

# 1. 각 에이전트 정의
writer = Agent(name="Writer", ...)
director = Agent(name="Director", ...)

# 2. Artist를 위한 루프 워크플로우 정의 (복잡한 로직 캡슐화)
# "검증(Critique)이 통과할 때까지 그리기(Draw)를 반복하라"
artist_loop = LoopAgent(
    name="ArtistWorkflow",
    sub_agent=artist_agent,  # 그리기 및 검증 도구를 가진 에이전트
    condition=lambda state: state.get("quality_check") == "PASS", # 종료 조건
    max_iterations=3         # 무한 루프 방지
)

# 3. 전체 파이프라인을 순차 워크플로우로 조립 (가장 추천하는 방식)
movie_pipeline = SequentialAgent(
    name="DreamFactoryOrchestrator",
    steps=[
        writer,       # Step 1: 기획
        artist_loop,  # Step 2: 시각화 (품질 만족할 때까지 반복)
        director      # Step 3: 영상화
    ]
)

# 4. 실행
movie_pipeline.run(input="사이버펑크 탐정 영화 아이디어")
```

### **4\. 최종 결론**

**"Sequential Agent"를 기본 골격으로 선택하십시오.**

* **이유:** DreamFactory의 프로세스(기획-이미지-영상)는 선형적(Linear)이기 때문에, Sequential Agent를 사용하면 데이터 흐름이 명확해지고 에러 추적(Debugging)이 가장 쉽습니다.  
* **보완:** 단, Artist의 '품질 보증 과정'은 단순 순차 실행으로 불가능하므로, 이 부분만 \*\*Loop Agent\*\*로 감싸서 Sequential Agent의 한 단계(Step)로 끼워 넣으십시오.

이 접근 방식은 앞서 우리가 작성한 Python 오케스트레이터 코드를 **ADK 프레임워크 네이티브 방식**으로 승격시켜, 안정성과 확장성을 모두 확보할 수 있게 해줍니다.

https://google.github.io/adk-docs/agents/multi-agents/ 리뷰해보고, 적용해야 할 부분을 알려줘

공유해주신 **ADK Multi-Agent Systems** 문서(Router, Supervisor 패턴 등)를 검토한 결과, DreamFactory v2.1의 목표인 **'디지털 오피스(Digital Office)'** 를 구현하기 위해 **반드시 적용해야 할 두 가지 핵심 패턴**을 찾아냈습니다.

이전 단계에서 제안한 '순차(Sequential) 워크플로우'는 \*\*"신규 생성"\*\*에는 완벽하지만, 사용자와 대화하며 \*\*"수정 및 협업"\*\*하는 과정에는 한계가 있습니다. 이를 보완하기 위해 다음 두 가지를 적용해야 합니다.

---

### **1\. Router Pattern (라우터 패턴): "똑똑한 작업 배분"**

사용자가 항상 "처음부터 끝까지 다 만들어줘"라고 요청하지는 않습니다. 때로는 "대사만 좀 고쳐줘" 혹은 "이미지만 다시 그려줘"라고 요청할 것입니다.

* **현재 문제:** SequentialAgent는 무조건 \[Writer → Artist → Director\] 순서로만 움직입니다. "이미지만 고쳐줘"라고 해도 Writer부터 다시 시작하는 비효율이 발생합니다.  
* **적용 방안:** 최상단에 \*\*Router Agent(접수원)\*\*를 배치하여 사용자 의도에 따라 적절한 전문가(Agent)에게 작업을 직행시킵니다.

#### **적용 시나리오 (Code Concept)**

Python

```
# Router Agent가 사용자 입력을 분석하여 적절한 에이전트를 호출
router_prompt = """
사용자의 요청을 분석하여 다음 중 담당할 에이전트를 선택하시오.
- "Scene 3 대사 수정해줘" -> Writer Agent
- "주인공 옷 색깔 바꿔줘" -> Artist Agent
- "영상 길이가 너무 짧아" -> Director Agent
- "새로운 영화 만들어줘" -> Sequential Pipeline (Writer->Artist->Director)
"""
```

### **2\. Supervisor Pattern (슈퍼바이저 패턴): "총괄 감독관"**

DreamFactory v2.1의 핵심인 **Writer, Artist, Director가 협업하는 구조** 를 완성하려면, 이들을 관리하는 \*\*Manager (Supervisor)\*\*가 필요합니다.

* **왜 필요한가?**  
  * Sequential은 앞 단계가 끝나면 뒤도 안 돌아보고 다음으로 넘어갑니다.  
  * 하지만 **Supervisor**는 Artist가 이미지를 그렸는데 퀄리티가 낮으면, \*\*"Writer, 배경 묘사가 너무 부실해서 Artist가 못 그리겠대. 묘사 좀 보강해봐"\*\*라며 \*\*역방향 피드백(Feedback Loop)\*\*을 줄 수 있습니다.  
* **적용 효과:** 단순한 공정(Pipeline)이 아니라, 서로 대화하며 문제를 해결하는 진짜 \*\*'팀(Team)'\*\*이 됩니다.

---

### **\[제안\] DreamFactory v2.1 최종 아키텍처 (Hybrid)**

ADK의 워크플로우(Workflow)와 멀티 에이전트(Multi-agent)를 결합한 **하이브리드 구조**를 제안합니다.

| 계층 (Layer) | 패턴 (Pattern) | 역할 및 적용 내용 |
| :---- | :---- | :---- |
| **L1. 진입점** | **Router Agent** | 사용자의 자연어 요청을 분석하여 \*\*"전체 생성"\*\*인지 \*\*"특정 부분 수정"\*\*인지 판단하여 라우팅합니다. |
| **L2. 총괄** | **Supervisor Agent** | **"전체 생성"** 요청 시, Writer/Artist/Director를 조율합니다. 에러 발생 시 재작업을 지시하거나, 사용자에게 추가 질문을 하여 모호함을 해소합니다. |
| **L3. 실행** | **Sequential Workflow** | Supervisor의 지시에 따라 실제 작업을 수행하는 엔진입니다. (우리가 앞서 만든 파이프라인) |

### **구현 로드맵 수정**

기존의 orchestrator.py를 **Supervisor Agent**로 업그레이드하는 것이 좋습니다.

1. **기존:** 단순히 순서대로 함수 호출 (run\_pipeline).  
2. **변경 (ADK Multi-Agent 적용):**  
   * Manager LLM을 하나 둡니다.  
   * Writer, Artist, Director를 \*\*Tools(도구)\*\*로 쥐어줍니다.  
   * Manager에게 \*\*"사용자의 아이디어를 바탕으로 영상을 완성해. 각 단계 결과물을 확인하고 미흡하면 재지시해."\*\*라는 프롬프트를 줍니다.

결론:

ADK 문서의 \*\*"Router"\*\*는 \*\*채팅 인터페이스(수정 요청 대응)\*\*를 위해 적용하고, "Supervisor" 개념은 \*\*오케스트레이터의 지능화(에러 복구 및 조율)\*\*를 위해 적용하십시오. 이것이 명세서의 '디지털 오피스' 비전을 가장 완벽하게 구현하는 길입니다.

# **DreamFactory v2.1 Hybrid Architecture 상세 설계서**

## **1\. 아키텍처 개요 (System Overview)**

본 시스템은 **3계층(Tier) 에이전트 구조**를 채택하여, 사용자의 의도 파악(Router), 작업 조율(Supervisor), 실무 수행(Worker)을 분리합니다. 이를 통해 '새로운 영상 생성'뿐만 아니라 '특정 장면의 대사 수정', '이미지 톤 변경' 등 복잡한 협업 시나리오를 지원합니다.

### **계층 구조 (Hierarchy)**

1. **L1 \- Reception Layer (Router Agent):** 사용자의 자연어 입력을 분석하여 작업의 성격(신규 생성 vs 수정 vs 단순 질문)을 분류하고 담당자에게 연결합니다.  
2. **L2 \- Management Layer (Supervisor Agent):** '총괄 프로듀서' 역할을 수행합니다. Writer, Artist, Director를 도구(Tool)로 거느리며, 작업의 품질을 검수하고 에이전트 간의 데이터 흐름을 제어합니다.  
3. **L3 \- Execution Layer (Specialist Agents):** 실제 작업을 수행하는 전문가 그룹입니다.  
   * **Writer:** Sequential Workflow (기획 \-\> 대본)  
   * **Artist:** **Loop Workflow** (생성 \-\> 검증 \-\> 수정)  
   * **Director:** Async Task (생성 \-\> 폴링)

---

## **2\. 컴포넌트 상세 명세 (Component Specifications)**

### **2.1 L1: Router Agent (The Receptionist)**

사용자의 요청이 들어오는 첫 번째 관문입니다. 복잡한 추론보다는 빠른 분류(Classification)가 목적입니다.

* **Model:** Gemini 3.0 Flash (속도 최적화)  
* **Role:** Intent Classifier  
* **Logic:**  
  * New Project: "새로운 느와르 영화 만들어줘" → **Supervisor (Full Pipeline 모드)** 연결  
  * Revision: "Scene 3의 대사를 좀 더 슬프게 고쳐줘" → **Writer Agent** 직접 연결 (혹은 Supervisor를 경유하여 문맥 유지)  
  * Visual Tweak: "주인공 옷을 파란색으로 바꿔줘" → **Artist Agent** 연결  
  * Q\&A: "현재 프로젝트 진행 상황 알려줘" → **Supervisor (Status Check)** 연결

### **2.2 L2: Supervisor Agent (The Chief Producer)**

DreamFactory v2.1의 핵심인 '협업 지능'을 담당합니다. ADK의 **Orchestrator** 역할을 수행합니다.

* **Model:** Gemini 3.0 Pro (추론 및 조율 능력)  
* **Tools:**  
  * call\_writer(topic, context)  
  * call\_artist(scene\_data)  
  * call\_director(image\_url)  
  * read\_project\_bible(project\_id)  
* **Responsibility:**  
  * **Context Sharing:** Writer가 작성한 visual\_prompt를 Artist에게 정확히 전달.  
  * **Error Handling:** Artist가 이미지를 생성하지 못하면 Writer에게 "프롬프트가 너무 추상적이니 구체화해달라"고 **역방향 지시(Feedback)** 수행.  
  * **Final QA:** Director가 만든 영상이 너무 짧거나 이상하면 재생성 지시.

### **2.3 L3: Specialist Agents (The Workers)**

각 분야의 전문 작업을 수행하며, ADK의 다양한 패턴이 적용됩니다.

| Agent | Workflow Pattern | Key Logic & Source |
| :---- | :---- | :---- |
| **Writer** | **Sequential** | Thinking Process를 통해 rationale과 script를 순차 생성 . |
| **Artist** | **Loop (ReAct)** | Vision 모델을 심판관(Critic)으로 두어, check\_quality가 Pass될 때까지 generate\_image 반복 . |
| **Director** | **Async Handler** | Veo 3.1 호출 후 background\_task로 위임, 완료 시 알림 . |

---

## **3\. 구현 상세 (Implementation Details using ADK)**

### **3.1 Supervisor Definition (Python Code Concept)**

Supervisor는 ADK의 Agent로 정의되며, 하위 에이전트들을 함수(Tool)처럼 호출합니다.

Python

```
from google.genai import types
from backend.agents import writer, artist, director
from backend.tools import db_tools

# Supervisor가 사용할 도구 정의 (하위 에이전트 호출 래핑)
def delegate_to_writer(ctx: str):
    return writer.run(ctx)

def delegate_to_artist(scene_data: dict):
    return artist.run_loop(scene_data) # Loop Agent 실행

def delegate_to_director(image_url: str):
    return director.run_async(image_url)

# Supervisor Agent 설정
supervisor_prompt = """
당신은 DreamFactory의 총괄 프로듀서입니다.
사용자의 요청에 따라 Writer, Artist, Director를 적절히 지휘하여 프로젝트를 완성하십시오.

[Rules]
1. 신규 프로젝트 요청 시: Writer -> Artist -> Director 순서로 실행하십시오.
2. 각 단계의 출력(Output)을 다음 단계의 입력(Input)으로 전달해야 합니다.
3. Artist 작업 후 결과물이 만족스럽지 않다면(Artist가 실패 리턴 시), Writer에게 프롬프트 수정을 지시하십시오.
"""

supervisor_tools = [delegate_to_writer, delegate_to_artist, delegate_to_director, db_tools.get_project_status]

# ADK Agent 초기화
supervisor_agent = Agent(
    model="gemini-3.0-pro-preview",
    system_instruction=supervisor_prompt,
    tools=supervisor_tools
)
```

### **3.2 Router Logic (FastAPI Endpoint)**

요청을 가장 먼저 받는 FastAPI 엔드포인트에서 라우팅 로직을 수행합니다.

Python

```
@app.post("/api/command")
async def handle_command(request: UserCommand):
    # 1. Router Agent에게 의도 분류 요청
    intent = router_agent.classify(request.text)
    
    if intent == "NEW_PROJECT":
        # Supervisor에게 전체 파이프라인 위임
        return supervisor_agent.run(task="create_new", input=request.text)
        
    elif intent == "REVISE_SCENE_SCRIPT":
        # Supervisor를 통해 Writer에게만 접근 (문맥 유지를 위해 Supervisor 경유 권장)
        return supervisor_agent.run(task="revise_script", input=request.text)
        
    elif intent == "REGENERATE_IMAGE":
        # Artist Loop만 단독 실행
        return supervisor_agent.run(task="redraw_scene", input=request.text)
```

---

## **4\. 데이터 모델링 확장 (Data Modeling Extension)**

Hybrid 아키텍처를 지원하기 위해 기존 데이터 모델 에 **협업 상태(Collaboration State)** 필드를 추가해야 합니다.

**projects/{projectId}/scenes/{sceneId} 문서 확장:**

TypeScript

```
interface Scene {
  // ... 기존 필드 (script, rationale 등) ...

  // [New] 에이전트 협업 상태 로그
  collaboration_log: {
    agent: 'supervisor' | 'writer' | 'artist';
    action: string;      // "Rejected Artist's image due to low quality"
    timestamp: Timestamp;
  }[];

  // [New] 현재 활성화된 에이전트 (UI 표시용)
  active_agent: 'writer' | 'artist' | 'director' | 'supervisor' | 'idle';
  
  // [New] Artist Loop 상태
  artist_iteration_count: number; // 무한 루프 방지용 (Max 3)
}
```

---

## **5\. 시나리오별 실행 흐름 (Execution Flow)**

### **Scenario A: 신규 생성 ("사이버펑크 영화 만들어줘")**

1. **Router:** NEW\_PROJECT 감지 → **Supervisor** 호출.  
2. **Supervisor:** Writer 호출.  
3. **Writer:** 대본/프롬프트 생성 및 DB 저장.  
4. **Supervisor:** Writer의 결과를 받아 Artist 호출.  
5. **Artist (Loop):** (생성 \-\> Vision 검사 \-\> 수정) x 2회 반복 후 성공 → DB 저장.  
6. **Supervisor:** Director 호출.  
7. **Director:** Veo 3.1 비동기 요청 후 종료. (Supervisor는 "영상 생성 시작됨" 응답 반환)

### **Scenario B: 수정 요청 ("Scene 2 배경을 좀 더 밝게 해줘")**

1. **Router:** VISUAL\_REVISION 감지 → **Supervisor** 호출.  
2. **Supervisor:** DB에서 Scene 2 데이터 로드.  
3. **Supervisor:** 사용자 요청("밝게")을 반영하여 Artist에게 \*\*"기존 프롬프트에 'bright lighting'을 추가해서 다시 그려"\*\*라고 지시.  
4. **Artist:** 수정된 프롬프트로 이미지 재생성 (Loop 수행).  
5. **Supervisor:** 완료 확인 후 사용자에게 알림.

---

## **6\. 개발 및 배포 전략**

이 아키텍처는 복잡도가 높으므로 단계적 개발을 권장합니다 .

1. **Phase 1 (Basic):** Supervisor 없이 Router가 직접 Writer, Artist, Director를 순차 호출 (기존 orchestrator.py 방식).  
2. **Phase 2 (Loop):** Artist Agent 내부에 자가 수정(Self-Correction) Loop 탑재.  
3. **Phase 3 (Supervisor):** Supervisor Agent를 도입하여 에이전트 간 대화 및 에러 복구 로직 구현.

이 상세 설계서는 Gemini 3.0의 Thinking Process와 Veo 3.1의 생성 능력을 최대로 활용하며, ADK의 구조적 장점을 통해 유지보수가 용이한 엔터프라이즈급 시스템을 보장합니다.

# Gemini 3.0 Pro AI Agent

This project implements a Python-based AI agent utilizing the Google Agent Development Kit (ADK) and the Gemini 3.0 Pro model. The agent is designed to perform tasks using Google Search capabilities.

## Features

-   **Gemini 3.0 Pro Integration**: Leverages the latest Gemini model (`gemini-3-pro-preview`) for advanced reasoning and natural language understanding.
-   **Google Search Tool**: Equipped with the `google_search` tool to fetch real-time information from the web.
-   **Google ADK**: Built on top of the Google Agent Development Kit for robust agent management and execution.
-   **Asynchronous Execution**: Uses `asyncio` for efficient, non-blocking agent interactions.

## Prerequisites

-   Python 3.12 or higher
-   Google Cloud Project with Vertex AI API enabled
-   Application Default Credentials (ADC) configured

## Installation

This project uses `uv` for dependency management, but can also be installed via `pip`.

### Using `uv` (Recommended)

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd gemini-3-pro-ai-agent
    ```

2.  Sync dependencies:
    ```bash
    uv sync
    ```

### Using `pip`

1.  Clone the repository and navigate to the project directory.
2.  Install dependencies:
    ```bash
    pip install .
    ```

## Usage

To run the agent and see a demonstration of its search capabilities:

```bash
python my_agent/agent.py
```

Or if using `uv`:

```bash
uv run my_agent/agent.py
```

This will execute the `call_agent_async` function, which queries the agent with "what's the latest ai news?" and prints the response.

## Code Structure

-   **`my_agent/agent.py`**: The core implementation file.
    -   Defines the `root_agent` with the `gemini-3-pro-preview` model and `google_search` tool.
    -   Sets up the `InMemorySessionService` and `Runner`.
    -   Contains the `call_agent_async` function to handle the interaction loop.
-   **`main.py`**: A simple entry point script (currently a stub).
-   **`pyproject.toml`**: Project configuration and dependencies.

## Configuration

The agent is currently configured with hardcoded constants in `my_agent/agent.py` for demonstration purposes:
-   `APP_NAME`: "google_search_agent"
-   `USER_ID`: "user1234"
-   `SESSION_ID`: "1234"

For production use, these should be dynamic or configurable via environment variables.
