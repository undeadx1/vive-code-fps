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
        pointerEvents: 'none', // 마우스 이벤트를 통과시켜
        zIndex: 5 // 메인 캔버스보다 높지만 UI보다는 낮은 zIndex
      }}
      camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, 0] }}
    >
      {/* 무기 전용 조명 추가 */}
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
