import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect } from "react";

const FpsMap = () => {
  // 맵 모델 로드
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");
  
  // 맵 모델 설정
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // 충돌 감지를 위한 설정
          child.userData.isFloor = true;
        }
      });
      console.log("맵 모델 로드 완료");
    }
  }, [scene]);
  
  return (
    <RigidBody 
      type="fixed" 
      colliders="trimesh" 
      friction={1}
      restitution={0.2}
    >
      <primitive object={scene} />
    </RigidBody>
  );
};

// 맵 모델 미리 로드
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");

export default FpsMap;
