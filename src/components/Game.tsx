import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, Sky } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import Player from './Player';
import Level from './Level';
import UI from './UI';
import WeaponCanvas from './WeaponCanvas';
import { useGameStore } from '../stores/gameStore';

const Game = () => {
  const [pointerLockControlsRef, setPointerLockControlsRef] = useState<any>(null);
  const setGameStarted = useGameStore((state) => state.setGameStarted);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameOver = useGameStore((state) => state.gameOver);
  
  // 게임 시작 처리
  useEffect(() => {
    const handleStartGame = () => {
      if (!gameStarted && !gameOver && pointerLockControlsRef) {
        pointerLockControlsRef.lock();
        setGameStarted(true);
      }
    };
    
    // 게임 시작 이벤트 리스너 등록
    window.addEventListener('click', handleStartGame);
    
    return () => {
      window.removeEventListener('click', handleStartGame);
    };
  }, [gameStarted, gameOver, pointerLockControlsRef, setGameStarted]);
  
  // 포인터 락 상태 변경 감지
  useEffect(() => {
    if (!pointerLockControlsRef) return;
    
    const handleLockChange = () => {
      if (!document.pointerLockElement && gameStarted && !gameOver) {
        // 게임 중 포인터 락이 해제되면 일시 정지 처리
        console.log('포인터 락 해제됨 - 일시 정지');
      }
    };
    
    document.addEventListener('pointerlockchange', handleLockChange);
    
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, [pointerLockControlsRef, gameStarted, gameOver]);
  
  return (
    <>
      <Canvas 
        shadows 
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[50, 50, 25]}
          intensity={1.5}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        
        <Physics gravity={[0, -9.81, 0]}>
          <Player position={[0, 15, 0]} />
          <Level />
        </Physics>
        
        {/* 포인터 락 컨트롤 */}
        <PointerLockControls 
          ref={setPointerLockControlsRef} 
          selector="#game-container"
        />
      </Canvas>
      
      {/* 무기 뷰 캔버스 (별도 레이어) */}
      <WeaponCanvas />
      
      {/* UI 오버레이 */}
      <UI />
      
      {/* 게임 컨테이너 (포인터 락 대상) */}
      <div id="game-container" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: -1 
      }} />
    </>
  );
};

export default Game;
