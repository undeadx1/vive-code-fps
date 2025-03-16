import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, DoubleSide, PlaneGeometry, Mesh, MeshBasicMaterial, TextureLoader } from 'three';

// Load the bullet trail texture
const bulletTrailTexture = new TextureLoader().load('https://agent8-games.verse8.io/assets/3D/textures/effects/shootlaser.png');

const BulletTrail = ({ start, end, onComplete }) => {
  const trailRef = useRef();
  const startTime = useRef(Date.now());
  const duration = 200; // 200ms duration
  
  // Create trail effect
  useEffect(() => {
    if (trailRef.current) {
      const direction = new Vector3().subVectors(end, start).normalize();
      const distance = start.distanceTo(end);
      
      // Create a plane that faces the camera but stretches from start to end
      const geometry = new PlaneGeometry(0.05, distance);
      geometry.translate(0, distance / 2, 0);
      geometry.rotateX(Math.PI / 2);
      
      // Create material with the loaded trail texture
      const material = new MeshBasicMaterial({
        map: bulletTrailTexture,
        transparent: true,
        opacity: 1,
        color: 0xffffff, // Use white to preserve texture colors
        side: DoubleSide,
        depthWrite: false
      });
      
      // Set up the mesh
      trailRef.current.geometry = geometry;
      trailRef.current.material = material;
      
      // Position and orient the trail
      trailRef.current.position.copy(start);
      
      // Look at the end point
      trailRef.current.lookAt(end);
    }
  }, [start, end]);
  
  // Animation handling
  useFrame(() => {
    if (trailRef.current) {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Fade out the trail
      trailRef.current.material.opacity = 1 - progress;
      
      // Call completion callback when animation is done
      if (progress >= 1 && onComplete) {
        onComplete();
      }
    }
  });
  
  return <mesh ref={trailRef} />;
};

export default BulletTrail;
