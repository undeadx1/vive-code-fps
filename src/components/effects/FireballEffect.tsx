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
  // 화염 효과를 위한 프래그먼트 쉐이더
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
      // 중앙을 향해 좌표 조정 (0.5, 0.5가 중앙)
      vec2 p = vUv - 0.5;
      
      // 원형 마스크를 위한 거리 계산
      float dist = length(p);
      
      // 효과 크기 조정 (숫자가 클수록 효과 크기 감소)
      float color = 3.0 - (3.*length(2.5*p));
      
      vec3 coord = vec3(atan(p.x,p.y)/6.2832+.5, length(p)*.4, .5);
      
      // 시간 기반 움직임 추가
      float t = time * 2.0; // 시간 속도 조절
      
      coord += vec3(0., t * -0.05, t * 0.01);
      
      for(int i = 1; i <= 7; i++) {
        float power = pow(2.0, float(i));
        color += (1.5 / power) * customNoise(coord, power*16.);
      }
      
      // 화염 효과를 위한 색상 조정
      vec3 fireColor = vec3(
        color * 1.8,                   // R
        pow(max(color,0.),2.)*0.4,     // G
        pow(max(color,0.),3.)*0.15     // B
      );
      
      // 경계에 대한 하드 컷오프
      float alpha = 1.0;
      
      // 색상 값이 임계값 미만인 경우 완전히 투명 처리 (하드 엣지)
      if (color < 0.05) {
        discard; // 픽셀 완전 제거
      }
      
      // 가장자리 페이딩 처리
      if (color < 0.3) {
        alpha = smoothstep(0.05, 0.3, color);
      }
      
      // 원형 페이드아웃 - 가장자리에서 부드러운 사라짐
      if (dist > 0.4) {
        alpha *= smoothstep(0.5, 0.4, dist);
      }
      
      // 시간 기반 불투명도 애니메이션
      // 0s ~ 0.5s: 0 -> 1 (페이드 인)
      // 0.5s ~ 1.5s: 1 (완전 불투명)
      // 1.5s ~ 2.0s: 1 -> 0 (페이드 아웃)
      float timeBasedOpacity = 0.0;
      if (time < 0.5) {
        // 페이드 인 (0s ~ 0.5s)
        timeBasedOpacity = smoothstep(0.0, 0.5, time);
      } else if (time < 1.5) {
        // 완전 불투명 구간 (0.5s ~ 1.5s)
        timeBasedOpacity = 1.0;
      } else if (time < 2.0) {
        // 페이드 아웃 (1.5s ~ 2.0s)
        timeBasedOpacity = 1.0 - smoothstep(1.5, 2.0, time);
      }
      
      // 최종 불투명도에 시간 기반 불투명도 적용
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
      scaleAnimation={{
        start: 0.8,
        mid: 1.2,
        end: 0.9
      }}
      opacityAnimation={{
        start: 0.6,
        mid: 1.0,
        end: 0.0
      }}
      fadeOut={true}
    />
  );
};
