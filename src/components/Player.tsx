import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { Vector3 } from "three";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { useGameStore } from "../stores/gameStore";

const SPEED = 5;
const JUMP_FORCE = 5;

const Player = ({ position = [0, 3, 0] }) => {  // 시작 위치를 y=3으로 높임
  const playerRef = useRef(null);
  const { camera } = useThree();
  const { moveForward, moveBackward, moveLeft, moveRight, jump, shoot } = useKeyboardControls();
  const health = useGameStore((state) => state.health);
  const decreaseHealth = useGameStore((state) => state.decreaseHealth);
  const gameOver = useGameStore((state) => state.gameOver);
  const setGameOver = useGameStore((state) => state.setGameOver);
  
  // Movement vector
  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());
  
  useEffect(() => {
    if (health <= 0 && !gameOver) {
      setGameOver(true);
    }
  }, [health, gameOver, setGameOver]);

  useFrame((state, delta) => {
    if (!playerRef.current || gameOver) return;
    
    const player = playerRef.current;
    
    // Get current velocity
    const currentVel = player.linvel();
    
    // Reset direction
    direction.current.set(0, 0, 0);
    
    // Set direction based on camera orientation
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();
    
    // Apply movement based on keys
    if (moveForward) direction.current.add(forward);
    if (moveBackward) direction.current.sub(forward);
    if (moveRight) direction.current.add(right);
    if (moveLeft) direction.current.sub(right);
    
    // Normalize direction if moving
    if (direction.current.lengthSq() > 0) {
      direction.current.normalize();
      direction.current.multiplyScalar(SPEED);
    }
    
    // Set new velocity
    velocity.current.set(
      direction.current.x,
      currentVel.y, // Keep current Y velocity (for gravity/jumping)
      direction.current.z
    );
    
    // Apply velocity
    player.setLinvel(velocity.current);
    
    // Handle jumping
    if (jump && Math.abs(currentVel.y) < 0.1) {
      player.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 });
    }
    
    // Update camera position to follow player
    const playerPosition = player.translation();
    camera.position.x = playerPosition.x;
    camera.position.y = playerPosition.y + 1.6; // Eye height
    camera.position.z = playerPosition.z;
  });

  return (
    <RigidBody
      ref={playerRef}
      position={position}
      enabledRotations={[false, false, false]}
      type="dynamic"
      colliders={false}
      linearDamping={0.5}
    >
      <CapsuleCollider args={[0.5, 0.5]} />
    </RigidBody>
  );
};

export default Player;
