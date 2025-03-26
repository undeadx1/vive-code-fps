import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { Box3, Vector3 } from "three";

const Level = () => {
  const mapRef = useRef();
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");
  
  // ÃÂ«ÃÂ§ÃÂµ ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ­ÃÂÃÂ´ÃÂ«ÃÂ¡ÃÂ  ÃÂ¬ÃÂÃÂÃÂ¬ÃÂÃÂ± ÃÂ«ÃÂ°ÃÂ ÃÂ¬ÃÂÃÂ¤ÃÂ¬ÃÂ ÃÂ
  useEffect(() => {
    if (scene) {
      // SkeletonUtilsÃÂ«ÃÂ¥ÃÂ¼ ÃÂ¬ÃÂÃÂ¬ÃÂ¬ÃÂÃÂ©ÃÂ­ÃÂÃÂÃÂ¬ÃÂÃÂ¬ ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ­ÃÂÃÂ´ÃÂ«ÃÂ¡ÃÂ  (ÃÂ¬ÃÂÃÂ ÃÂ«ÃÂÃÂÃÂ«ÃÂ©ÃÂÃÂ¬ÃÂÃÂ´ÃÂ¬ÃÂÃÂÃÂ¬ÃÂÃÂ´ ÃÂ¬ÃÂÃÂÃÂ«ÃÂÃÂ ÃÂªÃÂ²ÃÂ½ÃÂ¬ÃÂÃÂ° ÃÂ­ÃÂÃÂÃÂ¬ÃÂÃÂ)
      const clonedScene = SkeletonUtils.clone(scene);
      
      // ÃÂªÃÂ·ÃÂ¸ÃÂ«ÃÂ¦ÃÂ¼ÃÂ¬ÃÂÃÂ ÃÂ¬ÃÂÃÂ¤ÃÂ¬ÃÂ ÃÂ
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // ÃÂ«ÃÂ§ÃÂµ ÃÂ¬ÃÂ°ÃÂ¸ÃÂ¬ÃÂ¡ÃÂ°ÃÂ¬ÃÂÃÂ ÃÂ­ÃÂÃÂ´ÃÂ«ÃÂ¡ÃÂ ÃÂ«ÃÂÃÂ ÃÂ¬ÃÂÃÂ¬ ÃÂ¬ÃÂÃÂ¤ÃÂ¬ÃÂ ÃÂ
      if (mapRef.current) {
        // ÃÂªÃÂ¸ÃÂ°ÃÂ¬ÃÂ¡ÃÂ´ ÃÂ¬ÃÂÃÂÃÂ¬ÃÂÃÂ ÃÂ¬ÃÂÃÂÃÂ¬ÃÂÃÂ ÃÂ¬ÃÂ ÃÂÃÂªÃÂ±ÃÂ°
        while (mapRef.current.children.length > 0) {
          mapRef.current.remove(mapRef.current.children[0]);
        }
        
        // ÃÂ¬ÃÂÃÂ ÃÂ¬ÃÂÃÂ¬ ÃÂ¬ÃÂ¶ÃÂÃÂªÃÂ°ÃÂ
        mapRef.current.add(clonedScene);
      }
    }
  }, [scene]);

  // ÃÂ«ÃÂ§ÃÂµ ÃÂ¬ÃÂ¤ÃÂÃÂ¬ÃÂÃÂ¬ ÃÂªÃÂ³ÃÂÃÂ¬ÃÂÃÂ°
  const mapCenter = useRef(new Vector3(0, 0, 0));
  
  useEffect(() => {
    if (scene) {
      // ÃÂ«ÃÂ§ÃÂµÃÂ¬ÃÂÃÂ ÃÂ«ÃÂ°ÃÂÃÂ¬ÃÂÃÂ´ÃÂ«ÃÂÃÂ© ÃÂ«ÃÂ°ÃÂÃÂ¬ÃÂÃÂ¤ ÃÂªÃÂ³ÃÂÃÂ¬ÃÂÃÂ°
      const boundingBox = new Box3().setFromObject(scene);
      boundingBox.getCenter(mapCenter.current);
      
      console.log("ÃÂ«ÃÂ§ÃÂµ ÃÂ¬ÃÂ¤ÃÂÃÂ¬ÃÂÃÂ¬ ÃÂ¬ÃÂÃÂÃÂ¬ÃÂ¹ÃÂ:", mapCenter.current);
      console.log("ÃÂ«ÃÂ§ÃÂµ ÃÂ­ÃÂÃÂ¬ÃÂªÃÂ¸ÃÂ°:", boundingBox.getSize(new Vector3()));
    }
  }, [scene]);

  return (
    <group>
      {/* 3D ÃÂ«ÃÂ§ÃÂµ ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ */}
      <RigidBody 
        type="fixed" 
        colliders="trimesh"
        friction={1}
        restitution={0.2}
      >
        <group ref={mapRef} />
      </RigidBody>
      
      {/* ÃÂ¬ÃÂ¶ÃÂÃÂªÃÂ°ÃÂ ÃÂ«ÃÂ°ÃÂÃÂ«ÃÂÃÂ¥ ÃÂ¬ÃÂ¶ÃÂ©ÃÂ«ÃÂÃÂÃÂ¬ÃÂ²ÃÂ´ (ÃÂ¬ÃÂÃÂÃÂ¬ÃÂ ÃÂÃÂ¬ÃÂÃÂ¥ÃÂ¬ÃÂ¹ÃÂ) */}
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

// ÃÂ«ÃÂªÃÂ¨ÃÂ«ÃÂÃÂ¸ ÃÂ­ÃÂÃÂÃÂ«ÃÂ¦ÃÂ¬ÃÂ«ÃÂ¡ÃÂÃÂ«ÃÂÃÂ
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");

export default Level;
