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
  
  // 무기 모델 로드
  const { scene: weaponModel } = useGLTF("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  // 무기 모델 설정
  useEffect(() => {
    if (weaponModel) {
      // 모델 설정
      weaponModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setModelLoaded(true);
      console.log("무기 모델 로드 완료");
    }
  }, [weaponModel]);
  
  // 반동 효과를 위한 상태
  const recoilRef = useRef({
    active: false,
    startTime: 0,
    duration: 100, // 반동 지속 시간 (ms)
    basePositionRecoil: new Vector3(0, 0.05, 0.1),
    baseRotationRecoil: new Euler(-0.05, 0, 0),
    positionRecoil: new Vector3(0, 0, 0),
    rotationRecoil: new Euler(0, 0, 0),
    originalPosition: new Vector3(0.3, -0.3, -0.6),
    originalRotation: new Euler(0, Math.PI, 0),
  });
  
  // 발사 이벤트 리스너
  useEffect(() => {
    const handleShoot = () => {
      if (gameOver || !gameStarted) return;
      
      // 랜덤 반동 계산
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
      
      // 계산된 랜덤 반동 적용
      recoilRef.current.positionRecoil.copy(randomPos);
      recoilRef.current.rotationRecoil.copy(randomRot);
      
      // 반동 애니메이션 시작
      recoilRef.current.active = true;
      recoilRef.current.startTime = performance.now();
    };
    
    window.addEventListener("shoot", handleShoot);
    
    return () => {
      window.removeEventListener("shoot", handleShoot);
    };
  }, [gameStarted, gameOver]);
  
  // 반동 애니메이션 처리
  useFrame(() => {
    if (!weaponRef.current || !modelLoaded || !gameStarted) return;
    
    // 반동 애니메이션 처리
    if (recoilRef.current.active) {
      const elapsed = performance.now() - recoilRef.current.startTime;
      const progress = Math.min(elapsed / recoilRef.current.duration, 1);
      
      if (progress < 1) {
        // 반동 애니메이션 (빠르게 최대 반동으로 이동 후 천천히 원래 자리로)
        const recoilPhase = 0.3; // 반동 단계 비율
        
        if (progress < recoilPhase) {
          // 빠르게 반동 적용
          const recoilProgress = progress / recoilPhase;
          const easedProgress = 1 - Math.pow(1 - recoilProgress, 2);
          
          // 무기 모델에 반동 적용
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
          // 천천히 원래 자리로 돌아옴
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
        // 반동 애니메이션 완료, 원래 위치로 복귀
        weaponRef.current.position.copy(recoilRef.current.originalPosition);
        weaponRef.current.rotation.copy(recoilRef.current.originalRotation);
        recoilRef.current.active = false;
      }
    }
  });
  
  // 모델 미리 로드
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
              scale={[0.03, 0.03, 0.03]} // 무기 크기 증가
            />
          )}
        </group>
      </mesh>
    </group>
  );
};

export default FirstPersonView;
