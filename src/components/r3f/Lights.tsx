import { useRef } from 'react';
import { DirectionalLight } from 'three';
import { useHelper } from '@react-three/drei';

/**
 * 게임 조명 컴포넌트
 */
export function Lights() {
  const directionalLightRef = useRef<DirectionalLight>(null);
  
  // 개발 모드에서만 조명 헬퍼 표시
  // useHelper(directionalLightRef, DirectionalLightHelper, 1, 'red');

  return (
    <>
      {/* 환경 전체를 밝게 하는 주변광 */}
      <ambientLight intensity={0.5} />
      
      {/* 그림자를 생성하는 방향성 조명 */}
      <directionalLight
        ref={directionalLightRef}
        castShadow
        position={[10, 10, 5]}
        intensity={1.5}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        name="followLight" // vibe-starter-3d에서 사용하는 메인 라이트 이름
      />
    </>
  );
}
