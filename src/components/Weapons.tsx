import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../stores/gameStore";
import { Vector3, Raycaster, Group } from "three";

const Weapons = () => {
  const { camera } = useThree();
  const gunRef = useRef<Group>();
  const raycaster = useRef(new Raycaster());
  const mouseDown = useRef(false);
  const lastShot = useRef(0);
  const FIRE_RATE = 200; // ms between shots
  const [weaponLoaded, setWeaponLoaded] = useState(false);
  
  const { scene: weaponModel } = useGLTF("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  const ammo = useGameStore((state) => state.ammo);
  const decreaseAmmo = useGameStore((state) => state.decreaseAmmo);
  const gameOver = useGameStore((state) => state.gameOver);
  const gameStarted = useGameStore((state) => state.gameStarted);
  
  useEffect(() => {
    if (weaponModel) {
      // Configure weapon model
      weaponModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });
      setWeaponLoaded(true);
    }
  }, [weaponModel]);
  
  useEffect(() => {
    const handleMouseDown = () => {
      mouseDown.current = true;
    };
    
    const handleMouseUp = () => {
      mouseDown.current = false;
    };
    
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  
  useFrame((state) => {
    if (!gunRef.current || !weaponLoaded) return;
    
    // Position gun in front of camera
    gunRef.current.position.set(
      camera.position.x,
      camera.position.y - 0.2,
      camera.position.z
    );
    
    // Rotate gun to match camera
    gunRef.current.rotation.copy(camera.rotation);
    
    // Adjust position to be in front of camera
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    gunRef.current.position.add(forward.multiplyScalar(0.5));
    
    // Offset to the right side
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    gunRef.current.position.add(right.multiplyScalar(0.2));
    
    // Offset down a bit
    gunRef.current.position.y -= 0.1;
    
    // Handle shooting
    if (mouseDown.current && !gameOver && gameStarted && ammo > 0) {
      const now = Date.now();
      if (now - lastShot.current > FIRE_RATE) {
        shoot();
        lastShot.current = now;
      }
    }
  });
  
  const shoot = () => {
    if (ammo <= 0) return;
    
    decreaseAmmo(1);
    
    // Set up raycaster from camera
    raycaster.current.setFromCamera({ x: 0, y: 0 }, camera);
    
    // Play shooting animation or effect here
  };
  
  // Preload weapon model
  useGLTF.preload("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  return (
    <group ref={gunRef}>
      {weaponLoaded && (
        <primitive 
          object={weaponModel.clone()} 
          scale={[0.01, 0.01, 0.01]}
          position={[0.2, -0.2, 0]}
          rotation={[0, Math.PI, 0]}
        />
      )}
    </group>
  );
};

export default Weapons;
