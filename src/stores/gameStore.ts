import { create } from 'zustand';

interface GameState {
  gameStarted: boolean;
  gameOver: boolean;
  health: number;
  ammo: number;
  score: number;
  setGameStarted: (started: boolean) => void;
  setGameOver: (over: boolean) => void;
  decreaseHealth: (amount: number) => void;
  increaseHealth: (amount: number) => void;
  decreaseAmmo: (amount: number) => void;
  increaseAmmo: (amount: number) => void;
  increaseScore: (amount: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameStarted: false,
  gameOver: false,
  health: 100,
  ammo: 30,
  score: 0,
  
  setGameStarted: (started) => set({ gameStarted: started }),
  
  setGameOver: (over) => set({ gameOver: over }),
  
  decreaseHealth: (amount) => set((state) => ({
    health: Math.max(0, state.health - amount),
    gameOver: state.health - amount <= 0 ? true : state.gameOver
  })),
  
  increaseHealth: (amount) => set((state) => ({
    health: Math.min(100, state.health + amount)
  })),
  
  decreaseAmmo: (amount) => set((state) => ({
    ammo: Math.max(0, state.ammo - amount)
  })),
  
  increaseAmmo: (amount) => set((state) => ({
    ammo: Math.min(30, state.ammo + amount)
  })),
  
  increaseScore: (amount) => set((state) => ({
    score: state.score + amount
  })),
  
  resetGame: () => set({
    gameStarted: false,
    gameOver: false,
    health: 100,
    ammo: 30,
    score: 0
  })
}));
