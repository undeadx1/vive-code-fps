import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3, Euler } from 'three';
import { useGameStore } from '../stores/gameStore';

const FirstPersonView = () => {
  const weaponRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameOver = useGameStore((state) => state.gameOver);
  
  // ë¬´ê¸° ëª¨ë¸ ë¡ë
  const { scene: weaponModel } = useGLTF("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  // ë¬´ê¸° ëª¨ë¸ ì¤ì 
  useEffect(() => {
    if (weaponModel) {
      // ëª¨ë¸ ì¤ì 
      weaponModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setModelLoaded(true);
      console.log("ë¬´ê¸° ëª¨ë¸ ë¡ë ìë£");
    }
  }, [weaponModel]);
  
  // ë°ë í¨ê³¼ë¥¼ ìí ìí
  const recoilRef = useRef({
    active: false,
    startTime: 0,
    duration: 100, // ë°ë ì§ì ìê° (ms)
    basePositionRecoil: new Vector3(0, 0.05, 0.1),
    baseRotationRecoil: new Euler(-0.05, 0, 0),
    positionRecoil: new Vector3(0, 0, 0),
    rotationRecoil: new Euler(0, 0, 0),
    originalPosition: new Vector3(0.3, -0.3, -0.6),
    originalRotation: new Euler(0, Math.PI, 0),
  });
  
  // ë°ì¬ ì´ë²¤í¸ ë¦¬ì¤ë
  useEffect(() => {
    const handleShoot = () => {
      if (gameOver || !gameStarted) return;
      
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
    
    window.addEventListener("shoot", handleShoot);
    
    return () => {
      window.removeEventListener("shoot", handleShoot);
    };
  }, [gameStarted, gameOver]);
  
  // ë°ë ì ëë©ì´ì ì²ë¦¬
  useFrame(() => {
    if (!weaponRef.current || !modelLoaded || !gameStarted) return;
    
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
          weaponRef.current.position.set(
            recoilRef.current.originalPosition.x + recoilRef.current.positionRecoil.x * easedProgress,
            recoilRef.current.originalPosition.y + recoilRef.current.positionRecoil.y * easedProgress,
            recoilRef.current.originalPosition.z + recoilRef.current.positionRecoil.z * easedProgress
          );
          
          weaponRef.current.rotation.set(
            recoilRef.current.originalRotation.x + recoilRef.current.rotationRecoil.x * easedProgress,
            recoilRef.current.originalRotation.y + recoilRef.current.rotationRecoil.y * easedProgress,
            recoilRef.current.originalRotation.z + recoilRef.current.rotationRecoil.z * easedProgress
          );
        } else {
          // ì²ì²í ìë ìë¦¬ë¡ ëìì´
          const recoveryProgress = (progress - recoilPhase) / (1 - recoilPhase);
          const easedRecovery = Math.pow(recoveryProgress, 0.5);
          
          weaponRef.current.position.set(
            recoilRef.current.originalPosition.x + recoilRef.current.positionRecoil.x * (1 - easedRecovery),
            recoilRef.current.originalPosition.y + recoilRef.current.positionRecoil.y * (1 - easedRecovery),
            recoilRef.current.originalPosition.z + recoilRef.current.positionRecoil.z * (1 - easedRecovery)
          );
          
          weaponRef.current.rotation.set(
            recoilRef.current.originalRotation.x + recoilRef.current.rotationRecoil.x * (1 - easedRecovery),
            recoilRef.current.originalRotation.y + recoilRef.current.rotationRecoil.y * (1 - easedRecovery),
            recoilRef.current.originalRotation.z + recoilRef.current.rotationRecoil.z * (1 - easedRecovery)
          );
        }
      } else {
        // ë°ë ì ëë©ì´ì ìë£, ìë ìì¹ë¡ ë³µê·
        weaponRef.current.position.copy(recoilRef.current.originalPosition);
        weaponRef.current.rotation.copy(recoilRef.current.originalRotation);
        recoilRef.current.active = false;
      }
    }
  });
  
  // ëª¨ë¸ ë¯¸ë¦¬ ë¡ë
  useGLTF.preload("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  return (
    <group>
      <mesh>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={1} />
        
        <group 
          ref={weaponRef} 
          position={[0.3, -0.3, -0.6]} 
          rotation={[0, Math.PI, 0]}
        >
          {modelLoaded && (
            <primitive 
              object={weaponModel.clone()} 
              scale={[0.03, 0.03, 0.03]} // ë¬´ê¸° í¬ê¸° ì¦ê°
            />
          )}
        </group>
      </mesh>
    </group>
  );
};

export default FirstPersonView;
