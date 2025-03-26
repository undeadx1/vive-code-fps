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

  // 컴포넌트 외부에서 접근할 수 있는 메서드 노출
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

  // 일정 시간 후 오래된 이펙트 제거
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setEffects(prevEffects => 
        prevEffects.filter(effect => now - effect.timeCreated < effect.duration)
      );
    }, 1000); // 1초마다 체크

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
