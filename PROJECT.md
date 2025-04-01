# 3D 지형 탐험 프로젝트

## Project Summary
이 프로젝트는 아름다운 3D 지형을 생성하고 기사 캐릭터로 탐험할 수 있는 환경을 제공합니다. 높이맵 기반의 자연스러운 지형과 풀, 바위 등의 요소를 포함하여 사실적인 자연 환경을 구현했습니다.

## Implementation Strategy
이 게임은 **3D Three.js 기반 접근 방식**을 사용합니다:
- React Three Fiber를 사용하여 3D 렌더링 구현
- 높이맵 기반 지형 생성 시스템 적용
- Simplex 노이즈를 활용한 자연스러운 지형 생성
- GLSL 셰이더를 활용한 풀 렌더링
- vibe-starter-3d의 FreeViewController를 활용한 캐릭터 및 카메라 제어
- 기사 캐릭터 모델과 애니메이션 통합

## Implemented Features
- 높이맵 기반 지형 생성 시스템
- 시드 값 기반의 재현 가능한 랜덤 지형
- 물리 충돌 영역 자동 생성
- 셰이더 기반 풀 렌더링 시스템
- 기사 캐릭터 모델 및 애니메이션 통합
- 지형 위에 캐릭터 배치 및 이동
- HDR 스카이박스를 통한 환경 조명
- 사용자 정의 캐릭터 이동 속도 (빠른 걷기 및 달리기)

## File Structure Overview

### src/components/r3f/Terrain.tsx
- 높이맵 기반 지형 생성 컴포넌트
- Simplex 노이즈를 사용한 자연스러운 지형 생성
- 물리 충돌 영역 자동 생성

### src/components/r3f/Grass.tsx
- 셰이더 기반 풀 렌더링 시스템
- 지형 높이에 맞춰 풀 배치
- 바람에 흔들리는 효과 구현

### src/components/r3f/Experience.tsx
- 메인 게임 씬 구성
- 지형, 풀, 캐릭터 등 요소 통합
- 물리 시스템 및 컨트롤러 설정
- 캐릭터 이동 속도 설정

### src/components/r3f/Player.tsx
- 기사 캐릭터 컴포넌트
- 애니메이션 상태 관리 및 전환 로직
- 사용자 입력에 따른 캐릭터 상태 변경

### src/components/r3f/Skybox.tsx
- HDR 스카이박스 구현
- 환경 조명 설정

### src/components/r3f/Floor.tsx
- 지형 아래 바닥 충돌 영역 컴포넌트 (현재 사용되지 않음)
- 참고용으로 유지됨

### src/constants/terrain.ts
- 지형 생성 관련 상수 정의
- 지형 설정 값 관리
- 풀 렌더링 설정 관리
- 플레이어 이동 속도 설정

### src/assets.json
- 게임에서 사용하는 리소스 관리
- 기사 캐릭터 모델 및 애니메이션 경로 저장
- 텍스처, 셰이더 등 외부 리소스 경로 저장
