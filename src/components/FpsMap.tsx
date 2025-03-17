import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect } from "react";

const FpsMap = () => {
  // ë§µ ëª¨ë¸ ë¡ë
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");
  
  // ë§µ ëª¨ë¸ ì¤ì 
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // ì¶©ë ê°ì§ë¥¼ ìí ì¤ì 
          child.userData.isFloor = true;
        }
      });
      console.log("ë§µ ëª¨ë¸ ë¡ë ìë£");
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

// ë§µ ëª¨ë¸ ë¯¸ë¦¬ ë¡ë
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");

export default FpsMap;
