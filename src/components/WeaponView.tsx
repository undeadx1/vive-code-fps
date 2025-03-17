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
  
  // Ã¬ÂÂÃ­ÂÂ Ã¬ÂÂÃ¬ÂÂ¤Ã­ÂÂ Ã¬Â´ÂÃªÂ¸Â°Ã­ÂÂ
  const shootingSystem = useRef(new ShootingSystem());
  
  // Ã¬ÂÂ´Ã­ÂÂÃ­ÂÂ¸ Ã¬ÂÂÃ­ÂÂ
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const [bulletTrails, setBulletTrails] = useState([]);
  const [impactEffects, setImpactEffects] = useState([]);
  
  // Ã¬ÂÂ°Ã¬ÂÂ¬ ÃªÂ´ÂÃ«Â Â¨ Ã¬ÂÂÃ­ÂÂ
  const [isFiring, setIsFiring] = useState(false);
  const fireRateRef = useRef(150); // Ã¬ÂÂ°Ã¬ÂÂ¬ Ã¬ÂÂÃ«ÂÂ (ms)
  const lastFireTimeRef = useRef(0);
  const fireIntervalRef = useRef(null);
  
  // Ã«Â°ÂÃ¬ÂÂ¬ Ã¬ÂÂ´Ã«Â²Â¤Ã­ÂÂ¸ Ã¬Â²ÂÃ«Â¦Â¬ Ã¬Â¤ÂÃ¬ÂÂ¸Ã¬Â§Â Ã¬Â¶ÂÃ¬Â ÂÃ­ÂÂÃ«ÂÂ Ã­ÂÂÃ«ÂÂÃªÂ·Â¸
  const isHandlingShootEventRef = useRef(false);
  
  // 3D Ã«ÂªÂ¨Ã«ÂÂ¸ Ã«Â¡ÂÃ«ÂÂ
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");
  
  // 100Ã«ÂÂÃ«Â¥Â¼ Ã«ÂÂ¼Ã«ÂÂÃ¬ÂÂÃ¬ÂÂ¼Ã«Â¡Â Ã«Â³ÂÃ­ÂÂ (Three.jsÃ«ÂÂ Ã«ÂÂ¼Ã«ÂÂÃ¬ÂÂ Ã«ÂÂ¨Ã¬ÂÂ Ã¬ÂÂ¬Ã¬ÂÂ©)
  const yRotation = 100 * (Math.PI / 180);
  
  // Ã«Â°ÂÃ«ÂÂ Ã­ÂÂ¨ÃªÂ³Â¼Ã«Â¥Â¼ Ã¬ÂÂÃ­ÂÂ Ã¬ÂÂÃ­ÂÂ
  const recoilRef = useRef({
    active: false,
    startTime: 0,
    duration: 100, // Ã«Â°ÂÃ«ÂÂ Ã¬Â§ÂÃ¬ÂÂ Ã¬ÂÂÃªÂ°Â (ms)
    basePositionRecoil: new Vector3(0, 0.05, 0.1),
    baseRotationRecoil: new Euler(-0.05, 0, 0),
    positionRecoil: new Vector3(0, 0, 0),
    rotationRecoil: new Euler(0, 0, 0),
    // Ã«Â¬Â´ÃªÂ¸Â°Ã«ÂÂ Ã¬ÂÂÃ«ÂÂ Ã¬ÂÂÃ¬Â¹ÂÃ«Â¡Â Ã«ÂÂÃ«ÂÂÃ«Â¦Â¬ÃªÂ³Â  Ã¬ÂÂ´Ã­ÂÂÃ­ÂÂ¸Ã«ÂÂ Ã­ÂÂÃ¬ÂÂ¬ Ã¬ÂÂÃ¬Â¹Â Ã¬ÂÂ Ã¬Â§Â
    originalPosition: new Vector3(0.1, -0.2, -0.5), // Ã«Â¬Â´ÃªÂ¸Â° Ã¬ÂÂÃ¬Â¹Â Ã¬ÂÂ Ã¬Â§Â
    originalRotation: new Euler(0, yRotation, 0), // YÃ¬Â¶Â 100Ã«ÂÂ Ã­ÂÂÃ¬Â Â
  });
  
  // Ã«Â¬Â´ÃªÂ¸Â° Ã«ÂªÂ¨Ã«ÂÂ¸ Ã¬ÂÂÃ¬ÂÂ±
  useEffect(() => {
    if (!weaponRef.current || !scene) return;
    
    console.log("Ã«Â¬Â´ÃªÂ¸Â° Ã«ÂªÂ¨Ã«ÂÂ¸ Ã¬ÂÂÃ¬ÂÂ± Ã¬ÂÂÃ«ÂÂ");
    
    // ÃªÂ¸Â°Ã¬Â¡Â´ Ã«Â¬Â´ÃªÂ¸Â° Ã«ÂªÂ¨Ã«ÂÂ¸ Ã¬Â ÂÃªÂ±Â°
    while (weaponRef.current.children.length > 0) {
      weaponRef.current.remove(weaponRef.current.children[0]);
    }
    
    // Ã«ÂªÂ¨Ã«ÂÂ¸ Ã­ÂÂ´Ã«Â¡Â  Ã¬ÂÂÃ¬ÂÂ±
    const weaponModel = SkeletonUtils.clone(scene);
    
    // Ã«ÂªÂ¨Ã«ÂÂ¸ Ã¬ÂÂ¤Ã¬Â¼ÂÃ¬ÂÂ¼ Ã«Â°Â Ã¬ÂÂÃ¬Â¹Â Ã¬Â¡Â°Ã¬Â Â - Ã¬ÂÂ¤Ã¬Â¼ÂÃ¬ÂÂ¼ Ã¬Â¦ÂÃªÂ°Â
    weaponModel.scale.set(0.08, 0.08, 0.08); // Ã«ÂªÂ¨Ã«ÂÂ¸ Ã­ÂÂ¬ÃªÂ¸Â° Ã¬Â¦ÂÃªÂ°Â (0.05 -> 0.08)
    
    // ÃªÂ·Â¸Ã«Â¦Â¼Ã¬ÂÂ Ã¬ÂÂ¤Ã¬Â Â
    weaponModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Ã¬Â´ÂÃªÂµÂ¬ Ã¬ÂÂÃ¬Â¹Â Ã¬ÂÂ¤Ã¬Â Â (Ã«ÂªÂ¨Ã«ÂÂ¸Ã¬ÂÂ Ã«Â§ÂÃªÂ²Â Ã¬Â¡Â°Ã¬Â Â)
    const muzzlePoint = new Group();
    muzzlePoint.name = "muzzlePoint";
    
    // AK-47 Ã«ÂªÂ¨Ã«ÂÂ¸Ã¬ÂÂ Ã¬Â´ÂÃªÂµÂ¬ Ã¬ÂÂÃ¬Â¹ÂÃ«Â¥Â¼ Ã¬Â ÂÃ­ÂÂÃ­ÂÂÃªÂ²Â Ã¬ÂÂ¤Ã¬Â Â
    // Ã¬Â´ÂÃªÂµÂ¬ Ã¬ÂÂÃ¬Â¹ÂÃ«Â¥Â¼ Ã«ÂªÂ¨Ã«ÂÂ¸Ã¬ÂÂ Ã¬ÂÂÃ¬ÂªÂ½ Ã«ÂÂÃ¬ÂÂ¼Ã«Â¡Â Ã¬Â¡Â°Ã¬Â Â (Ã¬Â´ÂÃªÂµÂ¬ Ã«Â°Â©Ã­ÂÂ¥Ã¬ÂÂ¼Ã«Â¡Â Ã«ÂÂ Ã¬ÂÂÃ¬ÂªÂ½)
    // Ã¬Â´ÂÃªÂµÂ¬ Ã¬ÂÂÃ¬Â¹ÂÃ«ÂÂ Ã«ÂªÂ¨Ã«ÂÂ¸ ÃªÂ¸Â°Ã¬Â¤ÂÃ¬ÂÂ¼Ã«Â¡Â Ã¬ÂÂ¤Ã¬Â ÂÃ«ÂÂÃ«Â¯ÂÃ«Â¡Â yÃªÂ°ÂÃ¬ÂÂ 0.35Ã«Â¡Â Ã¬Â¦ÂÃªÂ°ÂÃ¬ÂÂÃ¬Â¼Â Ã¬ÂÂ´Ã­ÂÂÃ­ÂÂ¸ÃªÂ°Â Ã«ÂÂ Ã¬ÂÂÃ¬ÂªÂ½Ã¬ÂÂ Ã­ÂÂÃ¬ÂÂÃ«ÂÂÃ«ÂÂÃ«Â¡Â Ã­ÂÂ¨
    muzzlePoint.position.set(0, 0.35, -0.8); // yÃªÂ°ÂÃ¬ÂÂ 0.25Ã¬ÂÂÃ¬ÂÂ 0.35Ã«Â¡Â Ã«Â³ÂÃªÂ²Â½Ã­ÂÂÃ¬ÂÂ¬ Ã«ÂÂ Ã¬ÂÂÃ¬ÂªÂ½Ã¬ÂÂ¼Ã«Â¡Â Ã¬ÂÂ´Ã«ÂÂ
    
    weaponModel.add(muzzlePoint);
    muzzlePointRef.current = muzzlePoint;
    
    // Ã«Â¬Â´ÃªÂ¸Â° Ã«ÂªÂ¨Ã«ÂÂ¸ Ã¬Â¶ÂÃªÂ°Â
    weaponRef.current.add(weaponModel);
    
    // Ã«Â¬Â´ÃªÂ¸Â° Ã¬ÂÂÃ¬Â¹Â Ã¬ÂÂ¤Ã¬Â Â
    weaponRef.current.position.copy(recoilRef.current.originalPosition);
    
    // Ã«Â¬Â´ÃªÂ¸Â° Ã­ÂÂÃ¬Â Â Ã¬ÂÂ¤Ã¬Â Â - YÃ¬Â¶Â 100Ã«ÂÂ Ã­ÂÂÃ¬Â Â
    weaponRef.current.rotation.set(0, yRotation, 0);
    
    // Ã¬ÂÂÃ«ÂÂ Ã­ÂÂÃ¬Â ÂÃªÂ°Â Ã¬ÂÂÃ«ÂÂ°Ã¬ÂÂ´Ã­ÂÂ¸ (Ã«Â°ÂÃ«ÂÂ ÃªÂ³ÂÃ¬ÂÂ°Ã¬ÂÂ Ã¬ÂÂ¬Ã¬ÂÂ©)
    recoilRef.current.originalRotation = new Euler(0, yRotation, 0);
    
    console.log("Ã«Â¬Â´ÃªÂ¸Â° Ã«ÂªÂ¨Ã«ÂÂ¸ Ã¬ÂÂÃ¬ÂÂ± Ã¬ÂÂÃ«Â£Â");
  }, [scene, yRotation]);
  
  // Ã«Â°ÂÃ¬ÂÂ¬ Ã¬Â²ÂÃ«Â¦Â¬ - Ã¬Â¤ÂÃ¬ÂÂ: Ã¬ÂÂ´ Ã­ÂÂ¨Ã¬ÂÂÃ«ÂÂ Ã«Â°ÂÃ¬ÂÂ¬ Ã¬ÂÂ´Ã«Â²Â¤Ã­ÂÂ¸Ã«Â¥Â¼ Ã¬Â²ÂÃ«Â¦Â¬Ã­ÂÂÃ«ÂÂ Ã¬ÂÂ Ã¬ÂÂ¼Ã­ÂÂ Ã­ÂÂ¨Ã¬ÂÂ
  useEffect(() => {
    const handleShoot = () => {
      // Ã¬ÂÂ´Ã«Â¯Â¸ Ã¬ÂÂ´Ã«Â²Â¤Ã­ÂÂ¸ Ã¬Â²ÂÃ«Â¦Â¬ Ã¬Â¤ÂÃ¬ÂÂ´Ã«Â©Â´ Ã«Â¬Â´Ã¬ÂÂ (Ã¬Â¤ÂÃ«Â³Âµ Ã«Â°Â©Ã¬Â§Â)
      if (isHandlingShootEventRef.current) {
        return;
      }
      
      // ÃªÂ²ÂÃ¬ÂÂ Ã¬ÂÂÃ­ÂÂ Ã­ÂÂÃ¬ÂÂ¸
      if (gameOver || !gameStarted || ammo <= 0) {
        return;
      }
      
      // Ã¬ÂÂ´Ã«Â²Â¤Ã­ÂÂ¸ Ã¬Â²ÂÃ«Â¦Â¬ Ã¬Â¤Â Ã­ÂÂÃ«ÂÂÃªÂ·Â¸ Ã¬ÂÂ¤Ã¬Â Â
      isHandlingShootEventRef.current = true;
      
      try {
        // Ã­ÂÂÃ¬ÂÂ½ ÃªÂ°ÂÃ¬ÂÂ (1Ã«Â°ÂÃ¬ÂÂ©Ã«Â§Â ÃªÂ°ÂÃ¬ÂÂ)
        decreaseAmmo(1);
        
        // Ã«Â¨Â¸Ã¬Â¦Â Ã­ÂÂÃ«ÂÂÃ¬ÂÂ Ã­ÂÂÃ¬ÂÂ
        setShowMuzzleFlash(true);
        setTimeout(() => setShowMuzzleFlash(false), 100);
        
        // Ã¬Â´ÂÃªÂµÂ¬ Ã¬ÂÂÃ«ÂÂ Ã¬ÂÂÃ¬Â¹Â ÃªÂ³ÂÃ¬ÂÂ°
        const muzzleWorldPosition = new Vector3();
        if (muzzlePointRef.current && muzzlePointRef.current.getWorldPosition) {
          muzzlePointRef.current.getWorldPosition(muzzleWorldPosition);
        } else {
          // Ã«ÂÂÃ¬Â²Â´ Ã¬ÂÂÃ¬Â¹Â ÃªÂ³ÂÃ¬ÂÂ° - Ã¬Â´ÂÃªÂµÂ¬ Ã¬ÂÂÃ¬Â¹ÂÃ«Â¥Â¼ Ã«ÂÂ Ã¬ÂÂÃ¬ÂªÂ½Ã¬ÂÂ¼Ã«Â¡Â Ã¬Â¡Â°Ã¬Â Â
          // Ã«Â¬Â´ÃªÂ¸Â°Ã«ÂÂ Ã¬ÂÂÃ«ÂÂ Ã¬ÂÂÃ¬Â¹ÂÃ«Â¡Â Ã«ÂÂÃ«ÂÂÃ«Â¦Â¬ÃªÂ³Â  Ã¬ÂÂ´Ã­ÂÂÃ­ÂÂ¸Ã«ÂÂ Ã­ÂÂÃ¬ÂÂ¬ Ã¬ÂÂÃ¬Â¹Â Ã¬ÂÂ Ã¬Â§ÂÃ­ÂÂÃªÂ¸Â° Ã¬ÂÂÃ­ÂÂ´ yÃªÂ°Â Ã¬Â¡Â°Ã¬Â Â
          muzzleWorldPosition.copy(weaponRef.current.position)
            .add(new Vector3(0, 0.35, -0.8).applyQuaternion(weaponRef.current.quaternion));
        }
        
        // Ã«Â ÂÃ¬ÂÂ´Ã¬ÂºÂÃ¬ÂÂ¤Ã­ÂÂ¸ Ã«Â°Â©Ã­ÂÂ¥ (Ã¬Â¹Â´Ã«Â©ÂÃ«ÂÂ¼ Ã«Â°Â©Ã­ÂÂ¥)
        const direction = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        
        // Ã«Â ÂÃ¬ÂÂ´Ã¬ÂºÂÃ¬ÂÂ¤Ã­ÂÂ¸ ÃªÂ²Â°ÃªÂ³Â¼Ã¬ÂÂ Ã«ÂÂ°Ã«ÂÂ¼ Ã¬Â´ÂÃ¬ÂÂ ÃªÂ¶Â¤Ã¬Â Â Ã¬ÂÂÃ¬ÂÂ±
        const hit = shootingSystem.current.performRaycast(camera.position, direction);
        if (hit) {
          // Ã¬ÂÂ Ã¬Â´ÂÃ¬ÂÂ ÃªÂ¶Â¤Ã¬Â Â Ã¬Â¶ÂÃªÂ°Â - Ã¬ÂÂÃ¬ÂÂÃ¬Â ÂÃ¬ÂÂ Ã¬Â´ÂÃªÂµÂ¬ Ã¬ÂÂÃ¬Â¹ÂÃ«Â¡Â Ã¬ÂÂ¤Ã¬Â Â
          const newTrail = {
            id: Date.now(),
            start: muzzleWorldPosition.clone(),
            end: hit.point.clone(),
          };
          
          setBulletTrails(trails => [...trails, newTrail]);
          
          // 200ms Ã­ÂÂ Ã¬Â´ÂÃ¬ÂÂ ÃªÂ¶Â¤Ã¬Â Â Ã¬Â ÂÃªÂ±Â°
          setTimeout(() => {
            setBulletTrails(trails => trails.filter(trail => trail.id !== newTrail.id));
          }, 200);
          
          // Ã¬Â¶Â©Ã«ÂÂ Ã¬ÂÂ´Ã­ÂÂÃ­ÂÂ¸ Ã¬Â¶ÂÃªÂ°Â (Ã¬Â´ÂÃ¬ÂÂ ÃªÂµÂ¬Ã«Â©Â)
          const newImpact = {
            id: Date.now() + 1, // Ã«ÂÂ¤Ã«Â¥Â¸ ID Ã¬ÂÂ¬Ã¬ÂÂ©
            position: hit.point.clone(),
            normal: direction.clone().negate(), // ÃªÂ°ÂÃ«ÂÂ¨Ã­ÂÂÃªÂ²Â Ã¬Â¹Â´Ã«Â©ÂÃ«ÂÂ¼ Ã«Â°Â©Ã­ÂÂ¥Ã¬ÂÂ Ã«Â°ÂÃ«ÂÂÃ«Â¡Â Ã¬ÂÂ¤Ã¬Â Â
          };
          
          setImpactEffects(effects => [...effects, newImpact]);
          
          // 5Ã¬Â´Â Ã­ÂÂ Ã¬Â¶Â©Ã«ÂÂ Ã¬ÂÂ´Ã­ÂÂÃ­ÂÂ¸ Ã¬Â ÂÃªÂ±Â°
          setTimeout(() => {
            setImpactEffects(effects => effects.filter(effect => effect.id !== newImpact.id));
          }, 5000);
        }
        
        // Ã«ÂÂÃ«ÂÂ¤ Ã«Â°ÂÃ«ÂÂ ÃªÂ³ÂÃ¬ÂÂ°
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
        
        // ÃªÂ³ÂÃ¬ÂÂ°Ã«ÂÂ Ã«ÂÂÃ«ÂÂ¤ Ã«Â°ÂÃ«ÂÂ Ã¬Â ÂÃ¬ÂÂ©
        recoilRef.current.positionRecoil.copy(randomPos);
        recoilRef.current.rotationRecoil.copy(randomRot);
        
        // Ã«Â°ÂÃ«ÂÂ Ã¬ÂÂ Ã«ÂÂÃ«Â©ÂÃ¬ÂÂ´Ã¬ÂÂ Ã¬ÂÂÃ¬ÂÂ
        recoilRef.current.active = true;
        recoilRef.current.startTime = performance.now();
      } finally {
        // Ã¬ÂÂ´Ã«Â²Â¤Ã­ÂÂ¸ Ã¬Â²ÂÃ«Â¦Â¬ Ã¬ÂÂÃ«Â£Â Ã­ÂÂ Ã­ÂÂÃ«ÂÂÃªÂ·Â¸ Ã­ÂÂ´Ã¬Â Â (Ã«ÂÂ¤Ã¬ÂÂ Ã«Â°ÂÃ¬ÂÂ¬ Ã­ÂÂÃ¬ÂÂ©)
        setTimeout(() => {
          isHandlingShootEventRef.current = false;
        }, 100);
      }
    };
    
    // Ã«Â°ÂÃ¬ÂÂ¬ Ã¬ÂÂ´Ã«Â²Â¤Ã­ÂÂ¸ Ã«Â¦Â¬Ã¬ÂÂ¤Ã«ÂÂ Ã«ÂÂ±Ã«Â¡Â
    window.addEventListener("shoot", handleShoot);
    
    return () => {
      window.removeEventListener("shoot", handleShoot);
    };
  }, [gameStarted, gameOver, ammo, decreaseAmmo, camera]);
  
  // Ã¬ÂÂ°Ã¬ÂÂ¬ ÃªÂ¸Â°Ã«ÂÂ¥ ÃªÂµÂ¬Ã­ÂÂ (Ã«ÂÂ¨Ã¬ÂÂÃ­ÂÂ)
  useEffect(() => {
    // Ã¬ÂÂ´Ã¬Â Â Ã­ÂÂÃ¬ÂÂ´Ã«Â¨Â¸ Ã¬Â ÂÃ«Â¦Â¬
    if (fireIntervalRef.current) {
      clearTimeout(fireIntervalRef.current);
      fireIntervalRef.current = null;
    }
    
    // Ã«Â°ÂÃ¬ÂÂ¬ Ã¬ÂÂÃ­ÂÂÃªÂ°Â Ã¬ÂÂÃ«ÂÂÃ«Â©Â´ Ã­ÂÂÃ¬ÂÂ´Ã«Â¨Â¸ Ã¬ÂÂ¤Ã¬Â Â Ã¬ÂÂÃ­ÂÂ¨
    if (!isFiring || !gameStarted || gameOver || ammo <= 0) return;
    
    // Ã¬ÂÂ°Ã¬ÂÂ¬ Ã¬Â²ÂÃ«Â¦Â¬ Ã­ÂÂ¨Ã¬ÂÂ
    const handleAutoFire = () => {
      const now = performance.now();
      
      // Ã¬Â¿Â¨Ã«ÂÂ¤Ã¬ÂÂ´ Ã­ÂÂÃ¬ÂÂ¸
      if (now - lastFireTimeRef.current < fireRateRef.current) {
        // Ã¬ÂÂÃ¬Â§Â Ã¬Â¿Â¨Ã«ÂÂ¤Ã¬ÂÂ´ Ã¬Â¤ÂÃ¬ÂÂ´Ã«Â©Â´ Ã«ÂÂ¤Ã¬ÂÂ Ã¬Â²Â´Ã­ÂÂ¬ Ã¬ÂÂÃ¬ÂÂ½
        fireIntervalRef.current = setTimeout(handleAutoFire, 10);
        return;
      }
      
      // Ã«Â°ÂÃ¬ÂÂ¬ Ã¬ÂÂÃªÂ°Â Ã¬ÂÂÃ«ÂÂ°Ã¬ÂÂ´Ã­ÂÂ¸
      lastFireTimeRef.current = now;
      
      // Ã«Â°ÂÃ¬ÂÂ¬ Ã¬Â²ÂÃ«Â¦Â¬ (Ã¬ÂÂ´Ã«Â¯Â¸ Ã¬ÂÂ´Ã«Â²Â¤Ã­ÂÂ¸ Ã¬Â²ÂÃ«Â¦Â¬ Ã¬Â¤ÂÃ¬ÂÂ´ Ã¬ÂÂÃ«ÂÂ Ã«ÂÂÃ«Â§Â)
      if (!isHandlingShootEventRef.current && ammo > 0) {
        shootingSystem.current.shoot(camera);
      }
      
      // ÃªÂ³ÂÃ¬ÂÂ Ã«Â°ÂÃ¬ÂÂ¬ Ã¬Â¤ÂÃ¬ÂÂ´Ã«Â©Â´ Ã«ÂÂ¤Ã¬ÂÂ Ã«Â°ÂÃ¬ÂÂ¬ Ã¬ÂÂÃ¬ÂÂ½
      if (isFiring && gameStarted && !gameOver && ammo > 0) {
        fireIntervalRef.current = setTimeout(handleAutoFire, fireRateRef.current);
      }
    };
    
    // Ã¬Â²Â« Ã«Â°ÂÃ¬ÂÂ¬ Ã¬ÂÂÃ¬ÂÂ½
    fireIntervalRef.current = setTimeout(handleAutoFire, 0);
    
    // Ã¬Â»Â´Ã­ÂÂ¬Ã«ÂÂÃ­ÂÂ¸ Ã¬ÂÂ¸Ã«Â§ÂÃ¬ÂÂ´Ã­ÂÂ¸ Ã¬ÂÂ Ã­ÂÂÃ¬ÂÂ´Ã«Â¨Â¸ Ã¬Â ÂÃ«Â¦Â¬
    return () => {
      if (fireIntervalRef.current) {
        clearTimeout(fireIntervalRef.current);
        fireIntervalRef.current = null;
      }
    };
  }, [isFiring, gameStarted, gameOver, ammo, camera]);
  
  // Ã«Â°ÂÃ¬ÂÂ¬ Ã¬ÂÂÃ«Â Â¥ Ã¬Â²ÂÃ«Â¦Â¬
  useFrame(() => {
    if (!gameStarted || gameOver) {
      setIsFiring(false);
      return;
    }
    
    // Ã«Â°ÂÃ¬ÂÂ¬ Ã­ÂÂ¤ Ã¬ÂÂÃ«Â Â¥ Ã¬Â²ÂÃ«Â¦Â¬
    if (shoot && !isFiring) {
      setIsFiring(true);
    } else if (!shoot && isFiring) {
      setIsFiring(false);
    }
  });
  
  // Ã«Â°ÂÃ«ÂÂ Ã¬ÂÂ Ã«ÂÂÃ«Â©ÂÃ¬ÂÂ´Ã¬ÂÂ Ã¬Â²ÂÃ«Â¦Â¬
  useFrame(() => {
    if (!weaponRef.current || !gameStarted) return;
    
    // Ã«Â°ÂÃ«ÂÂ Ã¬ÂÂ Ã«ÂÂÃ«Â©ÂÃ¬ÂÂ´Ã¬ÂÂ Ã¬Â²ÂÃ«Â¦Â¬
    if (recoilRef.current.active) {
      const elapsed = performance.now() - recoilRef.current.startTime;
      const progress = Math.min(elapsed / recoilRef.current.duration, 1);
      
      if (progress < 1) {
        // Ã«Â°ÂÃ«ÂÂ Ã¬ÂÂ Ã«ÂÂÃ«Â©ÂÃ¬ÂÂ´Ã¬ÂÂ (Ã«Â¹Â Ã«Â¥Â´ÃªÂ²Â Ã¬ÂµÂÃ«ÂÂ Ã«Â°ÂÃ«ÂÂÃ¬ÂÂ¼Ã«Â¡Â Ã¬ÂÂ´Ã«ÂÂ Ã­ÂÂ Ã¬Â²ÂÃ¬Â²ÂÃ­ÂÂ Ã¬ÂÂÃ«ÂÂ Ã¬ÂÂÃ«Â¦Â¬Ã«Â¡Â)
        const recoilPhase = 0.3; // Ã«Â°ÂÃ«ÂÂ Ã«ÂÂ¨ÃªÂ³Â Ã«Â¹ÂÃ¬ÂÂ¨
        
        if (progress < recoilPhase) {
          // Ã«Â¹Â Ã«Â¥Â´ÃªÂ²Â Ã«Â°ÂÃ«ÂÂ Ã¬Â ÂÃ¬ÂÂ©
          const recoilProgress = progress / recoilPhase;
          const easedProgress = 1 - Math.pow(1 - recoilProgress, 2);
          
          // Ã«Â¬Â´ÃªÂ¸Â° Ã«ÂªÂ¨Ã«ÂÂ¸Ã¬ÂÂ Ã«Â°ÂÃ«ÂÂ Ã¬Â ÂÃ¬ÂÂ©
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
          // Ã¬Â²ÂÃ¬Â²ÂÃ­ÂÂ Ã¬ÂÂÃ«ÂÂ Ã¬ÂÂÃ«Â¦Â¬Ã«Â¡Â Ã«ÂÂÃ¬ÂÂÃ¬ÂÂ´
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
        // Ã«Â°ÂÃ«ÂÂ Ã¬ÂÂ Ã«ÂÂÃ«Â©ÂÃ¬ÂÂ´Ã¬ÂÂ Ã¬ÂÂÃ«Â£Â, Ã¬ÂÂÃ«ÂÂ Ã¬ÂÂÃ¬Â¹ÂÃ«Â¡Â Ã«Â³ÂµÃªÂ·Â
        weaponRef.current.position.copy(recoilRef.current.originalPosition);
        weaponRef.current.rotation.copy(recoilRef.current.originalRotation);
        recoilRef.current.active = false;
      }
    }
  });
  
  // Ã¬Â»Â´Ã­ÂÂ¬Ã«ÂÂÃ­ÂÂ¸ Ã¬ÂÂ¸Ã«Â§ÂÃ¬ÂÂ´Ã­ÂÂ¸ Ã¬ÂÂ Ã­ÂÂÃ¬ÂÂ´Ã«Â¨Â¸ Ã¬Â ÂÃ«Â¦Â¬
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
      {/* Ã«Â¬Â´ÃªÂ¸Â° Ã«ÂªÂ¨Ã«ÂÂ¸ */}
      <group 
        ref={weaponRef} 
        position={[0.1, -0.2, -0.5]} // Ã«Â¬Â´ÃªÂ¸Â° Ã¬ÂÂÃ¬Â¹Â Ã¬ÂÂ Ã¬Â§Â
        rotation={[0, yRotation, 0]} // YÃ¬Â¶Â 100Ã«ÂÂ Ã­ÂÂÃ¬Â Â
        visible={true}
      />
      
      {/* Ã«Â¨Â¸Ã¬Â¦Â Ã­ÂÂÃ«ÂÂÃ¬ÂÂ Ã¬ÂÂ´Ã­ÂÂÃ­ÂÂ¸ - Ã¬Â´ÂÃªÂµÂ¬ Ã¬ÂÂÃ¬Â¹ÂÃ¬ÂÂ Ã¬Â ÂÃ­ÂÂÃ­ÂÂ Ã«Â°Â°Ã¬Â¹Â */}
      {showMuzzleFlash && (
        <MuzzleFlash 
          position={muzzlePointRef.current && muzzlePointRef.current.getWorldPosition 
            ? muzzlePointRef.current.getWorldPosition(new Vector3()) 
            : new Vector3(0.1, 0.15, -1.3)} // Ã¬ÂÂ´Ã­ÂÂÃ­ÂÂ¸ Ã¬ÂÂÃ¬Â¹ÂÃ«Â¥Â¼ Ã«ÂÂ Ã¬ÂÂÃ«Â¡Â Ã¬Â¡Â°Ã¬Â Â (0.05 -> 0.15)
          onComplete={() => setShowMuzzleFlash(false)}
        />
      )}
      
      {/* Ã¬Â´ÂÃ¬ÂÂ ÃªÂ¶Â¤Ã¬Â Â Ã¬ÂÂ´Ã­ÂÂÃ­ÂÂ¸ - Ã¬ÂÂ¬Ã«ÂÂ¬ ÃªÂ°Â Ã­ÂÂÃ¬ÂÂ ÃªÂ°ÂÃ«ÂÂ¥ */}
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
      
      {/* Ã¬Â¶Â©Ã«ÂÂ Ã¬ÂÂ´Ã­ÂÂÃ­ÂÂ¸ (Ã¬Â´ÂÃ¬ÂÂ ÃªÂµÂ¬Ã«Â©Â) */}
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

// Ã«ÂªÂ¨Ã«ÂÂ¸ Ã­ÂÂÃ«Â¦Â¬Ã«Â¡ÂÃ«ÂÂ
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/weapons/ak47.glb");

export default WeaponView;
