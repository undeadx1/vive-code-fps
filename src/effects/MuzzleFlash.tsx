import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sprite, SpriteMaterial, AdditiveBlending, TextureLoader, Vector3 } from 'three';

// Load the muzzle flash texture
const muzzleFlashTexture = new TextureLoader().load('https://agent8-games.verse8.io/assets/3D/textures/effects/muzzle.png');

const MuzzleFlash = ({ position, onComplete }) => {
  const spriteRef = useRef();
  const startTime = useRef(Date.now());
  const duration = 100; // 100ms duration
  
  // Initialize sprite
  useEffect(() => {
    if (spriteRef.current) {
      const sprite = spriteRef.current;
      
      // Set sprite material with the loaded texture
      const material = new SpriteMaterial({
        map: muzzleFlashTexture,
        color: 0xffff80, // Slightly yellow tint for more realistic muzzle flash
        transparent: true,
        blending: AdditiveBlending,
        opacity: 1
      });
      
      sprite.material = material;
      sprite.scale.set(0.4, 0.4, 1); // Slightly smaller size for more realistic look
      sprite.position.copy(position);
      
      // Random rotation for variety
      sprite.material.rotation = Math.random() * Math.PI * 2;
    }
  }, [position]);
  
  // Animation handling
  useFrame(() => {
    if (spriteRef.current) {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Size and opacity animation - faster fade out for more realistic flash
      const scale = 0.4 * (1 + progress * 0.3); // Smaller growth
      const opacity = 1 - (progress * progress); // Faster fade out using quadratic easing
      
      spriteRef.current.scale.set(scale, scale, 1);
      spriteRef.current.material.opacity = opacity;
      
      // Call completion callback when animation is done
      if (progress >= 1 && onComplete) {
        onComplete();
      }
    }
  });
  
  return <sprite ref={spriteRef} />;
};

export default MuzzleFlash;
