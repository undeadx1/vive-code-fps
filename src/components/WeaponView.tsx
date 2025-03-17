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
  
  // ìí ìì¤í ì´ê¸°í
  const shootingSystem = useRef(new ShootingSystem());
  
  // ì´íí¸ ìí
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const [bulletTrails, setBulletTrails] = useState([]);
  const [impactEffects, setImpactEffects] = useState([]);
  
  // ì°ì¬ ê´ë ¨ ìí
  const [isFiring, setIsFiring] = useState(false);
  const fireRateRef = useRef(150); // ì°ì¬ ìë (ms)
  const lastFireTimeRef = useRef(0);
  const fireIntervalRef = useRef(null);
  
  // ë°ì¬ ì´ë²¤í¸ ì²ë¦¬ ì¤ì¸ì§ ì¶ì íë íëê·¸
  const isHandlingShootEventRef = useRef(false);
  
  // 3D ëª¨ë¸ ë¡ë
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  // 100ëë¥¼ ë¼ëìì¼ë¡ ë³í (Three.jsë ë¼ëì ë¨ì ì¬ì©)
  const yRotation = 100 * (Math.PI / 180);
  
  // ë°ë í¨ê³¼ë¥¼ ìí ìí
  const recoilRef = useRef({
    active: false,
    startTime: 0,
    duration: 100, // ë°ë ì§ì ìê° (ms)
    basePositionRecoil: new Vector3(0, 0.05, 0.1),
    baseRotationRecoil: new Euler(-0.05, 0, 0),
    positionRecoil: new Vector3(0, 0, 0),
    rotationRecoil: new Euler(0, 0, 0),
    // ë¬´ê¸°ë ìë ìì¹ë¡ ëëë¦¬ê³  ì´íí¸ë íì¬ ìì¹ ì ì§
    originalPosition: new Vector3(0.1, -0.2, -0.5), // ë¬´ê¸° ìì¹ ì ì§
    originalRotation: new Euler(0, yRotation, 0), // Yì¶ 100ë íì 
  });
  
  // ë¬´ê¸° ëª¨ë¸ ìì±
  useEffect(() => {
    if (!weaponRef.current || !scene) return;
    
    console.log("ë¬´ê¸° ëª¨ë¸ ìì± ìë");
    
    // ê¸°ì¡´ ë¬´ê¸° ëª¨ë¸ ì ê±°
    while (weaponRef.current.children.length > 0) {
      weaponRef.current.remove(weaponRef.current.children[0]);
    }
    
    // ëª¨ë¸ í´ë¡  ìì±
    const weaponModel = SkeletonUtils.clone(scene);
    
    // ëª¨ë¸ ì¤ì¼ì¼ ë° ìì¹ ì¡°ì  - ì¤ì¼ì¼ ì¦ê°
    weaponModel.scale.set(0.08, 0.08, 0.08); // ëª¨ë¸ í¬ê¸° ì¦ê° (0.05 -> 0.08)
    
    // ê·¸ë¦¼ì ì¤ì 
    weaponModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // ì´êµ¬ ìì¹ ì¤ì  (ëª¨ë¸ì ë§ê² ì¡°ì )
    const muzzlePoint = new Group();
    muzzlePoint.name = "muzzlePoint";
    
    // AK-47 ëª¨ë¸ì ì´êµ¬ ìì¹ë¥¼ ì ííê² ì¤ì 
    // ì´êµ¬ ìì¹ë¥¼ ëª¨ë¸ì ììª½ ëì¼ë¡ ì¡°ì  (ì´êµ¬ ë°©í¥ì¼ë¡ ë ììª½)
    // ì´êµ¬ ìì¹ë ëª¨ë¸ ê¸°ì¤ì¼ë¡ ì¤ì ëë¯ë¡ yê°ì 0.35ë¡ ì¦ê°ìì¼ ì´íí¸ê° ë ììª½ì íìëëë¡ í¨
    muzzlePoint.position.set(0, 0.35, -0.8); // yê°ì 0.25ìì 0.35ë¡ ë³ê²½íì¬ ë ììª½ì¼ë¡ ì´ë
    
    weaponModel.add(muzzlePoint);
    muzzlePointRef.current = muzzlePoint;
    
    // ë¬´ê¸° ëª¨ë¸ ì¶ê°
    weaponRef.current.add(weaponModel);
    
    // ë¬´ê¸° ìì¹ ì¤ì 
    weaponRef.current.position.copy(recoilRef.current.originalPosition);
    
    // ë¬´ê¸° íì  ì¤ì  - Yì¶ 100ë íì 
    weaponRef.current.rotation.set(0, yRotation, 0);
    
    // ìë íì ê° ìë°ì´í¸ (ë°ë ê³ì°ì ì¬ì©)
    recoilRef.current.originalRotation = new Euler(0, yRotation, 0);
    
    console.log("ë¬´ê¸° ëª¨ë¸ ìì± ìë£");
  }, [scene, yRotation]);
  
  // ë°ì¬ ì²ë¦¬ - ì¤ì: ì´ í¨ìë ë°ì¬ ì´ë²¤í¸ë¥¼ ì²ë¦¬íë ì ì¼í í¨ì
  useEffect(() => {
    const handleShoot = () => {
      // ì´ë¯¸ ì´ë²¤í¸ ì²ë¦¬ ì¤ì´ë©´ ë¬´ì (ì¤ë³µ ë°©ì§)
      if (isHandlingShootEventRef.current) {
        return;
      }
      
      // ê²ì ìí íì¸
      if (gameOver || !gameStarted || ammo <= 0) {
        return;
      }
      
      // ì´ë²¤í¸ ì²ë¦¬ ì¤ íëê·¸ ì¤ì 
      isHandlingShootEventRef.current = true;
      
      try {
        // íì½ ê°ì (1ë°ì©ë§ ê°ì)
        decreaseAmmo(1);
        
        // ë¨¸ì¦ íëì íì
        setShowMuzzleFlash(true);
        setTimeout(() => setShowMuzzleFlash(false), 100);
        
        // ì´êµ¬ ìë ìì¹ ê³ì°
        const muzzleWorldPosition = new Vector3();
        if (muzzlePointRef.current && muzzlePointRef.current.getWorldPosition) {
          muzzlePointRef.current.getWorldPosition(muzzleWorldPosition);
        } else {
          // ëì²´ ìì¹ ê³ì° - ì´êµ¬ ìì¹ë¥¼ ë ììª½ì¼ë¡ ì¡°ì 
          // ë¬´ê¸°ë ìë ìì¹ë¡ ëëë¦¬ê³  ì´íí¸ë íì¬ ìì¹ ì ì§íê¸° ìí´ yê° ì¡°ì 
          muzzleWorldPosition.copy(weaponRef.current.position)
            .add(new Vector3(0, 0.35, -0.8).applyQuaternion(weaponRef.current.quaternion));
        }
        
        // ë ì´ìºì¤í¸ ë°©í¥ (ì¹´ë©ë¼ ë°©í¥)
        const direction = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        
        // ë ì´ìºì¤í¸ ê²°ê³¼ì ë°ë¼ ì´ì ê¶¤ì  ìì±
        const hit = shootingSystem.current.performRaycast(camera.position, direction);
        if (hit) {
          // ì ì´ì ê¶¤ì  ì¶ê° - ììì ì ì´êµ¬ ìì¹ë¡ ì¤ì 
          const newTrail = {
            id: Date.now(),
            start: muzzleWorldPosition.clone(),
            end: hit.point.clone(),
          };
          
          setBulletTrails(trails => [...trails, newTrail]);
          
          // 200ms í ì´ì ê¶¤ì  ì ê±°
          setTimeout(() => {
            setBulletTrails(trails => trails.filter(trail => trail.id !== newTrail.id));
          }, 200);
          
          // ì¶©ë ì´íí¸ ì¶ê° (ì´ì êµ¬ë©)
          const newImpact = {
            id: Date.now() + 1, // ë¤ë¥¸ ID ì¬ì©
            position: hit.point.clone(),
            normal: direction.clone().negate(), // ê°ë¨íê² ì¹´ë©ë¼ ë°©í¥ì ë°ëë¡ ì¤ì 
          };
          
          setImpactEffects(effects => [...effects, newImpact]);
          
          // 5ì´ í ì¶©ë ì´íí¸ ì ê±°
          setTimeout(() => {
            setImpactEffects(effects => effects.filter(effect => effect.id !== newImpact.id));
          }, 5000);
        }
        
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
      } finally {
        // ì´ë²¤í¸ ì²ë¦¬ ìë£ í íëê·¸ í´ì  (ë¤ì ë°ì¬ íì©)
        setTimeout(() => {
          isHandlingShootEventRef.current = false;
        }, 100);
      }
    };
    
    // ë°ì¬ ì´ë²¤í¸ ë¦¬ì¤ë ë±ë¡
    window.addEventListener("shoot", handleShoot);
    
    return () => {
      window.removeEventListener("shoot", handleShoot);
    };
  }, [gameStarted, gameOver, ammo, decreaseAmmo, camera]);
  
  // ì°ì¬ ê¸°ë¥ êµ¬í (ë¨ìí)
  useEffect(() => {
    // ì´ì  íì´ë¨¸ ì ë¦¬
    if (fireIntervalRef.current) {
      clearTimeout(fireIntervalRef.current);
      fireIntervalRef.current = null;
    }
    
    // ë°ì¬ ìíê° ìëë©´ íì´ë¨¸ ì¤ì  ìí¨
    if (!isFiring || !gameStarted || gameOver || ammo <= 0) return;
    
    // ì°ì¬ ì²ë¦¬ í¨ì
    const handleAutoFire = () => {
      const now = performance.now();
      
      // ì¿¨ë¤ì´ íì¸
      if (now - lastFireTimeRef.current < fireRateRef.current) {
        // ìì§ ì¿¨ë¤ì´ ì¤ì´ë©´ ë¤ì ì²´í¬ ìì½
        fireIntervalRef.current = setTimeout(handleAutoFire, 10);
        return;
      }
      
      // ë°ì¬ ìê° ìë°ì´í¸
      lastFireTimeRef.current = now;
      
      // ë°ì¬ ì²ë¦¬ (ì´ë¯¸ ì´ë²¤í¸ ì²ë¦¬ ì¤ì´ ìë ëë§)
      if (!isHandlingShootEventRef.current && ammo > 0) {
        shootingSystem.current.shoot(camera);
      }
      
      // ê³ì ë°ì¬ ì¤ì´ë©´ ë¤ì ë°ì¬ ìì½
      if (isFiring && gameStarted && !gameOver && ammo > 0) {
        fireIntervalRef.current = setTimeout(handleAutoFire, fireRateRef.current);
      }
    };
    
    // ì²« ë°ì¬ ìì½
    fireIntervalRef.current = setTimeout(handleAutoFire, 0);
    
    // ì»´í¬ëí¸ ì¸ë§ì´í¸ ì íì´ë¨¸ ì ë¦¬
    return () => {
      if (fireIntervalRef.current) {
        clearTimeout(fireIntervalRef.current);
        fireIntervalRef.current = null;
      }
    };
  }, [isFiring, gameStarted, gameOver, ammo, camera]);
  
  // ë°ì¬ ìë ¥ ì²ë¦¬
  useFrame(() => {
    if (!gameStarted || gameOver) {
      setIsFiring(false);
      return;
    }
    
    // ë°ì¬ í¤ ìë ¥ ì²ë¦¬
    if (shoot && !isFiring) {
      setIsFiring(true);
    } else if (!shoot && isFiring) {
      setIsFiring(false);
    }
  });
  
  // ë°ë ì ëë©ì´ì ì²ë¦¬
  useFrame(() => {
    if (!weaponRef.current || !gameStarted) return;
    
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
  
  // ì»´í¬ëí¸ ì¸ë§ì´í¸ ì íì´ë¨¸ ì ë¦¬
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
      {/* ë¬´ê¸° ëª¨ë¸ */}
      <group 
        ref={weaponRef} 
        position={[0.1, -0.2, -0.5]} // ë¬´ê¸° ìì¹ ì ì§
        rotation={[0, yRotation, 0]} // Yì¶ 100ë íì 
        visible={true}
      />
      
      {/* ë¨¸ì¦ íëì ì´íí¸ - ì´êµ¬ ìì¹ì ì íí ë°°ì¹ */}
      {showMuzzleFlash && (
        <MuzzleFlash 
          position={muzzlePointRef.current && muzzlePointRef.current.getWorldPosition 
            ? muzzlePointRef.current.getWorldPosition(new Vector3()) 
            : new Vector3(0.1, 0.15, -1.3)} // ì´íí¸ ìì¹ë¥¼ ë ìë¡ ì¡°ì  (0.05 -> 0.15)
          onComplete={() => setShowMuzzleFlash(false)}
        />
      )}
      
      {/* ì´ì ê¶¤ì  ì´íí¸ - ì¬ë¬ ê° íì ê°ë¥ */}
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
      
      {/* ì¶©ë ì´íí¸ (ì´ì êµ¬ë©) */}
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

// ëª¨ë¸ íë¦¬ë¡ë
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");

export default WeaponView;
