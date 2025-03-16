import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, BufferGeometry, LineBasicMaterial, Line, TextureLoader, RepeatWrapping } from 'three';

// 총알 궤적 텍스처 로더 생성
const textureLoader = new TextureLoader();
const bulletTrailTexture = textureLoader.load('https://agent8-games.verse8.io/assets/textures/effects/bullet_trail.png');

// 텍스처 설정
bulletTrailTexture.wrapS = RepeatWrapping;
bulletTrailTexture.wrapT = RepeatWrapping;
bulletTrailTexture.repeat.set(1, 1);

const BulletTrail = ({ start, end, onComplete }) => {
  const lineRef = useRef();
  const startTime = useRef(Date.now());
  const duration = 200; // 200ms 동안 표시
  
  // 라인 지오메트리 생성
  useEffect(() => {
    if (lineRef.current) {
      const line = lineRef.current;
      
      // 지오메트리 생성
      const geometry = new BufferGeometry();
      const points = [start, end];
      geometry.setFromPoints(points);
      line.geometry = geometry;
      
      // 라인 재질 설정
      const material = new LineBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 1,
        linewidth: 3
      });
      
      line.material = material;
    }
  }, [start, end]);
  
  // 애니메이션 처리
  useFrame(() => {
    if (lineRef.current) {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // 투명도 애니메이션
      const opacity = 1 - progress;
      lineRef.current.material.opacity = opacity;
      
      // 애니메이션 완료 시 콜백 호출
      if (progress >= 1 && onComplete) {
        onComplete();
      }
    }
  });
  
  return <line ref={lineRef} />;
};

export default BulletTrail;
