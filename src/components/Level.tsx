import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { Box3, Vector3 } from "three";

const Level = () => {
  const mapRef = useRef();
  const { scene } = useGLTF("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");
  
  // 맵 모델 클론 생성 및 설정
  useEffect(() => {
    if (scene) {
      // SkeletonUtils를 사용하여 모델 클론 (애니메이션이 있는 경우 필요)
      const clonedScene = SkeletonUtils.clone(scene);
      
      // 그림자 설정
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // 맵 참조에 클론된 씬 설정
      if (mapRef.current) {
        // 기존 자식 요소 제거
        while (mapRef.current.children.length > 0) {
          mapRef.current.remove(mapRef.current.children[0]);
        }
        
        // 새 씬 추가
        mapRef.current.add(clonedScene);
      }
    }
  }, [scene]);

  // 맵 중심 계산
  const mapCenter = useRef(new Vector3(0, 0, 0));
  
  useEffect(() => {
    if (scene) {
      // 맵의 바운딩 박스 계산
      const boundingBox = new Box3().setFromObject(scene);
      boundingBox.getCenter(mapCenter.current);
      
      console.log("맵 중심 위치:", mapCenter.current);
      console.log("맵 크기:", boundingBox.getSize(new Vector3()));
    }
  }, [scene]);

  return (
    <group>
      {/* 3D 맵 모델 */}
      <RigidBody 
        type="fixed" 
        colliders="trimesh"
        friction={1}
        restitution={0.2}
      >
        <group ref={mapRef} />
      </RigidBody>
      
      {/* 추가 바닥 충돌체 (안전장치) */}
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

// 모델 프리로드
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");

export default Level;
