import { useState, useEffect } from "react";

export const useKeyboardControls = () => {
  const [keys, setKeys] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    shoot: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") {
        setKeys((keys) => ({ ...keys, moveForward: true }));
      }
      if (e.code === "KeyS" || e.code === "ArrowDown") {
        setKeys((keys) => ({ ...keys, moveBackward: true }));
      }
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        setKeys((keys) => ({ ...keys, moveLeft: true }));
      }
      if (e.code === "KeyD" || e.code === "ArrowRight") {
        setKeys((keys) => ({ ...keys, moveRight: true }));
      }
      if (e.code === "Space") {
        setKeys((keys) => ({ ...keys, jump: true }));
      }
      if (e.code === "Mouse0" || e.code === "LeftMouseButton") {
        setKeys((keys) => ({ ...keys, shoot: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") {
        setKeys((keys) => ({ ...keys, moveForward: false }));
      }
      if (e.code === "KeyS" || e.code === "ArrowDown") {
        setKeys((keys) => ({ ...keys, moveBackward: false }));
      }
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        setKeys((keys) => ({ ...keys, moveLeft: false }));
      }
      if (e.code === "KeyD" || e.code === "ArrowRight") {
        setKeys((keys) => ({ ...keys, moveRight: false }));
      }
      if (e.code === "Space") {
        setKeys((keys) => ({ ...keys, jump: false }));
      }
      if (e.code === "Mouse0" || e.code === "LeftMouseButton") {
        setKeys((keys) => ({ ...keys, shoot: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys;
};
