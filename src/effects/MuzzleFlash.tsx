import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sprite, SpriteMaterial, AdditiveBlending, TextureLoader } from 'three';

// 머즐 플래시 텍스처 로더 생성
const textureLoader = new TextureLoader();
const muzzleFlashTexture = textureLoader.load('https://agent8-games.verse8.io/assets/textures/effects/muzzle_flash.png');

const MuzzleFlash = ({ position, onComplete }) => {
  const spriteRef = useRef();
  const startTime = useRef(Date.now());
  const duration = 100; // 100ms 동안 표시
  
  // 스프라이트 초기화
  useEffect(() => {
    if (spriteRef.current) {
      const sprite = spriteRef.current;
      
      // 스프라이트 재질 설정
      const material = new SpriteMaterial({
        map: muzzleFlashTexture,
        color: 0xffff80,
        transparent: true,
        blending: AdditiveBlending,
        opacity: 1
      });
      
      sprite.material = material;
      sprite.scale.set(2, 2, 1); // 크기 조정
      sprite.position.copy(position);
    }
  }, [position]);
  
  // 애니메이션 처리
  useFrame(() => {
    if (spriteRef.current) {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // 크기 및 투명도 애니메이션
      const scale = 2 + progress * 0.5;
      const opacity = 1 - progress;
      
      spriteRef.current.scale.set(scale, scale, 1);
      spriteRef.current.material.opacity = opacity;
      
      // 애니메이션 완료 시 콜백 호출
      if (progress >= 1 && onComplete) {
        onComplete();
      }
    }
  });
  
  return <sprite ref={spriteRef} />;
};

export default MuzzleFlash;
