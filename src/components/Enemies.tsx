import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { Vector3 } from "three";
import { useGameStore } from "../stores/gameStore";

const ENEMY_SPEED = 2;
const SPAWN_INTERVAL = 5000; // 5 seconds
const MAX_ENEMIES = 10;

const Enemy = ({ position, onHit }) => {
  const enemyRef = useRef(null);
  const { camera } = useThree();
  const health = useRef(100);
  const [isActive, setIsActive] = useState(true);
  const score = useGameStore((state) => state.score);
  const increaseScore = useGameStore((state) => state.increaseScore);
  
  useFrame(() => {
    if (!enemyRef.current || !isActive) return;
    
    const enemy = enemyRef.current;
    const enemyPosition = enemy.translation();
    
    // Get direction to player (camera)
    const direction = new Vector3(
      camera.position.x - enemyPosition.x,
      0,
      camera.position.z - enemyPosition.z
    ).normalize().multiplyScalar(ENEMY_SPEED);
    
    // Move towards player
    enemy.setLinvel({ x: direction.x, y: 0, z: direction.z });
    
    // Check distance to player
    const distanceToPlayer = new Vector3(
      camera.position.x - enemyPosition.x,
      camera.position.y - enemyPosition.y,
      camera.position.z - enemyPosition.z
    ).length();
    
    // If enemy is close to player, attack
    if (distanceToPlayer < 2) {
      onHit();
    }
  });
  
  const handleShot = () => {
    health.current -= 25;
    if (health.current <= 0 && isActive) {
      setIsActive(false);
      increaseScore(100);
      // Remove enemy after a delay
      setTimeout(() => {
        if (enemyRef.current) {
          enemyRef.current.setTranslation({ x: 1000, y: 1000, z: 1000 });
        }
      }, 1000);
    }
  };
  
  useEffect(() => {
    // Add enemy to global registry for shooting detection
    window.enemies = window.enemies || [];
    window.enemies.push({ ref: enemyRef, handleShot });
    
    return () => {
      // Remove enemy from registry on unmount
      window.enemies = window.enemies.filter(e => e.ref !== enemyRef);
    };
  }, []);
  
  return (
    <RigidBody
      ref={enemyRef}
      position={position}
      enabledRotations={[false, false, false]}
      type="dynamic"
      colliders={false}
      linearDamping={0.5}
    >
      <CapsuleCollider args={[0.5, 0.5]} />
      <group>
        {/* Enemy body */}
        <mesh castShadow position={[0, 1, 0]}>
          <capsuleGeometry args={[0.5, 1, 8, 16]} />
          <meshStandardMaterial color={isActive ? "red" : "darkgray"} />
        </mesh>
        {/* Enemy head */}
        <mesh castShadow position={[0, 2, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color={isActive ? "darkred" : "darkgray"} />
        </mesh>
        {/* Enemy eyes */}
        <mesh position={[0.2, 2.1, 0.3]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={isActive ? "yellow" : "black"} />
        </mesh>
        <mesh position={[-0.2, 2.1, 0.3]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={isActive ? "yellow" : "black"} />
        </mesh>
      </group>
    </RigidBody>
  );
};

const Enemies = () => {
  const [enemies, setEnemies] = useState([]);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameOver = useGameStore((state) => state.gameOver);
  const decreaseHealth = useGameStore((state) => state.decreaseHealth);
  
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const spawnEnemy = () => {
      if (enemies.length < MAX_ENEMIES) {
        // Spawn at random position around the player
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 10;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        setEnemies(prev => [
          ...prev,
          {
            id: Date.now(),
            position: [x, 1, z]
          }
        ]);
      }
    };
    
    // Spawn first enemy immediately
    spawnEnemy();
    
    // Spawn enemies at interval
    const interval = setInterval(spawnEnemy, SPAWN_INTERVAL);
    
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, enemies.length]);
  
  const handleEnemyHit = () => {
    decreaseHealth(10);
  };
  
  return (
    <group>
      {enemies.map(enemy => (
        <Enemy 
          key={enemy.id} 
          position={enemy.position} 
          onHit={handleEnemyHit}
        />
      ))}
    </group>
  );
};

export default Enemies;
