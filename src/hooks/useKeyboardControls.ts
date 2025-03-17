import { useState, useEffect } from 'react';

export const useKeyboardControls = () => {
  const [keys, setKeys] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    shoot: false,
    run: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // í¤ ìë ¥ ì²ë¦¬
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setKeys(keys => ({ ...keys, moveForward: true }));
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setKeys(keys => ({ ...keys, moveBackward: true }));
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        setKeys(keys => ({ ...keys, moveLeft: true }));
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        setKeys(keys => ({ ...keys, moveRight: true }));
      }
      if (e.code === 'Space') {
        setKeys(keys => ({ ...keys, jump: true }));
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setKeys(keys => ({ ...keys, run: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // í¤ í´ì  ì²ë¦¬
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setKeys(keys => ({ ...keys, moveForward: false }));
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setKeys(keys => ({ ...keys, moveBackward: false }));
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        setKeys(keys => ({ ...keys, moveLeft: false }));
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        setKeys(keys => ({ ...keys, moveRight: false }));
      }
      if (e.code === 'Space') {
        setKeys(keys => ({ ...keys, jump: false }));
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setKeys(keys => ({ ...keys, run: false }));
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // ë§ì°ì¤ ì¼ìª½ ë²í¼ í´ë¦­ ì²ë¦¬
      if (e.button === 0) {
        setKeys(keys => ({ ...keys, shoot: true }));
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // ë§ì°ì¤ ì¼ìª½ ë²í¼ í´ì  ì²ë¦¬
      if (e.button === 0) {
        setKeys(keys => ({ ...keys, shoot: false }));
      }
    };

    // ì´ë²¤í¸ ë¦¬ì¤ë ë±ë¡
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // ì»´í¬ëí¸ ì¸ë§ì´í¸ ì ì´ë²¤í¸ ë¦¬ì¤ë ì ê±°
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return keys;
};
