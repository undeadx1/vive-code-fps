import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import Game from "./components/Game";
import UI from "./components/UI";
import LoadingScreen from "./components/LoadingScreen";
import "./App.css";

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <Canvas shadows camera={{ fov: 75, position: [0, 1.6, 0] }}>
          <Physics>
            <Game />
          </Physics>
        </Canvas>
        <UI />
      </Suspense>
    </div>
  );
}

export default App;
