import { create } from 'zustand';

interface GameState {
  health: number;
  ammo: number;
  score: number;
  gameStarted: boolean;
  gameOver: boolean;
  decreaseHealth: (amount: number) => void;
  decreaseAmmo: (amount: number) => void;
  increaseScore: (amount: number) => void;
  setGameStarted: (started: boolean) => void;
  setGameOver: (over: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  health: 100,
  ammo: 100,
  score: 0,
  gameStarted: false,
  gameOver: false,
  
  decreaseHealth: (amount) => set((state) => ({ 
    health: Math.max(0, state.health - amount) 
  })),
  
  decreaseAmmo: (amount) => set((state) => ({ 
    ammo: Math.max(0, state.ammo - amount) 
  })),
  
  increaseScore: (amount) => set((state) => ({ 
    score: state.score + amount 
  })),
  
  setGameStarted: (started) => set({ gameStarted: started }),
  
  setGameOver: (over) => set({ gameOver: over }),
  
  resetGame: () => set({ 
    health: 100, 
    ammo: 100, 
    score: 0, 
    gameStarted: false, 
    gameOver: false 
  }),
}));
