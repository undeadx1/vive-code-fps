import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DirectionalLight, DirectionalLightHelper, Group } from 'three';

export function Lights() {
  const directionalLightRef = useRef<DirectionalLight>(null);
  const lightGroupRef = useRef<Group>(null);

  // 디버그 모드 설정
  const debug = false;

  // 빛 설정
  const lightIntensity = 1.5;
  const lightColor = 0xffffeb;
  const lightPosition = [50, 50, 25];
  const shadowMapSize = 4096;
  const shadowCameraSize = 100;

  // 빛 애니메이션
  useFrame(() => {
    if (directionalLightRef.current && lightGroupRef.current) {
      // 여기에 빛 애니메이션 로직 추가 가능
    }
  });

  return (
    <group ref={lightGroupRef}>
      {/* 주변광 */}
      <ambientLight intensity={0.5} color={0xaec6cf} />

      {/* 주 방향성 빛 */}
      <directionalLight
        ref={directionalLightRef}
        name="followLight" // vibe-starter-3d에서 사용하는 메인 라이트 이름
        position={lightPosition}
        intensity={lightIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-shadowCameraSize}
        shadow-camera-right={shadowCameraSize}
        shadow-camera-top={shadowCameraSize}
        shadow-camera-bottom={-shadowCameraSize}
        shadow-camera-near={0.1}
        shadow-camera-far={500}
        shadow-bias={-0.0001}
      >
        {/* 디버그 모드일 때만 라이트 헬퍼 표시 */}
        {debug && <directionalLightHelper args={[directionalLightRef.current as DirectionalLight, 5]} />}
      </directionalLight>

      {/* 보조 방향성 빛 (반대 방향에서 약한 빛) */}
      <directionalLight
        position={[-30, 20, -30]}
        intensity={0.3}
        color={0x8fbcd4}
      />
    </group>
  );
}
