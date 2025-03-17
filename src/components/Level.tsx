import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { Box3, Vector3 } from "three";

const Level = () => {
  const mapRef = useRef();
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");
  
  // Ã«Â§Âµ Ã«ÂªÂ¨Ã«ÂÂ¸ Ã­ÂÂ´Ã«Â¡Â  Ã¬ÂÂÃ¬ÂÂ± Ã«Â°Â Ã¬ÂÂ¤Ã¬Â Â
  useEffect(() => {
    if (scene) {
      // SkeletonUtilsÃ«Â¥Â¼ Ã¬ÂÂ¬Ã¬ÂÂ©Ã­ÂÂÃ¬ÂÂ¬ Ã«ÂªÂ¨Ã«ÂÂ¸ Ã­ÂÂ´Ã«Â¡Â  (Ã¬ÂÂ Ã«ÂÂÃ«Â©ÂÃ¬ÂÂ´Ã¬ÂÂÃ¬ÂÂ´ Ã¬ÂÂÃ«ÂÂ ÃªÂ²Â½Ã¬ÂÂ° Ã­ÂÂÃ¬ÂÂ)
      const clonedScene = SkeletonUtils.clone(scene);
      
      // ÃªÂ·Â¸Ã«Â¦Â¼Ã¬ÂÂ Ã¬ÂÂ¤Ã¬Â Â
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Ã«Â§Âµ Ã¬Â°Â¸Ã¬Â¡Â°Ã¬ÂÂ Ã­ÂÂ´Ã«Â¡Â Ã«ÂÂ Ã¬ÂÂ¬ Ã¬ÂÂ¤Ã¬Â Â
      if (mapRef.current) {
        // ÃªÂ¸Â°Ã¬Â¡Â´ Ã¬ÂÂÃ¬ÂÂ Ã¬ÂÂÃ¬ÂÂ Ã¬Â ÂÃªÂ±Â°
        while (mapRef.current.children.length > 0) {
          mapRef.current.remove(mapRef.current.children[0]);
        }
        
        // Ã¬ÂÂ Ã¬ÂÂ¬ Ã¬Â¶ÂÃªÂ°Â
        mapRef.current.add(clonedScene);
      }
    }
  }, [scene]);

  // Ã«Â§Âµ Ã¬Â¤ÂÃ¬ÂÂ¬ ÃªÂ³ÂÃ¬ÂÂ°
  const mapCenter = useRef(new Vector3(0, 0, 0));
  
  useEffect(() => {
    if (scene) {
      // Ã«Â§ÂµÃ¬ÂÂ Ã«Â°ÂÃ¬ÂÂ´Ã«ÂÂ© Ã«Â°ÂÃ¬ÂÂ¤ ÃªÂ³ÂÃ¬ÂÂ°
      const boundingBox = new Box3().setFromObject(scene);
      boundingBox.getCenter(mapCenter.current);
      
      console.log("Ã«Â§Âµ Ã¬Â¤ÂÃ¬ÂÂ¬ Ã¬ÂÂÃ¬Â¹Â:", mapCenter.current);
      console.log("Ã«Â§Âµ Ã­ÂÂ¬ÃªÂ¸Â°:", boundingBox.getSize(new Vector3()));
    }
  }, [scene]);

  return (
    <group>
      {/* 3D Ã«Â§Âµ Ã«ÂªÂ¨Ã«ÂÂ¸ */}
      <RigidBody 
        type="fixed" 
        colliders="trimesh"
        friction={1}
        restitution={0.2}
      >
        <group ref={mapRef} />
      </RigidBody>
      
      {/* Ã¬Â¶ÂÃªÂ°Â Ã«Â°ÂÃ«ÂÂ¥ Ã¬Â¶Â©Ã«ÂÂÃ¬Â²Â´ (Ã¬ÂÂÃ¬Â ÂÃ¬ÂÂ¥Ã¬Â¹Â) */}
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

// Ã«ÂªÂ¨Ã«ÂÂ¸ Ã­ÂÂÃ«Â¦Â¬Ã«Â¡ÂÃ«ÂÂ
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");

export default Level;
