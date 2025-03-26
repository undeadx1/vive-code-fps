import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect } from "react";

const FpsMap = () => {
  // ÃÂ«ÃÂ§ÃÂµ ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ«ÃÂ¡ÃÂÃÂ«ÃÂÃÂ
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");
  
  // ÃÂ«ÃÂ§ÃÂµ ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ¬ÃÂÃÂ¤ÃÂ¬ÃÂ ÃÂ
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // ÃÂ¬ÃÂ¶ÃÂ©ÃÂ«ÃÂÃÂ ÃÂªÃÂ°ÃÂÃÂ¬ÃÂ§ÃÂÃÂ«ÃÂ¥ÃÂ¼ ÃÂ¬ÃÂÃÂÃÂ­ÃÂÃÂ ÃÂ¬ÃÂÃÂ¤ÃÂ¬ÃÂ ÃÂ
          child.userData.isFloor = true;
        }
      });
      console.log("ÃÂ«ÃÂ§ÃÂµ ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ«ÃÂ¡ÃÂÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ«ÃÂ£ÃÂ");
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

// ÃÂ«ÃÂ§ÃÂµ ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ«ÃÂ¯ÃÂ¸ÃÂ«ÃÂ¦ÃÂ¬ ÃÂ«ÃÂ¡ÃÂÃÂ«ÃÂÃÂ
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");

export default FpsMap;
