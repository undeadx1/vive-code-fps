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
  
  // 무기 모델 로드
  const { scene: weaponModel } = useGLTF("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  const ammo = useGameStore((state) => state.ammo);
  const decreaseAmmo = useGameStore((state) => state.decreaseAmmo);
  const gameOver = useGameStore((state) => state.gameOver);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const { shoot } = useKeyboardControls();
  
  // 반동 효과를 위한 상태
  const recoilRef = useRef({
    active: false,
    startTime: 0,
    duration: 100, // 반동 지속 시간 (ms)
    basePositionRecoil: new Vector3(0, 0.05, 0.1),
    baseRotationRecoil: new Euler(-0.05, 0, 0),
    positionRecoil: new Vector3(0, 0, 0),
    rotationRecoil: new Euler(0, 0, 0),
    originalPosition: new Vector3(0.2, -0.2, -0.5),
    originalRotation: new Euler(0, Math.PI, 0),
  });
  
  useEffect(() => {
    if (weaponModel) {
      // 무기 모델 설정
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
    
    // 카메라 앞에 무기 위치시키기
    gunRef.current.position.set(
      camera.position.x,
      camera.position.y - 0.2,
      camera.position.z
    );
    
    // 카메라와 일치하도록 무기 회전
    gunRef.current.rotation.copy(camera.rotation);
    
    // 카메라 앞으로 위치 조정
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    gunRef.current.position.add(forward.multiplyScalar(0.5));
    
    // 오른쪽으로 약간 오프셋
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    gunRef.current.position.add(right.multiplyScalar(0.2));
    
    // 약간 아래로 오프셋
    gunRef.current.position.y -= 0.1;
    
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
          // 천천히 원래 자리로 돌아옴
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
        // 반동 애니메이션 완료, 원래 위치로 복귀
        weaponModel.position.copy(recoilRef.current.originalPosition);
        weaponModel.rotation.copy(recoilRef.current.originalRotation);
        recoilRef.current.active = false;
      }
    }
    
    // 발사 처리
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
    
    // 카메라에서 레이캐스터 설정
    raycaster.current.setFromCamera({ x: 0, y: 0 }, camera);
    
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
  
  // 무기 모델 미리 로드
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
