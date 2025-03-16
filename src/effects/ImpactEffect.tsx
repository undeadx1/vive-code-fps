import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sprite, SpriteMaterial, NormalBlending, TextureLoader, Vector3 } from 'three';

// Load the bullet hole texture
const bulletHoleTexture = new TextureLoader().load('https://agent8-games.verse8.io/assets/3D/textures/effects/bullethole.png');

const ImpactEffect = ({ position, normal, onComplete }) => {
  const spriteRef = useRef();
  const startTime = useRef(Date.now());
  const duration = 5000; // 5 seconds duration for bullet holes
  
  // Initialize sprite
  useEffect(() => {
    if (spriteRef.current) {
      const sprite = spriteRef.current;
      
      // Set sprite material with the loaded texture
      const material = new SpriteMaterial({
        map: bulletHoleTexture,
        color: 0xffffff,
        transparent: true,
        blending: NormalBlending,
        opacity: 1,
        depthWrite: false,
        depthTest: true
      });
      
      sprite.material = material;
      sprite.scale.set(0.1, 0.1, 1); // Smaller size for bullet holes
      
      // Position slightly in front of the hit surface to prevent z-fighting
      const adjustedPosition = position.clone();
      if (normal) {
        adjustedPosition.addScaledVector(normal, 0.01);
      }
      sprite.position.copy(adjustedPosition);
      
      // Random rotation for variety
      sprite.material.rotation = Math.random() * Math.PI * 2;
    }
  }, [position, normal]);
  
  // Animation handling - slow fade out
  useFrame(() => {
    if (spriteRef.current) {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Only start fading out in the last 20% of the duration
      if (progress > 0.8) {
        const fadeProgress = (progress - 0.8) / 0.2;
        spriteRef.current.material.opacity = 1 - fadeProgress;
      }
      
      // Call completion callback when animation is done
      if (progress >= 1 && onComplete) {
        onComplete();
      }
    }
  });
  
  return <sprite ref={spriteRef} />;
};

export default ImpactEffect;
