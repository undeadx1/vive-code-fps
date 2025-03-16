import { RigidBody } from "@react-three/rapier";

const Level = () => {
  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#4a6741" />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[-25, 2, 0]}>
          <boxGeometry args={[1, 5, 50]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[25, 2, 0]}>
          <boxGeometry args={[1, 5, 50]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[0, 2, -25]}>
          <boxGeometry args={[50, 5, 1]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[0, 2, 25]}>
          <boxGeometry args={[50, 5, 1]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </RigidBody>

      {/* Obstacles */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[-10, 1, -5]}>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[10, 1, 5]}>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[0, 0.5, -15]}>
          <boxGeometry args={[8, 1, 3]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[-15, 0.5, 10]}>
          <boxGeometry args={[3, 1, 8]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[15, 1.5, -10]}>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </RigidBody>
    </group>
  );
};

export default Level;
