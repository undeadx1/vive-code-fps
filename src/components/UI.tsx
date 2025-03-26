import React from 'react';
import { useGameStore } from '../stores/gameStore';

const UI = () => {
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gameOver = useGameStore((state) => state.gameOver);
  const health = useGameStore((state) => state.health);
  const ammo = useGameStore((state) => state.ammo);
  const score = useGameStore((state) => state.score);
  const resetGame = useGameStore((state) => state.resetGame);
  
  // ÃªÂ²ÂÃ¬ÂÂ Ã¬ÂÂÃ¬ÂÂ Ã­ÂÂÃ«Â©Â´
  const renderStartScreen = () => {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'white',
        fontSize: '24px',
        fontFamily: '"Rajdhani", sans-serif',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
        pointerEvents: 'auto' // Ã¬ÂÂÃ¬ÂÂ Ã­ÂÂÃ«Â©Â´Ã¬ÂÂ Ã­ÂÂ´Ã«Â¦Â­ ÃªÂ°ÂÃ«ÂÂ¥Ã­ÂÂÃ«ÂÂÃ«Â¡Â Ã¬ÂÂ¤Ã¬Â Â
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          color: '#ff4d4d'
        }}>FPS ÃªÂ²ÂÃ¬ÂÂ</h1>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '20px 40px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)'
        }}>
          <p style={{ 
            fontSize: '28px',
            marginBottom: '30px'
          }}>Ã­ÂÂ´Ã«Â¦Â­Ã­ÂÂÃ¬ÂÂ¬ ÃªÂ²ÂÃ¬ÂÂ Ã¬ÂÂÃ¬ÂÂ</p>
          <div style={{ 
            fontSize: '18px',
            textAlign: 'left',
            marginBottom: '20px',
            color: '#cccccc'
          }}>
            <p><span style={{color: '#ff4d4d', fontWeight: 'bold'}}>WASD</span>: Ã¬ÂÂ´Ã«ÂÂ</p>
            <p><span style={{color: '#ff4d4d', fontWeight: 'bold'}}>SHIFT</span>: Ã«ÂÂ¬Ã«Â¦Â¬ÃªÂ¸Â°</p>
            <p><span style={{color: '#ff4d4d', fontWeight: 'bold'}}>Ã«Â§ÂÃ¬ÂÂ°Ã¬ÂÂ¤</span>: Ã¬ÂÂÃ¬Â Â Ã«Â³ÂÃªÂ²Â½</p>
            <p><span style={{color: '#ff4d4d', fontWeight: 'bold'}}>Ã¬Â¢ÂÃ­ÂÂ´Ã«Â¦Â­</span>: Ã«Â°ÂÃ¬ÂÂ¬</p>
            <p><span style={{color: '#ff4d4d', fontWeight: 'bold'}}>Ã¬ÂÂ¤Ã­ÂÂÃ¬ÂÂ´Ã¬ÂÂ¤Ã«Â°Â</span>: Ã¬Â ÂÃ­ÂÂ</p>
          </div>
        </div>
      </div>
    );
  };
  
  // ÃªÂ²ÂÃ¬ÂÂ Ã¬ÂÂ¤Ã«Â²Â Ã­ÂÂÃ«Â©Â´
  const renderGameOverScreen = () => {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'white',
        fontSize: '24px',
        fontFamily: '"Rajdhani", sans-serif',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
        pointerEvents: 'auto' // ÃªÂ²ÂÃ¬ÂÂ Ã¬ÂÂ¤Ã«Â²Â Ã­ÂÂÃ«Â©Â´Ã¬ÂÂ Ã­ÂÂ´Ã«Â¦Â­ ÃªÂ°ÂÃ«ÂÂ¥Ã­ÂÂÃ«ÂÂÃ«Â¡Â Ã¬ÂÂ¤Ã¬Â Â
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          color: '#ff4d4d'
        }}>ÃªÂ²ÂÃ¬ÂÂ Ã¬ÂÂ¤Ã«Â²Â</h1>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '20px 40px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)'
        }}>
          <p style={{ 
            fontSize: '28px',
            marginBottom: '30px'
          }}>Ã¬Â ÂÃ¬ÂÂ: {score}</p>
          <button 
            onClick={resetGame}
            style={{
              padding: '15px 30px',
              fontSize: '20px',
              backgroundColor: '#ff4d4d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px',
              fontFamily: '"Rajdhani", sans-serif',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ff2a2a';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ff4d4d';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Ã«ÂÂ¤Ã¬ÂÂ Ã¬ÂÂÃ¬ÂÂ
          </button>
        </div>
      </div>
    );
  };
  
  // ÃªÂ²ÂÃ¬ÂÂ Ã¬Â¤Â HUD
  const renderHUD = () => {
    return (
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px',
        color: 'white',
        fontFamily: '"Rajdhani", sans-serif',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '0 20px'
      }}>
        {/* Ã¬ÂÂ¼Ã¬ÂªÂ½ Ã¬Â ÂÃ«Â³Â´ Ã­ÂÂ¨Ã«ÂÂ (Ã¬Â²Â´Ã«Â Â¥) */}
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: '250px'
        }}>
          {/* Ã¬Â²Â´Ã«Â Â¥ Ã«Â°Â */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                marginRight: '10px', 
                fontSize: '18px', 
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>Ã¬Â²Â´Ã«Â Â¥</span>
              <div style={{ 
                width: '200px', 
                height: '20px', 
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '5px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ 
                  width: `${health}%`, 
                  height: '100%', 
                  backgroundColor: health > 50 ? '#4CAF50' : health > 25 ? '#FFC107' : '#F44336',
                  transition: 'width 0.3s ease',
                  boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)'
                }} />
              </div>
              <span style={{ 
                marginLeft: '10px', 
                fontSize: '18px',
                fontWeight: 'bold'
              }}>{health}</span>
            </div>
          </div>
          
          {/* Ã¬Â ÂÃ¬ÂÂ */}
          <div style={{ 
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#ffcc00',
            textShadow: '0 0 5px rgba(255, 204, 0, 0.7)'
          }}>
            Ã¬Â ÂÃ¬ÂÂ: {score}
          </div>
        </div>
        
        {/* Ã¬ÂÂ¤Ã«Â¥Â¸Ã¬ÂªÂ½ Ã¬Â ÂÃ«Â³Â´ Ã­ÂÂ¨Ã«ÂÂ (Ã­ÂÂÃ¬ÂÂ½) */}
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: '200px',
          textAlign: 'right'
        }}>
          {/* Ã­ÂÂÃ¬ÂÂ½ */}
          <div style={{ 
            fontSize: '28px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            letterSpacing: '2px',
            color: ammo > 10 ? 'white' : '#ff4d4d'
          }}>
            <span style={{ fontSize: '20px', color: '#aaaaaa' }}>AMMO</span> {ammo} <span style={{ fontSize: '20px', color: '#aaaaaa' }}>/ 30</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Ã¬Â¡Â°Ã¬Â¤ÂÃ¬Â Â
  const renderCrosshair = () => {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '20px',
        height: '20px',
        pointerEvents: 'none'
      }}>
        {/* Ã¬Â¤ÂÃ¬ÂÂ¬Ã¬Â Â */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '3px',
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '50%'
        }} />
        
        {/* Ã¬ÂÂ­Ã¬ÂÂÃ¬ÂÂ  */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          transform: 'translateY(-50%)',
          width: '7px',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '0',
          transform: 'translateY(-50%)',
          width: '7px',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }} />
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1px',
          height: '7px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1px',
          height: '7px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }} />
        
        {/* Ã¬ÂÂ¸Ã«Â¶Â Ã¬ÂÂ */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '16px',
          height: '16px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%'
        }} />
      </div>
    );
  };
  
  return (
    <>
      {!gameStarted && !gameOver && renderStartScreen()}
      {gameOver && renderGameOverScreen()}
      {gameStarted && !gameOver && (
        <>
          {renderHUD()}
          {renderCrosshair()}
        </>
      )}
    </>
  );
};

export default UI;
