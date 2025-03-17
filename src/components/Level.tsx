import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { Box3, Vector3 } from "three";

const Level = () => {
  const mapRef = useRef();
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");
  
  // ë§µ ëª¨ë¸ í´ë¡  ìì± ë° ì¤ì 
  useEffect(() => {
    if (scene) {
      // SkeletonUtilsë¥¼ ì¬ì©íì¬ ëª¨ë¸ í´ë¡  (ì ëë©ì´ìì´ ìë ê²½ì° íì)
      const clonedScene = SkeletonUtils.clone(scene);
      
      // ê·¸ë¦¼ì ì¤ì 
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // ë§µ ì°¸ì¡°ì í´ë¡ ë ì¬ ì¤ì 
      if (mapRef.current) {
        // ê¸°ì¡´ ìì ìì ì ê±°
        while (mapRef.current.children.length > 0) {
          mapRef.current.remove(mapRef.current.children[0]);
        }
        
        // ì ì¬ ì¶ê°
        mapRef.current.add(clonedScene);
      }
    }
  }, [scene]);

  // ë§µ ì¤ì¬ ê³ì°
  const mapCenter = useRef(new Vector3(0, 0, 0));
  
  useEffect(() => {
    if (scene) {
      // ë§µì ë°ì´ë© ë°ì¤ ê³ì°
      const boundingBox = new Box3().setFromObject(scene);
      boundingBox.getCenter(mapCenter.current);
      
      console.log("ë§µ ì¤ì¬ ìì¹:", mapCenter.current);
      console.log("ë§µ í¬ê¸°:", boundingBox.getSize(new Vector3()));
    }
  }, [scene]);

  return (
    <group>
      {/* 3D ë§µ ëª¨ë¸ */}
      <RigidBody 
        type="fixed" 
        colliders="trimesh"
        friction={1}
        restitution={0.2}
      >
        <group ref={mapRef} />
      </RigidBody>
      
      {/* ì¶ê° ë°ë¥ ì¶©ëì²´ (ìì ì¥ì¹) */}
      <RigidBody 
        type="fixed" 
        position={[0, -0.5, 0]}
        friction={1}
        restitution={0.2}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#111111" transparent opacity={0} />
        </mesh>
      </RigidBody>
    </group>
  );
};

// ëª¨ë¸ íë¦¬ë¡ë
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");

export default Level;
