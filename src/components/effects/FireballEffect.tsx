import React from 'react';
import { Vector3, Color, AdditiveBlending, Vector2 } from 'three';
import { ShaderEffect } from './ShaderEffect';

interface FireballEffectProps {
  position: Vector3;
  scale?: number;
  normal?: Vector3;
  disableBillboard?: boolean;
  duration?: number;
}

export const FireballEffect: React.FC<FireballEffectProps> = ({ 
  position, 
  scale = 1, 
  normal, 
  disableBillboard = false,
  duration = 2000
}) => {
  // íì¼ í¨ê³¼ë¥¼ ìí íëê·¸ë¨¼í¸ ìì´ë
  const fireFragmentShader = /* glsl */ `
    uniform vec2 resolution;
    uniform float time;
    uniform float opacity;
    varying vec2 vUv;
    
    float customNoise(vec3 uv, float res) {
      const vec3 s = vec3(1e0, 1e2, 1e3);
      
      uv *= res;
      
      vec3 uv0 = floor(mod(uv, res))*s;
      vec3 uv1 = floor(mod(uv+vec3(1.), res))*s;
      
      vec3 f = fract(uv); f = f*f*(3.0-2.0*f);
      
      vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
                    uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);
      
      vec4 r = fract(sin(v*1e-1)*1e3);
      float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
      
      r = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);
      float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
      
      return mix(r0, r1, f.z)*2.-1.;
    }
    
    void main() {
      // ì¤ìì í¥í´ ì¢í ì¡°ì  (0.5, 0.5ê° ì¤ì)
      vec2 p = vUv - 0.5;
      
      // ìí ë§ì¤í¬ë¥¼ ìí ê±°ë¦¬ ê³ì°
      float dist = length(p);
      
      // í¨ê³¼ í¬ê¸° ì¡°ì  (ì«ìê° í´ìë¡ í¨ê³¼ í¬ê¸° ê°ì)
      float color = 3.0 - (3.*length(2.5*p));
      
      vec3 coord = vec3(atan(p.x,p.y)/6.2832+.5, length(p)*.4, .5);
      
      // ìê° ê¸°ë° ìì§ì ì¶ê°
      float t = time * 2.0; // ìê° ìë ì¡°ì 
      
      coord += vec3(0., t * -0.05, t * 0.01);
      
      for(int i = 1; i <= 7; i++) {
        float power = pow(2.0, float(i));
        color += (1.5 / power) * customNoise(coord, power*16.);
      }
      
      // íì¼ í¨ê³¼ë¥¼ ìí ìì ì¡°ì 
      vec3 fireColor = vec3(
        color * 1.8,                   // R
        pow(max(color,0.),2.)*0.4,     // G
        pow(max(color,0.),3.)*0.15     // B
      );
      
      // ê²½ê³ì ëí íë ì»·ì¤í
      float alpha = 1.0;
      
      // ìì ê°ì´ ìê³ê° ë¯¸ë§ì¸ ê²½ì° ìì í í¬ëª ì²ë¦¬ (íë ì£ì§)
      if (color < 0.05) {
        discard; // í½ì ìì  ì ê±°
      }
      
      // ê°ì¥ìë¦¬ íì´ë© ì²ë¦¬
      if (color < 0.3) {
        alpha = smoothstep(0.05, 0.3, color);
      }
      
      // ìí íì´ëìì - ê°ì¥ìë¦¬ìì ë¶ëë¬ì´ ì¬ë¼ì§
      if (dist > 0.4) {
        alpha *= smoothstep(0.5, 0.4, dist);
      }
      
      // ìê° ê¸°ë° ë¶í¬ëªë ì ëë©ì´ì
      // 0s ~ 0.5s: 0 -> 1 (íì´ë ì¸)
      // 0.5s ~ 1.5s: 1 (ìì  ë¶í¬ëª)
      // 1.5s ~ 2.0s: 1 -> 0 (íì´ë ìì)
      float timeBasedOpacity = 0.0;
      if (time < 0.5) {
        // íì´ë ì¸ (0s ~ 0.5s)
        timeBasedOpacity = smoothstep(0.0, 0.5, time);
      } else if (time < 1.5) {
        // ìì  ë¶í¬ëª êµ¬ê° (0.5s ~ 1.5s)
        timeBasedOpacity = 1.0;
      } else if (time < 2.0) {
        // íì´ë ìì (1.5s ~ 2.0s)
        timeBasedOpacity = 1.0 - smoothstep(1.5, 2.0, time);
      }
      
      // ìµì¢ ë¶í¬ëªëì ìê° ê¸°ë° ë¶í¬ëªë ì ì©
      alpha *= timeBasedOpacity * opacity;
      
      gl_FragColor = vec4(fireColor, alpha);
    }`;

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;

  return (
    <ShaderEffect
      position={position}
      vertexShader={vertexShader}
      fragmentShader={fireFragmentShader}
      scale={scale * 1.2}
      color={new Color(1, 1, 1)}
      duration={duration}
      blending={AdditiveBlending}
      normal={normal}
      disableBillboard={disableBillboard}
      depthWrite={false}
      volume={true}
      uniforms={{
        resolution: {
          value: new Vector2(window.innerWidth, window.innerHeight),
        },
        time: { value: 0 },
      }}     
      fadeOut={true}
    />
  );
};
