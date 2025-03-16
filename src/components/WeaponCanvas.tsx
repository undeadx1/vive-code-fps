import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from '../stores/gameStore';
import WeaponView from './WeaponView';

const WeaponCanvas = () => {
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameOver = useGameStore((state) => state.gameOver);
  
  // 게임이 시작되지 않았거나 게임 오버 상태면 무기 표시하지 않음
  if (!gameStarted || gameOver) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 10 // 다른 캔버스 위에 렌더링되도록 zIndex 설정
    }}>
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, 0]
        }}
        gl={{ 
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true
        }}
        style={{ 
          background: 'transparent'
        }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[0, 5, 5]} intensity={1.5} />
        <WeaponView />
      </Canvas>
    </div>
  );
};

export default WeaponCanvas;
