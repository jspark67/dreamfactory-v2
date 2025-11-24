# **DreamFactory v2.0 Development Specification (Expanded)**

**Gemini 3.0 Native Architecture Implementation Guide: Enterprise-Grade AI Studio**

## **1\. 개요 (Overview)**

본 문서는 기존 llys-ai/dreamfactory 프로젝트를 Gemini 3.0 Native Architecture로 전면 리팩토링 및 고도화하기 위한 포괄적인 상세 개발 명세서입니다.  
단순히 레거시 모델을 최신 모델로 교체하는 수준을 넘어, AI가 인간 제작자의 의도를 심층적으로 이해하고 추론하는 Thinking Model, 컷 간의 시각적 불일치를 해결하는 Few-shot Consistency, 그리고 영상과 오디오를 통합 생성하는 Native Audio Video 기술을 유기적으로 결합하여, 실제 상용 수준의 콘텐츠 제작이 가능한 엔터프라이즈급 AI 비디오 스튜디오를 구축하는 것을 목표로 합니다.

### **1.1 핵심 목표 및 기술적 의의: '디지털 오피스'의 구현**

DreamFactory v2.0은 단순한 툴(Tool)이 아닌, **Writer, Artist, Director**라는 세 명의 AI 전문가 에이전트와 인간 사용자가 함께 일하는 \*\*'디지털 오피스(Digital Office)'\*\*를 지향합니다.

1. **Writer 고도화 (Cognitive Layer)**:  
   * 단순한 텍스트 생성을 넘어, Gemini 3.0 Pro의 **Thinking Process**를 활용합니다. AI가 왜 특정 대사나 지문을 선택했는지에 대한 연출 의도(rationale)를 함께 출력하게 함으로써, 사용자가 AI의 창작 논리를 이해하고 더욱 정교한 피드백을 줄 수 있는 구조를 만듭니다.  
   * **사고 서명(Thought Signatures)** 기술을 도입하여 멀티 턴 대화에서도 초기 기획 의도와 맥락을 잃지 않도록 '기억'을 강화합니다. 이는 AI가 이전 턴의 추론 과정을 암호화된 토큰 형태로 기억하고 활용하게 하여 **추론 드리프트(Reasoning Drift)** 현상을 방지합니다.  
2. **Artist 일관성 (Visual Identity)**:  
   * Gemini 3.0 Image Pro (Code name: **Nano Banana Pro**)의 **Reference Image Injection** 기능을 도입하여, 최대 14장의 레퍼런스 이미지를 통해 생성형 비디오의 고질적인 문제인 '컷마다 얼굴이 바뀌는 현상'을 원천 차단합니다.  
   * \*\*자가 수정 루프(Self-Correction Loop)\*\*를 통해 AI가 스스로 결과물을 검수하고 수정하는 품질 보증(QA) 프로세스를 내재화합니다. 생성된 이미지를 Vision 모델로 재검증하고, 기준 미달 시 스스로 프롬프트를 수정하여 재생성합니다.  
3. **Director 멀티모달 (Audiovisual Integration)**:  
   * **Python 기반 AI 엔진 도입**: 최신 Veo 3.1 모델의 VideoGenerationReferenceImage 기능(이미지를 영상으로 변환)을 온전히 활용하기 위해, \*\*Python SDK (google.genai)\*\*를 기반으로 한 별도의 백엔드 서버를 구축합니다.  
   * Veo 3.1을 도입하여 비디오와 오디오(캐릭터 대사, 앰비언스, 효과음)를 단일 추론 과정에서 동시에 생성합니다. 이는 후반 작업(Post-production)의 복잡도를 획기적으로 낮추고 영상의 몰입감을 극대화합니다.  
4. **실시간 협업 (Real-time Collaboration)**:  
   * 단일 사용자 경험을 넘어 팀 단위 제작을 지원하기 위해, Firestore 기반의 문서 잠금(Locking), 실시간 커서 공유, 상태 동기화 기능을 강화하여 'Google Docs for Video' 수준의 UX를 제공합니다.

## **2\. 시스템 아키텍처 (System Architecture)**

Veo 3.1 및 Gemini 3.0의 최신 기능을 지원하는 Python 라이브러리 생태계를 활용하기 위해, \*\*클라이언트(Next.js) \- AI 서버(Python) \- 데이터베이스(Firebase)\*\*로 분리된 아키텍처를 채택합니다.

### **2.1 기술 스택 및 선정 근거 (Tech Stack Justification)**

| 구성 요소 | 기술 스택 | 선정 이유 및 기술적 정당성 |
| :---- | :---- | :---- |
| **Client (Frontend)** | **Next.js 16 (App Router)** | 사용자 인터페이스 및 실시간 협업 뷰. React Server Components를 통해 초기 로딩 속도를 최적화합니다. |
| **AI Server (Backend)** | **Python (FastAPI)** | **핵심 변경 사항**: Veo 3.1의 google.genai Python SDK가 제공하는 최신 기능(Image-to-Video, Reference inputs)을 사용하기 위해 Python 환경이 필수적입니다. 비동기 처리에 강한 FastAPI를 사용합니다. |
| **UI / Styling** | **React 19 & Tailwind CSS** | Actions/Optimistic Updates를 통한 체감 지연 시간 최소화. 유틸리티 퍼스트 스타일링으로 빠른 디자인 시스템 구축 및 다크 모드 대응. |
| **State Mgmt** | **Zustand & TanStack Query** | UI 상태(클라이언트)와 비동기 데이터 상태(서버)의 명확한 분리. |
| **Database** | **Firebase Firestore** | NoSQL 문서 기반 DB로 유연한 스키마 변경 용이. onSnapshot 리스너를 통한 강력한 실시간 협업(Presence) 기능 제공. |
| **Storage** | **Firebase Storage** | 생성된 대용량 이미지 및 비디오 파일을 저장하고 CDN을 통해 서빙합니다. |
| **Auth** | **Firebase Authentication** | Google 로그인 통합 및 보안 규칙 연동. |
| **Video Engine** | **Remotion** | React 코드로 영상을 프로그래매틱하게 렌더링. Veo 생성 실패 시 즉각적인 Fallback(Plan B) 제공. |

### **2.2 하이브리드 렌더링 및 데이터 파이프라인**

데이터 흐름은 클라이언트의 요청이 Python AI 서버로 전달되어 처리된 후, DB를 통해 클라이언트에 동기화되는 구조입니다.

1. **Initiation**: 사용자가 아이디어(Topic)를 입력하면 **Client**가 **AI Server**의 오케스트레이션 엔드포인트를 호출합니다.  
2. **Cognitive Phase (Writer Agent \- Python)**:  
   * Python 서버에서 Gemini 3.0 Pro를 호출하여 시나리오를 작성하고 Thought Signature를 관리합니다.  
   * 결과(rationale, scenes)를 Firestore에 저장합니다.  
3. **Visual Synthesis (Artist Agent \- Python)**:  
   * Gemini 3.0 Image Pro를 호출하여 이미지를 생성하고, Vision 모델로 자가 검증(Loop)합니다.  
   * 최종 이미지를 **Firebase Storage**에 업로드하고 URL을 Firestore에 업데이트합니다.  
4. **Motion & Audio Generation (Director Agent \- Python)**:  
   * **Image-to-Video**: Firestore에서 이미지 URL을 가져와 다운로드한 후, google.genai.types.VideoGenerationReferenceImage 객체로 변환하여 Veo 3.1에 전달합니다.  
   * **Polling**: 영상 생성이 완료될 때까지 Python 서버가 상태를 폴링하고, 완료 시 영상을 다운로드하여 Firebase Storage에 저장합니다.  
5. **Feedback & Sync**:  
   * Firestore의 데이터가 변경되면 Client(Next.js)의 onSnapshot 리스너가 트리거되어 UI를 즉시 업데이트합니다.

## **3\. 데이터 모델링 (Data Modeling)**

Gemini 3.0의 기능을 온전히 활용하기 위해, 데이터 모델은 '맥락(Context)'과 '상태(State)'를 정밀하게 저장할 수 있도록 설계되었습니다.

### **3.1 projects Collection (Global Context)**

interface Project {  
  id: string;  
  title: string;  
  ownerId: string;  
  status: 'scripting' | 'storyboarding' | 'filming' | 'completed';  
    
  // Production Bible (Gemini Context Window용 데이터)  
  productionBible: {  
    genre: string;  
    tone: string;   
    visualStyle: string;   
    characters: Record\<string, {  
      id: string;  
      name: string;  
      description: string;  
      // \[Critical\] Artist Agent가 참조할 레퍼런스 이미지 URL 배열  
      referenceImageUrls: string\[\];   
    }\>;  
  };  
    
  // 협업 멤버 관리  
  members: {  
    uid: string;  
    role: 'owner' | 'editor' | 'viewer';  
    email: string;  
    lastActiveAt: Timestamp;  
    currentFocus?: string;   
  }\[\];  
    
  createdAt: Timestamp;  
  updatedAt: Timestamp;  
}

### **3.2 scenes Sub-collection (projects/{projectId}/scenes)**

interface Scene {  
  id: string;  
  sequenceNumber: number;  
    
  // \--- Writer Agent Output \---  
  script: string;   
  visual\_prompt: string;   
  rationale: string;   
    
  // \--- Artist Agent Output \---  
  imageUrl?: string; // Storage URL  
  imagePromptRevison?: string;   
    
  // \--- Director Agent Output \---  
  videoUrl?: string; // Storage URL (MP4)  
  // Veo 3.1 생성 실패 시 Remotion Fallback 데이터  
  videoComposition?: {  
    type: 'ken\_burns';  
    config: {  
      zoomStart: number;   
      zoomEnd: number;     
      panX: number;        
      panY: number;  
      duration: number;  
    };  
  };  
    
  // \--- State & Collaboration \---  
  status: 'draft' | 'generating\_image' | 'generating\_video' | 'completed' | 'error';  
  lockedBy?: string;   
  lockedAt?: Timestamp;   
  comments: Array\<{  
      uid: string;  
      text: string;  
      createdAt: Timestamp;  
  }\>;  
}

## **4\. 에이전트 상세 명세 (Agent Specifications \- Python Implementation)**

모든 에이전트 로직은 **Python (FastAPI)** 서버 내에서 구현됩니다.

### **4.1 Writer Agent (The Brain)**

* **Model**: gemini-3.0-pro-preview  
* **Language**: Python (google-generativeai)  
* **Logic**:  
  * thinking\_level="high" 설정을 통해 심층 추론 수행.  
  * 이전 대화의 맥락 유지를 위해 thought\_signature 토큰을 관리하고 전달.  
  * JSON 응답 파싱 및 유효성 검증(Pydantic).

### **4.2 Artist Agent (The Eye)**

* **Model**: gemini-3.0-pro-image-preview  
* **Logic**:  
  * reference\_images 파라미터를 사용하여 캐릭터 일관성 유지.  
  * 생성된 이미지를 PIL 라이브러리로 처리하고 Vision 모델에 재전송하여 품질 검증.  
  * 검증 실패 시 프롬프트를 수정하여 재시도하는 while 루프 구현.

### **4.3 Director Agent (The Action)**

* **Model**: veo-3.1-generate-preview  
* **Library**: google.genai (최신 SDK)  
* **Logic**:  
  * **Image-to-Video**:  
    \# Python Implementation Spec  
    dress\_reference \= types.VideoGenerationReferenceImage(  
        image=dress\_image\_bytes,   
        reference\_type="asset"  
    )  
    operation \= client.models.generate\_videos(  
        model="veo-3.1-generate-preview",  
        prompt=video\_prompt,  
        config=types.GenerateVideosConfig(  
            reference\_images=\[dress\_reference\], \# 이미지 주입  
        ),  
    )

  * **Polling**: 비동기 작업(operation)의 완료 여부를 주기적으로 확인(time.sleep)하고, 완료 시 비디오 데이터를 다운로드합니다.  
  * **Storage Upload**: 다운로드된 MP4 데이터를 Firebase Storage에 업로드하고, 공개 URL을 획득하여 Firestore에 저장합니다.

## **5\. API 및 인터페이스 명세 (Internal API)**

\*\*Python Backend (FastAPI)\*\*가 제공하는 엔드포인트입니다.

### **5.1 Orchestrator Endpoint (POST /api/generate)**

**Request Body:**

{  
  "project\_id": "string",  
  "scene\_id": "string", // Optional (if scene specific)  
  "agent\_type": "writer" | "artist" | "director",  
  "input\_context": { ... }   
}

**Response:**

{  
  "status": "processing",  
  "task\_id": "uuid" // Background task ID  
}

*참고: 영상 생성은 시간이 오래 걸리므로, 서버는 "처리 중" 응답을 즉시 반환하고 백그라운드 워커(Background Tasks)에서 실제 생성을 수행합니다. 완료 알림은 Firestore 업데이트를 통해 클라이언트에 전달됩니다.*

## **6\. 프론트엔드 및 협업 기능 명세**

### **6.1 실시간 협업 엔진 (Collaboration Engine)**

* **Firestore Listener**: Next.js 클라이언트는 projects/{id} 및 scenes 컬렉션을 구독(onSnapshot)합니다. Python 백엔드가 데이터를 업데이트하면 클라이언트 UI가 즉시 반응합니다.  
* **Optimistic UI**: 사용자의 텍스트 수정 등은 로컬에 즉시 반영하고, 백그라운드에서 서버로 전송하여 지연 시간을 숨깁니다.

### **6.2 하이브리드 미디어 플레이어**

* Veo 영상(videoUrl)이 있으면 우선 재생하고, 없으면 Remotion 데이터(videoComposition)를 재생하는 로직은 기존과 동일하게 유지하되, 데이터 소스를 Firestore의 실시간 업데이트에 의존합니다.

## **7\. 구현 로드맵 (Implementation Plan)**

### **Phase 1: Python Backend Setup (Day 1\)**

* FastAPI 프로젝트 초기화 및 가상 환경 설정.  
* google-genai, firebase-admin 라이브러리 설치 및 인증 설정.  
* 기본 Hello World API 작성 및 Firebase 연결 테스트.

### **Phase 2: Agents Migration to Python (Day 2-4)**

* **Writer**: Gemini 3.0 Pro 연동, Thinking 모드 테스트.  
* **Artist**: 레퍼런스 이미지 처리 로직 및 Vision 검증 루프 이식.  
* **Director**: Veo 3.1 Image-to-Video 파이프라인 구현 (Polling 로직 포함).

### **Phase 3: Frontend Integration (Day 5-6)**

* Next.js의 API 호출 대상을 Python 백엔드로 변경.  
* 비디오 생성 요청 시 "처리 중" UI 표시 및 완료 시 자동 재생 로직 구현.

### **Phase 4: Deployment (Day 7\)**

* **Frontend**: Vercel 배포.  
* **Backend**: Google Cloud Run 배포 (Python 컨테이너).  
  * \--timeout=3000s 설정 (영상 생성 대기 시간 고려).  
  * Service Account 키 관리 (Secret Manager 활용).

## **8\. 배포 및 운영 주의사항 (Deployment & Operations)**

* **Cloud Run Scaling**: Python 백엔드는 CPU/Memory 사용량이 높으므로 min-instances를 1로 설정하여 Cold Start를 방지하는 것이 좋습니다.  
* **CORS**: Next.js 프론트엔드 도메인에서의 요청만 허용하도록 FastAPI의 CORS 설정을 구성해야 합니다.  
* **Environment Variables**: GOOGLE\_API\_KEY 및 Firebase Admin SDK 키(SERVICE\_ACCOUNT\_JSON)는 환경 변수로 안전하게 관리해야 합니다.

\---

\#\#\# 앤티그래비티(Antigravity) 도구 프롬프트

아래는 구글 앤티그래비티와 같은 에이전트 기반 개발 도구에서 이 아키텍처를 구현하기 위해 사용할 수 있는 단계별 프롬프트입니다.

\#\#\#\# \*\*Prompt 1: Python 백엔드 프로젝트 초기화 (Environment Setup)\*\*

\`\`\`markdown  
\*\*Role:\*\* Backend Architect

\*\*Objective:\*\* Initialize the Python backend for 'DreamFactory v2.0' to handle AI generation tasks.

\*\*Instructions:\*\*  
1\.  \*\*Create Backend Directory:\*\* Create a folder named \`backend\` at the project root.  
2\.  \*\*Setup Python Environment:\*\*  
    \* Create a virtual environment: \`python \-m venv venv\`  
    \* Create \`requirements.txt\` with:  
      \`\`\`  
      fastapi  
      uvicorn  
      google-genai  
      firebase-admin  
      python-dotenv  
      pydantic  
      requests  
      \`\`\`  
3\.  \*\*Scaffold App Structure:\*\*  
    \* \`backend/main.py\` (FastAPI app entry point)  
    \* \`backend/agents/\` (Folder for AI logic: writer.py, artist.py, director.py)  
    \* \`backend/utils/\` (Firebase helpers)  
    \* \`backend/.env\` (Environment variables template)  
4\.  \*\*Initialize FastAPI:\*\* In \`main.py\`, setup a basic FastAPI instance with CORS middleware allowing \`localhost:3000\`.

\*\*Output:\*\* Directory structure and \`main.py\` file code.

#### **Prompt 2: Firebase Admin 및 유틸리티 설정 (Database Integration)**

\*\*Role:\*\* Backend Developer

\*\*Objective:\*\* Set up Firebase Admin SDK in Python for Firestore and Storage operations.

\*\*Instructions:\*\*  
1\.  \*\*Config File:\*\* Create \`backend/utils/firebase\_config.py\`.  
2\.  \*\*Initialize SDK:\*\* Use \`firebase\_admin.credentials.Certificate\` to load the service account JSON (path from env var) and initialize the app.  
3\.  \*\*Helper Functions:\*\* Implement the following in \`backend/utils/firestore\_helpers.py\`:  
    \* \`update\_scene(project\_id, scene\_id, data)\`: Updates a document in Firestore.  
    \* \`upload\_to\_storage(file\_path, destination\_path)\`: Uploads a local file to Firebase Storage and returns the signed/public URL.  
    \* \`get\_project\_bible(project\_id)\`: Fetches production bible data.

\*\*Constraint:\*\* Use environment variables for credential paths.

#### **Prompt 3: Director Agent (Veo 3.1 Image-to-Video) 구현**

\*\*Role:\*\* AI Engineer

\*\*Objective:\*\* Implement the \`Director Agent\` using \`google.genai\` SDK for Veo 3.1 Image-to-Video generation.

\*\*Instructions:\*\*  
1\.  \*\*Create File:\*\* \`backend/agents/director.py\`.  
2\.  \*\*Import:\*\* \`from google import genai\`, \`from google.genai import types\`.  
3\.  \*\*Function:\*\* Define \`generate\_video(scene\_id: str, image\_url: str, prompt: str)\`.  
4\.  \*\*Implementation Steps:\*\*  
    \* Initialize \`genai.Client\`.  
    \* Download image from \`image\_url\` to memory/temp file.  
    \* Create \`reference\_image\` object using \`types.VideoGenerationReferenceImage\`.  
    \* Call \`client.models.generate\_videos\` with model \`"veo-3.1-generate-preview"\`.  
    \* \*\*Polling Loop:\*\* Implement a \`while\` loop checking \`operation.done\` with \`time.sleep(10)\`.  
    \* \*\*Save & Upload:\*\* Upon completion, download the video, save locally as \`temp\_{scene\_id}.mp4\`, upload to Firebase Storage, and get the URL.  
    \* \*\*Update DB:\*\* Call \`update\_scene\` with the new \`videoUrl\` and set status to \`completed\`.  
    \* \*\*Error Handling:\*\* Wrap in try-except. On failure, generate Remotion fallback metadata and update DB with \`videoComposition\`.

\*\*Reference:\*\* Use the provided Veo Python sample code logic.  
