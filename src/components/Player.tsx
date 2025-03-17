import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { Vector3 } from "three";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { useGameStore } from "../stores/gameStore";

const SPEED = 5;
const RUN_SPEED = 8;
const JUMP_FORCE = 5;

const Player = ({ position = [0, 15, 0] }) => {
  const playerRef = useRef(null);
  const { camera } = useThree();
  const { moveForward, moveBackward, moveLeft, moveRight, jump, shoot, run } = useKeyboardControls();
  const health = useGameStore((state) => state.health);
  const decreaseHealth = useGameStore((state) => state.decreaseHealth);
  const gameOver = useGameStore((state) => state.gameOver);
  const setGameOver = useGameStore((state) => state.setGameOver);
  
  // Movement vector
  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());
  
  // ë°ë¥ ì¶©ë ê°ì§ ìí
  const isGrounded = useRef(false);
  const lastJumpTime = useRef(0);
  const jumpCooldown = 500; // 0.5ì´ ì¿¨ë¤ì´
  
  useEffect(() => {
    if (health <= 0 && !gameOver) {
      setGameOver(true);
    }
  }, [health, gameOver, setGameOver]);

  // ë°ì¬ ì²ë¦¬
  useEffect(() => {
    const handleShoot = () => {
      if (gameOver) return;
      
      // ë°ì¬ ë¡ì§ (ë°ë¯¸ì§ ê³ì°, ë ì´ìºì¤í ë±)
      // ì¬ê¸°ìë ë¨ìí ë°ì¬ ì´ë²¤í¸ë§ ì²ë¦¬
      
      // ë°ì¬ ì¬ì´ë ì¬ì ë±ì ë¡ì§ ì¶ê° ê°ë¥
    };
    
    window.addEventListener("shoot", handleShoot);
    
    return () => {
      window.removeEventListener("shoot", handleShoot);
    };
  }, [gameOver]);

  useFrame((state, delta) => {
    if (!playerRef.current || gameOver) return;
    
    const player = playerRef.current;
    
    // Get current velocity
    const currentVel = player.linvel();
    
    // ë°ë¥ ì¶©ë ê°ì§ (Yì¶ ìëê° ê±°ì 0ì´ë©´ ë°ë¥ì ìë¤ê³  íë¨)
    isGrounded.current = Math.abs(currentVel.y) < 0.1;
    
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
      
      // Apply speed (run or walk)
      const currentSpeed = run ? RUN_SPEED : SPEED;
      direction.current.multiplyScalar(currentSpeed);
    }
    
    // Set new velocity
    velocity.current.set(
      direction.current.x,
      currentVel.y, // Keep current Y velocity (for gravity/jumping)
      direction.current.z
    );
    
    // Apply velocity
    player.setLinvel(velocity.current);
    
    // Handle jumping with cooldown
    const now = Date.now();
    if (jump && isGrounded.current && now - lastJumpTime.current > jumpCooldown) {
      player.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 });
      lastJumpTime.current = now;
      isGrounded.current = false;
    }
    
    // Update camera position to follow player
    const playerPosition = player.translation();
    camera.position.x = playerPosition.x;
    camera.position.y = playerPosition.y + 1.6; // Eye height
    camera.position.z = playerPosition.z;
    
    // ë°ë¥ ìëë¡ ë¨ì´ì§ë ê² ë°©ì§ (ìì ì¥ì¹)
    if (playerPosition.y < -10) {
      player.setTranslation({ x: 0, y: 15, z: 0 });
      player.setLinvel({ x: 0, y: 0, z: 0 });
    }
  });

  return (
    <RigidBody
      ref={playerRef}
      position={position}
      enabledRotations={[false, false, false]}
      type="dynamic"
      colliders={false}
      linearDamping={0.5}
      friction={0.7}
      restitution={0}
      gravityScale={1}
      lockRotations
      mass={80} // íë ì´ì´ ì§ë ì¤ì 
      ccd={true} // ì°ì ì¶©ë ê°ì§ íì±í
    >
      <CapsuleCollider args={[0.5, 0.5]} position={[0, 1, 0]} />
    </RigidBody>
  );
};

export default Player;
