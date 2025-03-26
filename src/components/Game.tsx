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
  
  // ÃªÂ²ÂÃ¬ÂÂ Ã¬ÂÂÃ¬ÂÂ Ã¬Â²ÂÃ«Â¦Â¬
  useEffect(() => {
    const handleStartGame = () => {
      if (!gameStarted && !gameOver && pointerLockControlsRef) {
        pointerLockControlsRef.lock();
        setGameStarted(true);
      }
    };
    
    // ÃªÂ²ÂÃ¬ÂÂ Ã¬ÂÂÃ¬ÂÂ Ã¬ÂÂ´Ã«Â²Â¤Ã­ÂÂ¸ Ã«Â¦Â¬Ã¬ÂÂ¤Ã«ÂÂ Ã«ÂÂ±Ã«Â¡Â
    window.addEventListener('click', handleStartGame);
    
    return () => {
      window.removeEventListener('click', handleStartGame);
    };
  }, [gameStarted, gameOver, pointerLockControlsRef, setGameStarted]);
  
  // Ã­ÂÂ¬Ã¬ÂÂ¸Ã­ÂÂ° Ã«ÂÂ½ Ã¬ÂÂÃ­ÂÂ Ã«Â³ÂÃªÂ²Â½ ÃªÂ°ÂÃ¬Â§Â
  useEffect(() => {
    if (!pointerLockControlsRef) return;
    
    const handleLockChange = () => {
      if (!document.pointerLockElement && gameStarted && !gameOver) {
        // ÃªÂ²ÂÃ¬ÂÂ Ã¬Â¤Â Ã­ÂÂ¬Ã¬ÂÂ¸Ã­ÂÂ° Ã«ÂÂ½Ã¬ÂÂ´ Ã­ÂÂ´Ã¬Â ÂÃ«ÂÂÃ«Â©Â´ Ã¬ÂÂ¼Ã¬ÂÂ Ã¬Â ÂÃ¬Â§Â Ã¬Â²ÂÃ«Â¦Â¬
        console.log('Ã­ÂÂ¬Ã¬ÂÂ¸Ã­ÂÂ° Ã«ÂÂ½ Ã­ÂÂ´Ã¬Â ÂÃ«ÂÂ¨ - Ã¬ÂÂ¼Ã¬ÂÂ Ã¬Â ÂÃ¬Â§Â');
      }
    };
    
    document.addEventListener('pointerlockchange', handleLockChange);
    
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, [pointerLockControlsRef, gameStarted, gameOver]);
  
  return (
    <>
      {/* Ã«Â©ÂÃ¬ÂÂ¸ ÃªÂ²ÂÃ¬ÂÂ Ã¬ÂºÂÃ«Â²ÂÃ¬ÂÂ¤ */}
      <Canvas 
        shadows 
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1 // Ã«ÂªÂÃ¬ÂÂÃ¬Â ÂÃ¬ÂÂ¼Ã«Â¡Â zIndex Ã¬ÂÂ¤Ã¬Â Â
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
        
        {/* Ã­ÂÂ¬Ã¬ÂÂ¸Ã­ÂÂ° Ã«ÂÂ½ Ã¬Â»Â¨Ã­ÂÂ¸Ã«Â¡Â¤ */}
        <PointerLockControls 
          ref={setPointerLockControlsRef} 
          selector="#game-container"
        />
      </Canvas>
      
      {/* Ã«Â¬Â´ÃªÂ¸Â° Ã«Â·Â° Ã¬ÂºÂÃ«Â²ÂÃ¬ÂÂ¤ (Ã«Â³ÂÃ«ÂÂ Ã«Â ÂÃ¬ÂÂ´Ã¬ÂÂ´) */}
      <WeaponCanvas />
      
      {/* UI Ã¬ÂÂ¤Ã«Â²ÂÃ«Â ÂÃ¬ÂÂ´ - ÃªÂ°ÂÃ¬ÂÂ¥ Ã«ÂÂÃ¬ÂÂ zIndexÃ«Â¡Â Ã¬ÂÂ¤Ã¬Â Â */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 10, // UIÃ«Â¥Â¼ ÃªÂ°ÂÃ¬ÂÂ¥ Ã¬ÂÂÃ¬ÂÂ Ã­ÂÂÃ¬ÂÂÃ­ÂÂÃªÂ¸Â° Ã¬ÂÂÃ­ÂÂ´ Ã«ÂÂÃ¬ÂÂ zIndex Ã¬ÂÂ¤Ã¬Â Â
        pointerEvents: 'none' // UIÃ«Â¥Â¼ Ã­ÂÂµÃªÂ³Â¼Ã­ÂÂÃ¬ÂÂ¬ ÃªÂ²ÂÃ¬ÂÂ Ã¬Â¡Â°Ã¬ÂÂ ÃªÂ°ÂÃ«ÂÂ¥Ã­ÂÂÃ«ÂÂÃ«Â¡Â Ã¬ÂÂ¤Ã¬Â Â
      }}>
        <UI />
      </div>
      
      {/* ÃªÂ²ÂÃ¬ÂÂ Ã¬Â»Â¨Ã­ÂÂÃ¬ÂÂ´Ã«ÂÂ (Ã­ÂÂ¬Ã¬ÂÂ¸Ã­ÂÂ° Ã«ÂÂ½ Ã«ÂÂÃ¬ÂÂ) */}
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
