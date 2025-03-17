import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect } from "react";

const FpsMap = () => {
  // Ã«Â§Âµ Ã«ÂªÂ¨Ã«ÂÂ¸ Ã«Â¡ÂÃ«ÂÂ
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");
  
  // Ã«Â§Âµ Ã«ÂªÂ¨Ã«ÂÂ¸ Ã¬ÂÂ¤Ã¬Â Â
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Ã¬Â¶Â©Ã«ÂÂ ÃªÂ°ÂÃ¬Â§ÂÃ«Â¥Â¼ Ã¬ÂÂÃ­ÂÂ Ã¬ÂÂ¤Ã¬Â Â
          child.userData.isFloor = true;
        }
      });
      console.log("Ã«Â§Âµ Ã«ÂªÂ¨Ã«ÂÂ¸ Ã«Â¡ÂÃ«ÂÂ Ã¬ÂÂÃ«Â£Â");
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

// Ã«Â§Âµ Ã«ÂªÂ¨Ã«ÂÂ¸ Ã«Â¯Â¸Ã«Â¦Â¬ Ã«Â¡ÂÃ«ÂÂ
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");

export default FpsMap;
