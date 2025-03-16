import { useEffect, useState, Suspense } from "react";
import { useThree } from "@react-three/fiber";
import { Sky, PointerLockControls } from "@react-three/drei";
import Player from "./Player";
import FpsMap from "./FpsMap";
import Weapons from "./Weapons";
import { useGameStore } from "../stores/gameStore";

const Game = () => {
  const { camera } = useThree();
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const setGameStarted = useGameStore((state) => state.setGameStarted);

  useEffect(() => {
    const handleClick = () => {
      if (!gameStarted) {
        setGameStarted(true);
        setControlsEnabled(true);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [gameStarted, setGameStarted]);

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
      />
      
      <Suspense fallback={null}>
        <FpsMap />
      </Suspense>
      <Player position={[0, 3, 0]} />
      <Weapons />
      
      {controlsEnabled && <PointerLockControls />}
    </>
  );
};

export default Game;
