import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FireballEffect } from './effects/FireballEffect';
import { Vector3 } from 'three';

interface Effect {
  id: number;
  position: Vector3;
  timeCreated: number;
  duration: number;
  scale?: number;
}

export const EffectsManager = forwardRef((props, ref) => {
  const [effects, setEffects] = useState<Effect[]>([]);
  const nextIdRef = useRef(0);

  // ì»´í¬ëí¸ ì¸ë¶ìì ì ê·¼í  ì ìë ë©ìë ë¸ì¶
  useImperativeHandle(ref, () => ({
    addFireballEffect: (position: Vector3, duration: number = 2000, scale: number = 1) => {
      const newEffect = {
        id: nextIdRef.current++,
        position,
        timeCreated: Date.now(),
        duration,
        scale
      };
      
      setEffects(prevEffects => [...prevEffects, newEffect]);
    }
  }));

  // ì¼ì  ìê° í ì¤ëë ì´íí¸ ì ê±°
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setEffects(prevEffects => 
        prevEffects.filter(effect => now - effect.timeCreated < effect.duration)
      );
    }, 1000); // 1ì´ë§ë¤ ì²´í¬

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {effects.map(effect => (
        <FireballEffect 
          key={effect.id}
          position={effect.position}
          scale={effect.scale}
          duration={effect.duration}
        />
      ))}
    </>
  );
});

export default EffectsManager;
