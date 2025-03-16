import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Vector3, Euler, Group } from 'three';
import { SkeletonUtils } from 'three/examples/jsm/Addons.js';
import { useGameStore } from '../stores/gameStore';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import ShootingSystem from '../systems/ShootingSystem';
import MuzzleFlash from '../effects/MuzzleFlash';
import BulletTrail from '../effects/BulletTrail';
import ImpactEffect from '../effects/ImpactEffect';

const WeaponView = () => {
  const weaponRef = useRef(null);
  const muzzlePointRef = useRef(null);
  const { camera } = useThree();
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameOver = useGameStore((state) => state.gameOver);
  const decreaseAmmo = useGameStore((state) => state.decreaseAmmo);
  const ammo = useGameStore((state) => state.ammo);
  const { shoot } = useKeyboardControls();
  
  // 슈팅 시스템 초기화
  const shootingSystem = useRef(new ShootingSystem());
  
  // 이펙트 상태
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const [bulletTrails, setBulletTrails] = useState([]);
  const [impactEffects, setImpactEffects] = useState([]);
  
  // 연사 관련 상태
  const [isFiring, setIsFiring] = useState(false);
  const fireRateRef = useRef(150); // 연사 속도 (ms)
  const lastFireTimeRef = useRef(0);
  const fireIntervalRef = useRef(null);
  
  // 발사 이벤트 처리 중인지 추적하는 플래그
  const isHandlingShootEventRef = useRef(false);
  
  // 3D 모델 로드
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  // 100도를 라디안으로 변환 (Three.js는 라디안 단위 사용)
  const yRotation = 100 * (Math.PI / 180);
  
  // 반동 효과를 위한 상태
  const recoilRef = useRef({
    active: false,
    startTime: 0,
    duration: 100, // 반동 지속 시간 (ms)
    basePositionRecoil: new Vector3(0, 0.05, 0.1),
    baseRotationRecoil: new Euler(-0.05, 0, 0),
    positionRecoil: new Vector3(0, 0, 0),
    rotationRecoil: new Euler(0, 0, 0),
    // 무기는 원래 위치로 되돌리고 이펙트는 현재 위치 유지
    originalPosition: new Vector3(0.1, -0.2, -0.5), // 무기 위치 유지
    originalRotation: new Euler(0, yRotation, 0), // Y축 100도 회전
  });
  
  // 무기 모델 생성
  useEffect(() => {
    if (!weaponRef.current || !scene) return;
    
    console.log("무기 모델 생성 시도");
    
    // 기존 무기 모델 제거
    while (weaponRef.current.children.length > 0) {
      weaponRef.current.remove(weaponRef.current.children[0]);
    }
    
    // 모델 클론 생성
    const weaponModel = SkeletonUtils.clone(scene);
    
    // 모델 스케일 및 위치 조정 - 스케일 증가
    weaponModel.scale.set(0.08, 0.08, 0.08); // 모델 크기 증가 (0.05 -> 0.08)
    
    // 그림자 설정
    weaponModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // 총구 위치 설정 (모델에 맞게 조정)
    const muzzlePoint = new Group();
    muzzlePoint.name = "muzzlePoint";
    
    // AK-47 모델의 총구 위치를 정확하게 설정
    // 총구 위치를 모델의 앞쪽 끝으로 조정 (총구 방향으로 더 앞쪽)
    // 총구 위치는 모델 기준으로 설정되므로 y값을 0.35로 증가시켜 이펙트가 더 위쪽에 표시되도록 함
    muzzlePoint.position.set(0, 0.35, -0.8); // y값을 0.25에서 0.35로 변경하여 더 위쪽으로 이동
    
    weaponModel.add(muzzlePoint);
    muzzlePointRef.current = muzzlePoint;
    
    // 무기 모델 추가
    weaponRef.current.add(weaponModel);
    
    // 무기 위치 설정
    weaponRef.current.position.copy(recoilRef.current.originalPosition);
    
    // 무기 회전 설정 - Y축 100도 회전
    weaponRef.current.rotation.set(0, yRotation, 0);
    
    // 원래 회전값 업데이트 (반동 계산에 사용)
    recoilRef.current.originalRotation = new Euler(0, yRotation, 0);
    
    console.log("무기 모델 생성 완료");
  }, [scene, yRotation]);
  
  // 발사 처리 - 중요: 이 함수는 발사 이벤트를 처리하는 유일한 함수
  useEffect(() => {
    const handleShoot = () => {
      // 이미 이벤트 처리 중이면 무시 (중복 방지)
      if (isHandlingShootEventRef.current) {
        return;
      }
      
      // 게임 상태 확인
      if (gameOver || !gameStarted || ammo <= 0) {
        return;
      }
      
      // 이벤트 처리 중 플래그 설정
      isHandlingShootEventRef.current = true;
      
      try {
        // 탄약 감소 (1발씩만 감소)
        decreaseAmmo(1);
        
        // 머즐 플래시 표시
        setShowMuzzleFlash(true);
        setTimeout(() => setShowMuzzleFlash(false), 100);
        
        // 총구 월드 위치 계산
        const muzzleWorldPosition = new Vector3();
        if (muzzlePointRef.current && muzzlePointRef.current.getWorldPosition) {
          muzzlePointRef.current.getWorldPosition(muzzleWorldPosition);
        } else {
          // 대체 위치 계산 - 총구 위치를 더 앞쪽으로 조정
          // 무기는 원래 위치로 되돌리고 이펙트는 현재 위치 유지하기 위해 y값 조정
          muzzleWorldPosition.copy(weaponRef.current.position)
            .add(new Vector3(0, 0.35, -0.8).applyQuaternion(weaponRef.current.quaternion));
        }
        
        // 레이캐스트 방향 (카메라 방향)
        const direction = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        
        // 레이캐스트 결과에 따라 총알 궤적 생성
        const hit = shootingSystem.current.performRaycast(camera.position, direction);
        if (hit) {
          // 새 총알 궤적 추가 - 시작점을 총구 위치로 설정
          const newTrail = {
            id: Date.now(),
            start: muzzleWorldPosition.clone(),
            end: hit.point.clone(),
          };
          
          setBulletTrails(trails => [...trails, newTrail]);
          
          // 200ms 후 총알 궤적 제거
          setTimeout(() => {
            setBulletTrails(trails => trails.filter(trail => trail.id !== newTrail.id));
          }, 200);
          
          // 충돌 이펙트 추가 (총알 구멍)
          const newImpact = {
            id: Date.now() + 1, // 다른 ID 사용
            position: hit.point.clone(),
            normal: direction.clone().negate(), // 간단하게 카메라 방향의 반대로 설정
          };
          
          setImpactEffects(effects => [...effects, newImpact]);
          
          // 5초 후 충돌 이펙트 제거
          setTimeout(() => {
            setImpactEffects(effects => effects.filter(effect => effect.id !== newImpact.id));
          }, 5000);
        }
        
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
      } finally {
        // 이벤트 처리 완료 후 플래그 해제 (다음 발사 허용)
        setTimeout(() => {
          isHandlingShootEventRef.current = false;
        }, 100);
      }
    };
    
    // 발사 이벤트 리스너 등록
    window.addEventListener("shoot", handleShoot);
    
    return () => {
      window.removeEventListener("shoot", handleShoot);
    };
  }, [gameStarted, gameOver, ammo, decreaseAmmo, camera]);
  
  // 연사 기능 구현 (단순화)
  useEffect(() => {
    // 이전 타이머 정리
    if (fireIntervalRef.current) {
      clearTimeout(fireIntervalRef.current);
      fireIntervalRef.current = null;
    }
    
    // 발사 상태가 아니면 타이머 설정 안함
    if (!isFiring || !gameStarted || gameOver || ammo <= 0) return;
    
    // 연사 처리 함수
    const handleAutoFire = () => {
      const now = performance.now();
      
      // 쿨다운 확인
      if (now - lastFireTimeRef.current < fireRateRef.current) {
        // 아직 쿨다운 중이면 다음 체크 예약
        fireIntervalRef.current = setTimeout(handleAutoFire, 10);
        return;
      }
      
      // 발사 시간 업데이트
      lastFireTimeRef.current = now;
      
      // 발사 처리 (이미 이벤트 처리 중이 아닐 때만)
      if (!isHandlingShootEventRef.current && ammo > 0) {
        shootingSystem.current.shoot(camera);
      }
      
      // 계속 발사 중이면 다음 발사 예약
      if (isFiring && gameStarted && !gameOver && ammo > 0) {
        fireIntervalRef.current = setTimeout(handleAutoFire, fireRateRef.current);
      }
    };
    
    // 첫 발사 예약
    fireIntervalRef.current = setTimeout(handleAutoFire, 0);
    
    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (fireIntervalRef.current) {
        clearTimeout(fireIntervalRef.current);
        fireIntervalRef.current = null;
      }
    };
  }, [isFiring, gameStarted, gameOver, ammo, camera]);
  
  // 발사 입력 처리
  useFrame(() => {
    if (!gameStarted || gameOver) {
      setIsFiring(false);
      return;
    }
    
    // 발사 키 입력 처리
    if (shoot && !isFiring) {
      setIsFiring(true);
    } else if (!shoot && isFiring) {
      setIsFiring(false);
    }
  });
  
  // 반동 애니메이션 처리
  useFrame(() => {
    if (!weaponRef.current || !gameStarted) return;
    
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
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (fireIntervalRef.current) {
        clearTimeout(fireIntervalRef.current);
        fireIntervalRef.current = null;
      }
    };
  }, []);
  
  return (
    <group position={[0, 0, 0]}>
      {/* 무기 모델 */}
      <group 
        ref={weaponRef} 
        position={[0.1, -0.2, -0.5]} // 무기 위치 유지
        rotation={[0, yRotation, 0]} // Y축 100도 회전
        visible={true}
      />
      
      {/* 머즐 플래시 이펙트 - 총구 위치에 정확히 배치 */}
      {showMuzzleFlash && (
        <MuzzleFlash 
          position={muzzlePointRef.current && muzzlePointRef.current.getWorldPosition 
            ? muzzlePointRef.current.getWorldPosition(new Vector3()) 
            : new Vector3(0.1, 0.15, -1.3)} // 이펙트 위치를 더 위로 조정 (0.05 -> 0.15)
          onComplete={() => setShowMuzzleFlash(false)}
        />
      )}
      
      {/* 총알 궤적 이펙트 - 여러 개 표시 가능 */}
      {bulletTrails.map(trail => (
        <BulletTrail 
          key={trail.id}
          start={trail.start}
          end={trail.end}
          onComplete={() => {
            setBulletTrails(trails => trails.filter(t => t.id !== trail.id));
          }}
        />
      ))}
      
      {/* 충돌 이펙트 (총알 구멍) */}
      {impactEffects.map(effect => (
        <ImpactEffect
          key={effect.id}
          position={effect.position}
          normal={effect.normal}
          onComplete={() => {
            setImpactEffects(effects => effects.filter(e => e.id !== effect.id));
          }}
        />
      ))}
    </group>
  );
};

// 모델 프리로드
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");

export default WeaponView;
