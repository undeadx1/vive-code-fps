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
        pointerEvents: 'none', // 마우스 이벤트를 통과시킴
        zIndex: 5 // 메인 캔버스보다 높지만 UI보다는 낮은 zIndex
      }}
      camera={{ fov: 45, position: [0, 0, 0] }}
    >
      <WeaponView />
    </Canvas>
  );
};

export default WeaponCanvas;
