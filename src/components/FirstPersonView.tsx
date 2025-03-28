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
  
  // ÃÂ«ÃÂ¬ÃÂ´ÃÂªÃÂ¸ÃÂ° ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ«ÃÂ¡ÃÂÃÂ«ÃÂÃÂ
  const { scene: weaponModel } = useGLTF("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  // ÃÂ«ÃÂ¬ÃÂ´ÃÂªÃÂ¸ÃÂ° ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ¬ÃÂÃÂ¤ÃÂ¬ÃÂ ÃÂ
  useEffect(() => {
    if (weaponModel) {
      // ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ¬ÃÂÃÂ¤ÃÂ¬ÃÂ ÃÂ
      weaponModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setModelLoaded(true);
      console.log("ÃÂ«ÃÂ¬ÃÂ´ÃÂªÃÂ¸ÃÂ° ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ«ÃÂ¡ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ«ÃÂ£ÃÂ");
    }
  }, [weaponModel]);
  
  // ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ­ÃÂÃÂ¨ÃÂªÃÂ³ÃÂ¼ÃÂ«ÃÂ¥ÃÂ¼ ÃÂ¬ÃÂÃÂÃÂ­ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ­ÃÂÃÂ
  const recoilRef = useRef({
    active: false,
    startTime: 0,
    duration: 100, // ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂ§ÃÂÃÂ¬ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂªÃÂ°ÃÂ (ms)
    basePositionRecoil: new Vector3(0, 0.05, 0.1),
    baseRotationRecoil: new Euler(-0.05, 0, 0),
    positionRecoil: new Vector3(0, 0, 0),
    rotationRecoil: new Euler(0, 0, 0),
    originalPosition: new Vector3(0.3, -0.3, -0.6),
    originalRotation: new Euler(0, Math.PI, 0),
  });
  
  // ÃÂ«ÃÂ°ÃÂÃÂ¬ÃÂÃÂ¬ ÃÂ¬ÃÂÃÂ´ÃÂ«ÃÂ²ÃÂ¤ÃÂ­ÃÂÃÂ¸ ÃÂ«ÃÂ¦ÃÂ¬ÃÂ¬ÃÂÃÂ¤ÃÂ«ÃÂÃÂ
  useEffect(() => {
    const handleShoot = () => {
      if (gameOver || !gameStarted) return;
      
      // ÃÂ«ÃÂÃÂÃÂ«ÃÂÃÂ¤ ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂªÃÂ³ÃÂÃÂ¬ÃÂÃÂ°
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
      
      // ÃÂªÃÂ³ÃÂÃÂ¬ÃÂÃÂ°ÃÂ«ÃÂÃÂ ÃÂ«ÃÂÃÂÃÂ«ÃÂÃÂ¤ ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂ ÃÂÃÂ¬ÃÂÃÂ©
      recoilRef.current.positionRecoil.copy(randomPos);
      recoilRef.current.rotationRecoil.copy(randomRot);
      
      // ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂ ÃÂ«ÃÂÃÂÃÂ«ÃÂ©ÃÂÃÂ¬ÃÂÃÂ´ÃÂ¬ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ¬ÃÂÃÂ
      recoilRef.current.active = true;
      recoilRef.current.startTime = performance.now();
    };
    
    window.addEventListener("shoot", handleShoot);
    
    return () => {
      window.removeEventListener("shoot", handleShoot);
    };
  }, [gameStarted, gameOver]);
  
  // ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂ ÃÂ«ÃÂÃÂÃÂ«ÃÂ©ÃÂÃÂ¬ÃÂÃÂ´ÃÂ¬ÃÂÃÂ ÃÂ¬ÃÂ²ÃÂÃÂ«ÃÂ¦ÃÂ¬
  useFrame(() => {
    if (!weaponRef.current || !modelLoaded || !gameStarted) return;
    
    // ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂ ÃÂ«ÃÂÃÂÃÂ«ÃÂ©ÃÂÃÂ¬ÃÂÃÂ´ÃÂ¬ÃÂÃÂ ÃÂ¬ÃÂ²ÃÂÃÂ«ÃÂ¦ÃÂ¬
    if (recoilRef.current.active) {
      const elapsed = performance.now() - recoilRef.current.startTime;
      const progress = Math.min(elapsed / recoilRef.current.duration, 1);
      
      if (progress < 1) {
        // ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂ ÃÂ«ÃÂÃÂÃÂ«ÃÂ©ÃÂÃÂ¬ÃÂÃÂ´ÃÂ¬ÃÂÃÂ (ÃÂ«ÃÂ¹ÃÂ ÃÂ«ÃÂ¥ÃÂ´ÃÂªÃÂ²ÃÂ ÃÂ¬ÃÂµÃÂÃÂ«ÃÂÃÂ ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂÃÂ¬ÃÂÃÂ¼ÃÂ«ÃÂ¡ÃÂ ÃÂ¬ÃÂÃÂ´ÃÂ«ÃÂÃÂ ÃÂ­ÃÂÃÂ ÃÂ¬ÃÂ²ÃÂÃÂ¬ÃÂ²ÃÂÃÂ­ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ«ÃÂ¦ÃÂ¬ÃÂ«ÃÂ¡ÃÂ)
        const recoilPhase = 0.3; // ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ«ÃÂÃÂ¨ÃÂªÃÂ³ÃÂ ÃÂ«ÃÂ¹ÃÂÃÂ¬ÃÂÃÂ¨
        
        if (progress < recoilPhase) {
          // ÃÂ«ÃÂ¹ÃÂ ÃÂ«ÃÂ¥ÃÂ´ÃÂªÃÂ²ÃÂ ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂ ÃÂÃÂ¬ÃÂÃÂ©
          const recoilProgress = progress / recoilPhase;
          const easedProgress = 1 - Math.pow(1 - recoilProgress, 2);
          
          // ÃÂ«ÃÂ¬ÃÂ´ÃÂªÃÂ¸ÃÂ° ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ÃÂ¬ÃÂÃÂ ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂ ÃÂÃÂ¬ÃÂÃÂ©
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
          // ÃÂ¬ÃÂ²ÃÂÃÂ¬ÃÂ²ÃÂÃÂ­ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ«ÃÂ¦ÃÂ¬ÃÂ«ÃÂ¡ÃÂ ÃÂ«ÃÂÃÂÃÂ¬ÃÂÃÂÃÂ¬ÃÂÃÂ´
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
        // ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂ ÃÂ«ÃÂÃÂÃÂ«ÃÂ©ÃÂÃÂ¬ÃÂÃÂ´ÃÂ¬ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ«ÃÂ£ÃÂ, ÃÂ¬ÃÂÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ¬ÃÂ¹ÃÂÃÂ«ÃÂ¡ÃÂ ÃÂ«ÃÂ³ÃÂµÃÂªÃÂ·ÃÂ
        weaponRef.current.position.copy(recoilRef.current.originalPosition);
        weaponRef.current.rotation.copy(recoilRef.current.originalRotation);
        recoilRef.current.active = false;
      }
    }
  });
  
  // ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ«ÃÂ¯ÃÂ¸ÃÂ«ÃÂ¦ÃÂ¬ ÃÂ«ÃÂ¡ÃÂÃÂ«ÃÂÃÂ
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
              scale={[0.03, 0.03, 0.03]} // ÃÂ«ÃÂ¬ÃÂ´ÃÂªÃÂ¸ÃÂ° ÃÂ­ÃÂÃÂ¬ÃÂªÃÂ¸ÃÂ° ÃÂ¬ÃÂ¦ÃÂÃÂªÃÂ°ÃÂ
            />
          )}
        </group>
      </mesh>
    </group>
  );
};

export default FirstPersonView;
