import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three';
import Assets from '../../assets.json';

interface SkyboxProps {
  /** 스카이박스 유형 (sunset, rocky, sunny) */
  type?: 'sunset' | 'rocky' | 'sunny';
  /** 환경 조명 강도 */
  intensity?: number;
}

/**
 * HDR 스카이박스 컴포넌트
 * 
 * 특징:
 * - 고품질 HDR 환경 맵 사용
 * - 자연스러운 환경 조명 제공
 * - 다양한 스카이박스 옵션 지원
 */
export function Skybox({ type = 'sunset', intensity = 1.0 }: SkyboxProps) {
  const { gl, scene } = useThree();

  useEffect(() => {
    // HDR 로더 생성
    const pmremGenerator = new PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();

    // 스카이박스 URL 선택
    let skyboxUrl = '';
    switch (type) {
      case 'sunset':
        skyboxUrl = Assets.skyboxes.sunset.url;
        break;
      case 'rocky':
        skyboxUrl = Assets.skyboxes.rocky.url;
        break;
      case 'sunny':
        skyboxUrl = Assets.skyboxes.sunny.url;
        break;
      default:
        skyboxUrl = Assets.skyboxes.sunset.url;
    }

    // HDR 로딩 및 적용
    new RGBELoader()
      .load(skyboxUrl, (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        
        // 씬에 환경맵 적용
        scene.environment = envMap;
        scene.background = envMap;
        
        // 환경맵 강도 설정
        scene.environmentIntensity = intensity;
        
        // 리소스 해제
        texture.dispose();
        pmremGenerator.dispose();
      });

    // 컴포넌트 언마운트 시 정리
    return () => {
      scene.environment = null;
      scene.background = null;
    };
  }, [gl, scene, type, intensity]);

  return null;
}

export default Skybox;
