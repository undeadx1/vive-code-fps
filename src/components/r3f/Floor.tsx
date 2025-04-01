import { RigidBody } from '@react-three/rapier';

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
