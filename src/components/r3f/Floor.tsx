import { RigidBody } from '@react-three/rapier';

/**
 * 바닥 충돌 영역 컴포넌트
 * 
 * 참고: 현재 이 컴포넌트는 사용되지 않습니다.
 * 지형 자체가 충돌 영역을 가지고 있어 별도의 바닥이 필요하지 않습니다.
 */
export function Floor() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#5d8a68" />
      </mesh>
    </RigidBody>
  );
}
