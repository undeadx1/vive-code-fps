import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, BufferGeometry, PointsMaterial, Points, Float32BufferAttribute, TextureLoader } from 'three';

// 충돌 효과 텍스처 로더 생성
const textureLoader = new TextureLoader();
const impactTexture = textureLoader.load('https://agent8-games.verse8.io/assets/textures/effects/impact_particle.png');

const ImpactEffect = ({ position, onComplete }) => {
  const pointsRef = useRef();
  const startTime = useRef(Date.now());
  const duration = 500; // 500ms 동안 표시
  const particleCount = 20;
  
  // 파티클 지오메트리 생성
  useEffect(() => {
    if (pointsRef.current) {
      const points = pointsRef.current;
      
      // 지오메트리 생성
      const geometry = new BufferGeometry();
      const positions = [];
      const velocities = [];
      
      for (let i = 0; i < particleCount; i++) {
        // 초기 위치 (충돌 지점)
        positions.push(0, 0, 0);
        
        // 랜덤 방향으로 퍼지는 속도
        const angle = Math.random() * Math.PI * 2;
        const elevation = Math.random() * Math.PI - Math.PI / 2;
        const speed = 0.05 + Math.random() * 0.1;
        
        velocities.push(
          Math.cos(angle) * Math.cos(elevation) * speed,
          Math.sin(elevation) * speed,
          Math.sin(angle) * Math.cos(elevation) * speed
        );
      }
      
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geometry.userData.velocities = velocities;
      points.geometry = geometry;
      
      // 파티클 재질 설정
      const material = new PointsMaterial({
        color: 0xff8800,
        size: 0.1,
        transparent: true,
        opacity: 1,
        map: impactTexture
      });
      
      points.material = material;
      points.position.copy(position);
    }
  }, [position]);
  
  // 애니메이션 처리
  useFrame(() => {
    if (pointsRef.current) {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // 파티클 위치 업데이트
      const positions = pointsRef.current.geometry.attributes.position.array;
      const velocities = pointsRef.current.geometry.userData.velocities;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // 속도에 따라 위치 업데이트
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1] - 0.001; // 중력 효과
        positions[i3 + 2] += velocities[i3 + 2];
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // 투명도 애니메이션
      const opacity = 1 - progress;
      pointsRef.current.material.opacity = opacity;
      
      // 애니메이션 완료 시 콜백 호출
      if (progress >= 1 && onComplete) {
        onComplete();
      }
    }
  });
  
  return <points ref={pointsRef} />;
};

export default ImpactEffect;
