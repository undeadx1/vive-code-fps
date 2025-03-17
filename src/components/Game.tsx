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
  
  // ê²ì ìì ì²ë¦¬
  useEffect(() => {
    const handleStartGame = () => {
      if (!gameStarted && !gameOver && pointerLockControlsRef) {
        pointerLockControlsRef.lock();
        setGameStarted(true);
      }
    };
    
    // ê²ì ìì ì´ë²¤í¸ ë¦¬ì¤ë ë±ë¡
    window.addEventListener('click', handleStartGame);
    
    return () => {
      window.removeEventListener('click', handleStartGame);
    };
  }, [gameStarted, gameOver, pointerLockControlsRef, setGameStarted]);
  
  // í¬ì¸í° ë½ ìí ë³ê²½ ê°ì§
  useEffect(() => {
    if (!pointerLockControlsRef) return;
    
    const handleLockChange = () => {
      if (!document.pointerLockElement && gameStarted && !gameOver) {
        // ê²ì ì¤ í¬ì¸í° ë½ì´ í´ì ëë©´ ì¼ì ì ì§ ì²ë¦¬
        console.log('í¬ì¸í° ë½ í´ì ë¨ - ì¼ì ì ì§');
      }
    };
    
    document.addEventListener('pointerlockchange', handleLockChange);
    
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, [pointerLockControlsRef, gameStarted, gameOver]);
  
  return (
    <>
      {/* ë©ì¸ ê²ì ìºë²ì¤ */}
      <Canvas 
        shadows 
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1 // ëªìì ì¼ë¡ zIndex ì¤ì 
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
        
        {/* í¬ì¸í° ë½ ì»¨í¸ë¡¤ */}
        <PointerLockControls 
          ref={setPointerLockControlsRef} 
          selector="#game-container"
        />
      </Canvas>
      
      {/* ë¬´ê¸° ë·° ìºë²ì¤ (ë³ë ë ì´ì´) */}
      <WeaponCanvas />
      
      {/* UI ì¤ë²ë ì´ - ê°ì¥ ëì zIndexë¡ ì¤ì  */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 10, // UIë¥¼ ê°ì¥ ìì íìíê¸° ìí´ ëì zIndex ì¤ì 
        pointerEvents: 'none' // UIë¥¼ íµê³¼íì¬ ê²ì ì¡°ì ê°ë¥íëë¡ ì¤ì 
      }}>
        <UI />
      </div>
      
      {/* ê²ì ì»¨íì´ë (í¬ì¸í° ë½ ëì) */}
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
