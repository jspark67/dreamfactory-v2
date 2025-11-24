# DreamFactory v2.1 하이브리드 아키텍처 (Hybrid Architecture) 워크스루

## 개요 (Overview)
이 문서는 DreamFactory v2.1의 백엔드를 **하이브리드 아키텍처(Router + Supervisor + Specialists)**로 리팩토링한 내용을 설명합니다.
Google ADK를 사용하여 **의도 파악(Intent Classification)**과 **지능형 오케스트레이션(Intelligent Orchestration)**을 구현했습니다.

## 아키텍처 변경 사항 (Architecture Changes)

### 1. 계층 구조 (Layered Structure)
- **L1 Router Agent** (`backend/agents/router_agent.py`):
    - 사용자의 입력(`topic`)을 분석하여 의도(`NEW_PROJECT`, `REVISE_SCENE` 등)를 분류합니다.
- **L2 Supervisor Agent** (`backend/agents/supervisor_agent.py`):
    - '총괄 프로듀서' 역할을 수행합니다.
    - 하위 에이전트(Writer, Artist, Director)를 **도구(Tool)**로 사용하여 작업을 조율합니다.
- **L3 Specialist Agents**:
    - **Writer**: 대본 작성 (Sequential)
    - **Artist**: 이미지 생성 및 자가 수정 (Loop)
    - **Director**: 영상 생성 (Async)

### 2. 위임 도구 (Delegation Tools)
- `backend/tools/delegation_tools.py`: Supervisor가 하위 에이전트를 호출할 수 있도록 래핑한 함수들입니다.
    - `delegate_to_writer`
    - `delegate_to_artist`
    - `delegate_to_director`

### 3. 오케스트레이션 흐름 (Orchestration Flow)
1.  **API 요청**: `/api/generate/full-scene`
2.  **Router**: 입력 분석 -> `NEW_PROJECT` 판별.
3.  **Supervisor**:
    - Writer 호출 -> 대본 생성.
    - Artist 호출 -> 이미지 생성 (자가 수정 포함).
    - Director 호출 -> 영상 생성.

## 실행 및 검증 (Execution & Verification)

### 백엔드 실행
```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

### 테스트 방법
1.  프론트엔드(`npm run dev`)에서 새로운 프로젝트를 생성합니다.
2.  백엔드 로그를 확인합니다:
    - `📡 [Router] Intent detected: NEW_PROJECT`
    - `👨‍💼 [Supervisor] Starting NEW_PROJECT workflow...`
    - `👨‍💼 Supervisor: Delegating to Writer...`
    - `👨‍💼 Supervisor: Delegating to Artist...`
    - `👨‍💼 Supervisor: Delegating to Director...`
