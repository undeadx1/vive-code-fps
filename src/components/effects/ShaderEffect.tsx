import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Vector3,
  Mesh,
  Blending,
  Euler,
  Quaternion,
  ShaderMaterial,
  Vector2,
  Matrix4,
} from 'three';

interface ShaderEffectProps {
  position: Vector3;
  vertexShader: string;
  fragmentShader: string;
  uniforms?: Record<string, any>;
  scale?: number;
  color?: Color;
  opacity?: number;
  blending?: number;
  depthWrite?: boolean;
  depthTest?: boolean;
  duration?: number;
  fadeOut?: boolean;
  rotation?: Euler;
  normal?: Vector3;
  disableBillboard?: boolean;
  volume?: boolean;
  scaleAnimation?: {
    start: number;
    mid: number;
    end: number;
  };
  opacityAnimation?: {
    start: number;
    mid: number;
    end: number;
  };
}

export const ShaderEffect: React.FC<ShaderEffectProps> = ({
  position,
  vertexShader,
  fragmentShader,
  color = new Color(1, 1, 1),
  duration = 1000,
  scaleAnimation,
  opacityAnimation,
  fadeOut = true,
  normal,
  uniforms = {},
  disableBillboard = false,
  rotation,
  blending = AdditiveBlending,
  scale = 1,
  volume = false,
  depthWrite = false,
  depthTest = true,
}) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const [opacity, setOpacity] = useState(1);
  const [currentScale, setCurrentScale] = useState(scale);
  const [isVisible, setIsVisible] = useState(true);
  const timeRef = useRef(0);
  const { camera } = useThree();

  // Store quaternion for rotation based on normal vector
  const normalRotationRef = useRef<Quaternion | null>(null);

  // Calculate rotation towards the direction if normal vector is provided
  useEffect(() => {
    if (normal) {
      const upVector = new Vector3(0, 1, 0);
      const quaternion = new Quaternion();
      quaternion.setFromUnitVectors(upVector, normal.clone().normalize());
      normalRotationRef.current = quaternion;
      if (meshRef.current) {
        meshRef.current.quaternion.copy(quaternion);
      }
    }
  }, [normal, disableBillboard]);

  // useFrame for time updates and billboard effects
  useFrame((_, delta) => {
    // Update time
    timeRef.current += delta;

    if (!meshRef.current || !materialRef.current) return;

    // Update uniforms
    materialRef.current.uniforms.time.value = timeRef.current;
    materialRef.current.uniforms.opacity.value = opacity;

    // Update mesh
    meshRef.current.scale.set(currentScale, currentScale, currentScale);

    // Billboard effect (applied only when disableBillboard is false)
    if (!disableBillboard) {
      // Calculate direction vector from camera to mesh
      const dirToCam = camera.position.clone().sub(meshRef.current.position);

      // World up vector (Y-axis)
      const worldUp = new Vector3(0, 1, 0);

      // Calculate right vector using camera direction and world up vector (cross product)
      const right = new Vector3().crossVectors(dirToCam, worldUp).normalize();

      // Recalculate up vector using right vector and camera direction
      const up = new Vector3().crossVectors(right, dirToCam).normalize();

      // Create rotation matrix with three axes
      const rotationMatrix = new Matrix4().makeBasis(
        right,
        up,
        dirToCam.normalize().negate()
      );

      // Extract quaternion from rotation matrix
      const quaternion = new Quaternion().setFromRotationMatrix(rotationMatrix);

      // Apply quaternion to mesh
      meshRef.current.quaternion.copy(quaternion);

      // Apply Z-axis rotation (if rotation parameter exists)
      if (rotation) {
        // Create quaternion for Z-axis rotation
        const zRotation = new Quaternion().setFromAxisAngle(
          new Vector3(0, 0, 1), // Z-axis
          rotation.z // Rotation angle
        );

        // Apply Z-axis rotation to current quaternion
        meshRef.current.quaternion.multiply(zRotation);
      }
    } else if (normal && normalRotationRef.current) {
      meshRef.current.quaternion.copy(normalRotationRef.current);
      if (rotation) {
        const rotationQuat = new Quaternion();
        rotationQuat.setFromEuler(rotation);
        meshRef.current.quaternion.multiply(rotationQuat);
      }
    } else if (rotation) {
      meshRef.current.setRotationFromEuler(rotation);
    }
  });

  useEffect(() => {
    if (!meshRef.current) return;

    const startTime = Date.now();
    let animationFrameId: number;

    const updateEffect = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Scale animation
      if (scaleAnimation) {
        const { start, mid, end } = scaleAnimation;
        let newScale = scale;

        if (progress < 0.5) {
          const t = progress * 2;
          newScale = scale * (start + (mid - start) * t);
        } else {
          const t = (progress - 0.5) * 2;
          newScale = scale * (mid + (end - mid) * t);
        }

        setCurrentScale(newScale);
      }

      // Opacity animation
      if (opacityAnimation) {
        const { start, mid, end } = opacityAnimation;
        let newOpacity = 1;

        if (progress < 0.5) {
          const t = progress * 2;
          newOpacity = start + (mid - start) * t;
        } else {
          const t = (progress - 0.5) * 2;
          newOpacity = mid + (end - mid) * t;
        }

        setOpacity(newOpacity);
      }

      // Fade out
      if (fadeOut && progress > 0.7) {
        const fadeProgress = (progress - 0.7) / 0.3;
        setOpacity((prev) => Math.max(0, prev * (1 - fadeProgress)));
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateEffect);
      } else {
        setIsVisible(false);
      }
    };

    updateEffect();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration, scaleAnimation, opacityAnimation, fadeOut, scale]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.resolution.value.set(
          window.innerWidth,
          window.innerHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) return null;

  // Calculate offset from wall
  const offsetPosition = position.clone();
  if (normal) {
    // Move slightly forward in normal direction (0.1 units)
    offsetPosition.add(normal.clone().multiplyScalar(0.1));
  }

  // Modified shader properties
  const modifiedShaderProps = {
    vertexShader,
    fragmentShader,
    uniforms: {
      color: { value: color },
      opacity: { value: opacity },
      time: { value: 0 },
      resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
      ...uniforms,
    },
    transparent: true,
    side: DoubleSide,
    blending: blending as Blending,
    depthWrite,
    depthTest,
  };

  // Use volume rendering technique with multiple planes for 3D effect
  if (volume) {
    return (
      <mesh ref={meshRef} position={offsetPosition}>
        <group>
          {/* Base plane */}
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[1.05, 1.05]} />
            <shaderMaterial
              ref={materialRef}
              args={[
                {
                  ...modifiedShaderProps,
                  polygonOffset: true,
                  polygonOffsetFactor: -1,
                  polygonOffsetUnits: -1,
                },
              ]}
            />
          </mesh>

          {/* X-axis rotation plane */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[0.98, 0.98]} />
            <shaderMaterial
              args={[
                {
                  ...modifiedShaderProps,
                  polygonOffset: true,
                  polygonOffsetFactor: -2,
                  polygonOffsetUnits: -2,
                },
              ]}
            />
          </mesh>

          {/* Y-axis rotation plane */}
          <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[0.99, 0.99]} />
            <shaderMaterial
              args={[
                {
                  ...modifiedShaderProps,
                  polygonOffset: true,
                  polygonOffsetFactor: -3,
                  polygonOffsetUnits: -3,
                },
              ]}
            />
          </mesh>

          {/* Diagonal plane 1 */}
          <mesh rotation={[0, Math.PI / 4, Math.PI / 4]} position={[0, 0, 0.002]}>
            <planeGeometry args={[0.92, 0.92]} />
            <shaderMaterial
              args={[
                {
                  ...modifiedShaderProps,
                  polygonOffset: true,
                  polygonOffsetFactor: -4,
                  polygonOffsetUnits: -4,
                },
              ]}
            />
          </mesh>

          {/* Diagonal plane 2 */}
          <mesh rotation={[0, -Math.PI / 4, Math.PI / 4]} position={[0, 0, 0.002]}>
            <planeGeometry args={[0.9, 0.9]} />
            <shaderMaterial
              args={[
                {
                  ...modifiedShaderProps,
                  polygonOffset: true,
                  polygonOffsetFactor: -5,
                  polygonOffsetUnits: -5,
                },
              ]}
            />
          </mesh>
        </group>
      </mesh>
    );
  }

  // Simple plane rendering for non-volume effects
  return (
    <mesh ref={meshRef} position={offsetPosition}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={materialRef} args={[modifiedShaderProps]} />
    </mesh>
  );
};
