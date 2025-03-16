import { useGameStore } from "../stores/gameStore";

const UI = () => {
  const health = useGameStore((state) => state.health);
  const ammo = useGameStore((state) => state.ammo);
  const score = useGameStore((state) => state.score);
  const gameOver = useGameStore((state) => state.gameOver);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const resetGame = useGameStore((state) => state.resetGame);
  
  if (!gameStarted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">FPS 게임</h1>
          <p className="mb-8">시작하려면 아무 곳이나 클릭하세요</p>
          <p className="text-sm">WASD로 이동, Space로 점프, 마우스로 조준, 클릭으로 발사</p>
        </div>
      </div>
    );
  }
  
  if (gameOver) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">게임 오버</h1>
          <p className="text-2xl mb-8">최종 점수: {score}</p>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => {
              resetGame();
              window.location.reload(); // Reload to reset everything
            }}
          >
            다시 시작
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">
      <div className="flex items-center">
        <div className="mr-4">
          <div className="text-white text-sm">체력</div>
          <div className="w-40 h-4 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="text-white text-sm">탄약</div>
          <div className="text-white font-bold">{ammo}</div>
        </div>
      </div>
      
      <div className="text-white">
        <div className="text-sm">점수</div>
        <div className="text-xl font-bold">{score}</div>
      </div>
      
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 border-2 border-white rounded-full opacity-50" />
      </div>
    </div>
  );
};

export default UI;
