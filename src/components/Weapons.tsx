import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../stores/gameStore";
import { Vector3, Raycaster, Group, Euler } from "three";
import { useKeyboardControls } from "../hooks/useKeyboardControls";

const Weapons = () => {
  const { camera } = useThree();
  const gunRef = useRef();
  const raycaster = useRef(new Raycaster());
  const mouseDown = useRef(false);
  const lastShot = useRef(0);
  const FIRE_RATE = 200; // ms between shots
  const [weaponLoaded, setWeaponLoaded] = useState(false);
  
  // ë¬´ê¸° ëª¨ë¸ ë¡ë
  const { scene: weaponModel } = useGLTF("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  const ammo = useGameStore((state) => state.ammo);
  const decreaseAmmo = useGameStore((state) => state.decreaseAmmo);
  const gameOver = useGameStore((state) => state.gameOver);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const { shoot } = useKeyboardControls();
  
  // ë°ë í¨ê³¼ë¥¼ ìí ìí
  const recoilRef = useRef({
    active: false,
    startTime: 0,
    duration: 100, // ë°ë ì§ì ìê° (ms)
    basePositionRecoil: new Vector3(0, 0.05, 0.1),
    baseRotationRecoil: new Euler(-0.05, 0, 0),
    positionRecoil: new Vector3(0, 0, 0),
    rotationRecoil: new Euler(0, 0, 0),
    originalPosition: new Vector3(0.2, -0.2, -0.5),
    originalRotation: new Euler(0, Math.PI, 0),
  });
  
  useEffect(() => {
    if (weaponModel) {
      // ë¬´ê¸° ëª¨ë¸ ì¤ì 
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
  
  useFrame((state, delta) => {
    if (!gunRef.current || !weaponLoaded) return;
    
    // ì¹´ë©ë¼ ìì ë¬´ê¸° ìì¹ìí¤ê¸°
    gunRef.current.position.set(
      camera.position.x,
      camera.position.y - 0.2,
      camera.position.z
    );
    
    // ì¹´ë©ë¼ì ì¼ì¹íëë¡ ë¬´ê¸° íì 
    gunRef.current.rotation.copy(camera.rotation);
    
    // ì¹´ë©ë¼ ìì¼ë¡ ìì¹ ì¡°ì 
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    gunRef.current.position.add(forward.multiplyScalar(0.5));
    
    // ì¤ë¥¸ìª½ì¼ë¡ ì½ê° ì¤íì
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    gunRef.current.position.add(right.multiplyScalar(0.2));
    
    // ì½ê° ìëë¡ ì¤íì
    gunRef.current.position.y -= 0.1;
    
    // ë°ë ì ëë©ì´ì ì²ë¦¬
    if (recoilRef.current.active) {
      const elapsed = performance.now() - recoilRef.current.startTime;
      const progress = Math.min(elapsed / recoilRef.current.duration, 1);
      
      if (progress < 1) {
        // ë°ë ì ëë©ì´ì (ë¹ ë¥´ê² ìµë ë°ëì¼ë¡ ì´ë í ì²ì²í ìë ìë¦¬ë¡)
        const recoilPhase = 0.3; // ë°ë ë¨ê³ ë¹ì¨
        
        if (progress < recoilPhase) {
          // ë¹ ë¥´ê² ë°ë ì ì©
          const recoilProgress = progress / recoilPhase;
          const easedProgress = 1 - Math.pow(1 - recoilProgress, 2);
          
          // ë¬´ê¸° ëª¨ë¸ì ë°ë ì ì©
          weaponModel.position.set(
            recoilRef.current.originalPosition.x + recoilRef.current.positionRecoil.x * easedProgress,
            recoilRef.current.originalPosition.y + recoilRef.current.positionRecoil.y * easedProgress,
            recoilRef.current.originalPosition.z + recoilRef.current.positionRecoil.z * easedProgress
          );
          
          weaponModel.rotation.set(
            recoilRef.current.originalRotation.x + recoilRef.current.rotationRecoil.x * easedProgress,
            recoilRef.current.originalRotation.y + recoilRef.current.rotationRecoil.y * easedProgress,
            recoilRef.current.originalRotation.z + recoilRef.current.rotationRecoil.z * easedProgress
          );
        } else {
          // ì²ì²í ìë ìë¦¬ë¡ ëìì´
          const recoveryProgress = (progress - recoilPhase) / (1 - recoilPhase);
          const easedRecovery = Math.pow(recoveryProgress, 0.5);
          
          weaponModel.position.set(
            recoilRef.current.originalPosition.x + recoilRef.current.positionRecoil.x * (1 - easedRecovery),
            recoilRef.current.originalPosition.y + recoilRef.current.positionRecoil.y * (1 - easedRecovery),
            recoilRef.current.originalPosition.z + recoilRef.current.positionRecoil.z * (1 - easedRecovery)
          );
          
          weaponModel.rotation.set(
            recoilRef.current.originalRotation.x + recoilRef.current.rotationRecoil.x * (1 - easedRecovery),
            recoilRef.current.originalRotation.y + recoilRef.current.rotationRecoil.y * (1 - easedRecovery),
            recoilRef.current.originalRotation.z + recoilRef.current.rotationRecoil.z * (1 - easedRecovery)
          );
        }
      } else {
        // ë°ë ì ëë©ì´ì ìë£, ìë ìì¹ë¡ ë³µê·
        weaponModel.position.copy(recoilRef.current.originalPosition);
        weaponModel.rotation.copy(recoilRef.current.originalRotation);
        recoilRef.current.active = false;
      }
    }
    
    // ë°ì¬ ì²ë¦¬
    if ((mouseDown.current || shoot) && !gameOver && gameStarted && ammo > 0) {
      const now = Date.now();
      if (now - lastShot.current > FIRE_RATE) {
        handleShoot();
        lastShot.current = now;
      }
    }
  });
  
  const handleShoot = () => {
    if (ammo <= 0) return;
    
    decreaseAmmo(1);
    
    // ì¹´ë©ë¼ìì ë ì´ìºì¤í° ì¤ì 
    raycaster.current.setFromCamera({ x: 0, y: 0 }, camera);
    
    // ëë¤ ë°ë ê³ì°
    const randomRange = 0.01;
    const randomPos = new Vector3(
      recoilRef.current.basePositionRecoil.x + (Math.random() * 2 - 1) * randomRange,
      recoilRef.current.basePositionRecoil.y + (Math.random() * 2 - 1) * randomRange,
      recoilRef.current.basePositionRecoil.z + (Math.random() * 2 - 1) * randomRange
    );
    
    const randomRot = new Euler(
      recoilRef.current.baseRotationRecoil.x + (Math.random() * 2 - 1) * randomRange,
      recoilRef.current.baseRotationRecoil.y + (Math.random() * 2 - 1) * randomRange,
      recoilRef.current.baseRotationRecoil.z + (Math.random() * 2 - 1) * randomRange
    );
    
    // ê³ì°ë ëë¤ ë°ë ì ì©
    recoilRef.current.positionRecoil.copy(randomPos);
    recoilRef.current.rotationRecoil.copy(randomRot);
    
    // ë°ë ì ëë©ì´ì ìì
    recoilRef.current.active = true;
    recoilRef.current.startTime = performance.now();
  };
  
  // ë¬´ê¸° ëª¨ë¸ ë¯¸ë¦¬ ë¡ë
  useGLTF.preload("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  return (
    <group ref={gunRef}>
      {weaponLoaded && (
        <primitive 
          object={weaponModel.clone()} 
          scale={[0.01, 0.01, 0.01]}
          position={[0.2, -0.2, -0.5]}
          rotation={[0, Math.PI, 0]}
        />
      )}
    </group>
  );
};

export default Weapons;
