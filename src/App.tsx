import React from 'react';
import './App.css';
import { UI } from './components/UI.tsx';
import { R3F } from './components/R3F.tsx';
import { GameScene } from './components/r3f/GameScene.tsx';

const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <R3F> 
        <GameScene />
      </R3F>
      <UI>
      </UI>
    </div>
  );
};

export default App;
