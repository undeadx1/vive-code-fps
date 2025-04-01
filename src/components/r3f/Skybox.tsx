import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import Assets from '../../assets.json';

interface SkyboxProps {
  type?: 'sunset' | 'rocky' | 'sunny';
  intensity?: number;
}

export const Skybox: React.FC<SkyboxProps> = ({ 
  type = 'sunset',
  intensity = 1.0
}) => {
  const { scene } = useThree();
  
  useEffect(() => {
    // 배경색 설정
    scene.background = null;
    
    // 환경 설정
    return () => {
      scene.background = null;
    };
  }, [scene]);

  // 선택된 스카이박스 URL 가져오기
  const skyboxUrl = Assets.skyboxes[type]?.url || Assets.skyboxes.sunset.url;

  return (
    <Environment
      files={skyboxUrl}
      background={true}
      blur={0.05}
      intensity={intensity}
    />
  );
};

export default Skybox;
