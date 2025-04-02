import { RigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import { Mesh } from 'three';

/**
 * 기본 바닥 컴포넌트
 * 
 * 참고: 이 컴포넌트는 지형 시스템이 구현되면 사용되지 않습니다.
 */
export function Floor() {
  const floorRef = useRef<Mesh>(null);

  return (
    <RigidBody type="fixed" colliders="cuboid" friction={2}>
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#5d8a68" />
      </mesh>
    </RigidBody>
  );
}
