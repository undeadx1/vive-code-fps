# 3D 오픈월드 어드벤처 게임

## Project Summary
이 프로젝트는 3D 오픈월드 어드벤처 게임으로, 플레이어가 자유롭게 탐험할 수 있는 환경을 제공합니다. 지형 시스템, 캐릭터 컨트롤러, 환경 오브젝트, 풀 시스템 등을 포함하고 있습니다.

## Implementation Strategy
이 게임은 **3D Three.js 기반 접근 방식**을 사용합니다:
- React Three Fiber와 react-three-fiber를 활용한 3D 렌더링
- vibe-starter-3d의 FreeViewController를 사용한 캐릭터 및 카메라 제어
- 절차적 지형 생성 시스템으로 다양한 지형 구현
- 셰이더 기반 풀 시스템으로 자연스러운 환경 구현
- 환경 오브젝트(나무, 바위, 덤불)를 지형에 맞게 배치

주요 기술:
- Three.js를 통한 3D 렌더링
- React Three Fiber를 활용한 선언적 3D 구현
- Rapier 물리 엔진을 통한 충돌 감지 및 물리 시뮬레이션
- vibe-starter-3d의 캐릭터 렌더링 및 애니메이션 시스템
- GLSL 셰이더를 활용한 고성능 풀 렌더링

## Implemented Features
- 기본 지형 생성 시스템: 언덕과 계곡이 있는 지형 생성
- 셰이더 기반 풀 시스템: 바람에 흔들리는 자연스러운 풀 구현
- 캐릭터 컨트롤러: 이동, 달리기, 점프 등의 기본 동작
- 환경 오브젝트: 나무, 바위, 덤불 등의 환경 요소
- 애니메이션 시스템: 캐릭터의 다양한 상태에 따른 애니메이션
- 기본 UI: 조작 방법 안내

## File Structure Overview

### src/main.tsx
- 애플리케이션의 진입점
- React 렌더링 설정

### src/App.tsx
- 메인 애플리케이션 컴포넌트
- R3F와 UI 컴포넌트 구성

### src/assets.json
- 게임에서 사용하는 모든 에셋 정보
- 캐릭터, 애니메이션, 환경 오브젝트, 셰이더 등의 URL 관리

### src/components/R3F.tsx
- React Three Fiber 캔버스 설정
- 3D 렌더링 환경 구성

### src/components/UI.tsx
- 게임 UI 컴포넌트
- 조작 방법 안내 및 게임 정보 표시

### src/components/r3f/Experience.tsx
- 게임의 주요 경험 컴포넌트
- 물리 엔진, 지형, 플레이어, 환경, 풀 시스템 등을 조합

### src/components/r3f/GameScene.tsx
- 게임 씬 컴포넌트
- 3D 환경 설정 및 Experience 컴포넌트 포함

### src/components/r3f/Lights.tsx
- 게임 조명 시스템
- 주변광 및 방향성 조명 설정

### src/components/r3f/Player.tsx
- 플레이어 캐릭터 컴포넌트
- 캐릭터 상태 관리 및 애니메이션 처리

### src/components/r3f/terrain/Terrain.tsx
- 지형 생성 시스템
- 높이맵 기반 지형 생성 및 물리 충돌 설정
- 텍스처 및 노말맵 적용

### src/components/r3f/terrain/Grass.tsx
- 셰이더 기반 풀 렌더링 시스템
- 인스턴스 기반 고성능 풀 렌더링
- 바람에 흔들리는 애니메이션 효과

### src/components/r3f/terrain/TerrainUtils.ts
- 지형 관련 유틸리티 함수
- 지형 높이에 기반한 오브젝트 위치 계산

### src/components/r3f/environment/Environment.tsx
- 게임 환경 설정
- 스카이박스 및 환경 오브젝트 관리

### src/components/r3f/environment/EnvironmentObject.tsx
- 개별 환경 오브젝트 컴포넌트
- 지형에 맞춰 오브젝트 배치

### src/constants/character.ts
- 캐릭터 상태 열거형 정의
- 캐릭터 관련 상수 관리

### src/constants/controls.ts
- 키보드 컨트롤 매핑 설정
- 게임 조작 관련 상수 관리
