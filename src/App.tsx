import React, { useState, useEffect } from 'react';
import './App.css';
import Game from './components/Game';
import LoadingScreen from './components/LoadingScreen';
import WeaponCanvas from './components/WeaponCanvas';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 리소스 로딩 시뮬레이션
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(loadingTimer);
  }, []);
  
  return (
    <div className="App">
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Game />
          <WeaponCanvas />
        </>
      )}
    </div>
  );
}

export default App;
