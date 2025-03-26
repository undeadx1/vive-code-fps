import React from 'react';
import { Canvas } from '@react-three/fiber';
import WeaponView from './WeaponView';

const WeaponCanvas = () => {
  return (
    <Canvas
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // ë§ì°ì¤ ì´ë²¤í¸ë¥¼ íµê³¼ìì¼
        zIndex: 5 // ë©ì¸ ìºë²ì¤ë³´ë¤ ëì§ë§ UIë³´ë¤ë ë®ì zIndex
      }}
      camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, 0] }}
    >
      {/* ë¬´ê¸° ì ì© ì¡°ëª ì¶ê° */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[1, 1, 0.5]} 
        intensity={1.5} 
        color="#ffffff"
        castShadow
      />
      <WeaponView />
    </Canvas>
  );
};

export default WeaponCanvas;
