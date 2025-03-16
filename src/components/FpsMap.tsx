import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Box3, Vector3 } from "three";

const FpsMap = () => {
  const mapUrl = "https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb";
  const { scene } = useGLTF(mapUrl);
  const mapRef = useRef();

  useEffect(() => {
    // Configure shadow settings for all meshes in the scene
    scene.traverse((child) => {
      if (child.isObject3D) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });
  }, [scene]);

  // Calculate map center position for proper alignment
  const boundingBox = new Box3().setFromObject(scene);
  const center = new Vector3();
  boundingBox.getCenter(center);
  const adjustedPosition = new Vector3(-center.x, -center.y, -center.z);

  return (
    <group position={adjustedPosition}>
      <RigidBody
        type="fixed"
        colliders="trimesh"
        friction={1}
        restitution={0}
      >
        <primitive object={scene} ref={mapRef} />
      </RigidBody>
    </group>
  );
};

// Preload model to optimize initial loading
useGLTF.preload("https://agent8-games.verse8.io/assets/3D/map/fpsArena.glb");

export default FpsMap;
