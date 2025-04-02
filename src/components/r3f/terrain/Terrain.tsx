import { forwardRef, memo, useMemo, useEffect, useState, useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import {
  Group,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector2,
  TextureLoader,
  RepeatWrapping
} from 'three';
import Assets from '../../../assets.json';

/**
 * 지형 생성기 컴포넌트의 Props
 */
interface TerrainGeneratorProps {
  /** 지형 크기 (가로) */
  width?: number;
  /** 지형 크기 (세로) */
  depth?: number;
  /** 지형의 최대 높이 */
  maxHeight?: number;
  /** 지형 해상도 (가로) */
  widthSegments?: number;
  /** 지형 해상도 (세로) */
  depthSegments?: number;
  /** 지형의 물리적 마찰력 */
  friction?: number;
  /** 지형의 반발력 */
  restitution?: number;
  /** 지형 재질 색상 */
  color?: string;
  /** 텍스처 반복 횟수 */
  textureRepeat?: number;
  /** 생성된 높이맵 함수를 외부로 전달하는 콜백 */
  onHeightMapReady?: (heightFunc: (x: number, z: number) => number) => void;
}

/**
 * 간단한 지형 생성 컴포넌트
 * 
 * 이 컴포넌트는 기본적인 언덕과 계곡이 있는 지형을 생성합니다.
 */
export const Terrain = memo(
  forwardRef<Group, TerrainGeneratorProps>(
    (
      {
        width = 100,
        depth = 100,
        maxHeight = 10,
        widthSegments = 128,
        depthSegments = 128,
        friction = 1,
        restitution = 0,
        color = '#5d8a68',
        textureRepeat = 20,
        onHeightMapReady,
      },
      ref
    ) => {
      // 지형 메시 참조
      const [terrainMesh, setTerrainMesh] = useState<Mesh | null>(null);
      const groupRef = useRef<Group>(null);

      // 높이맵 생성 함수
      const generateHeightmap = useMemo(() => {
        return (x: number, z: number) => {
          // 좌표 정규화
          const normX = x / width;
          const normZ = z / depth;

          // 간단한 언덕 패턴 생성
          const height = 
            Math.sin(normX * Math.PI * 2) * 
            Math.cos(normZ * Math.PI * 2) * 
            maxHeight * 0.5;

          return height;
        };
      }, [width, depth, maxHeight]);

      // 텍스처 로딩
      const [baseTexture, normalTexture] = useMemo(() => {
        const textureLoader = new TextureLoader();
        
        // 기본 텍스처 로딩
        const baseMap = textureLoader.load(Assets.textures.terrainBase.url);
        baseMap.wrapS = RepeatWrapping;
        baseMap.wrapT = RepeatWrapping;
        baseMap.repeat.set(textureRepeat, textureRepeat);
        
        // 노말맵 로딩
        const normalMap = textureLoader.load(Assets.textures.terrainNormal.url);
        normalMap.wrapS = RepeatWrapping;
        normalMap.wrapT = RepeatWrapping;
        normalMap.repeat.set(textureRepeat, textureRepeat);
        
        return [baseMap, normalMap];
      }, [textureRepeat]);

      // 지형 메시 생성
      const terrain = useMemo(() => {
        const geometry = new PlaneGeometry(
          width,
          depth,
          widthSegments,
          depthSegments
        );

        geometry.rotateX(-Math.PI / 2);
        const vertices = geometry.attributes.position;

        // 높이값 설정
        for (let i = 0; i < vertices.count; i++) {
          const x = vertices.getX(i);
          const z = vertices.getZ(i);
          const y = generateHeightmap(x + width / 2, z + depth / 2);
          vertices.setY(i, y);
        }

        // 법선 벡터 재계산
        geometry.computeVertexNormals();

        // 재질 설정
        const material = new MeshStandardMaterial({
          color,
          map: baseTexture,
          normalMap: normalTexture,
          normalScale: new Vector2(1, 1),
          roughness: 0.8,
          metalness: 0.1,
          flatShading: false,
        });

        const mesh = new Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        return mesh;
      }, [
        width,
        depth,
        widthSegments,
        depthSegments,
        color,
        generateHeightmap,
        baseTexture,
        normalTexture
      ]);

      // 지형 메시 설정
      useEffect(() => {
        setTerrainMesh(terrain);
      }, [terrain]);

      // 높이맵 함수를 부모 컴포넌트에 전달
      useEffect(() => {
        if (onHeightMapReady) {
          onHeightMapReady(generateHeightmap);
        }
      }, [generateHeightmap, onHeightMapReady]);

      return (
        <group ref={ref || groupRef}>
          {terrainMesh && (
            <RigidBody
              type="fixed"
              colliders="trimesh"
              friction={friction}
              restitution={restitution}
            >
              <primitive object={terrainMesh} />
            </RigidBody>
          )}
        </group>
      );
    }
  )
);

Terrain.displayName = 'Terrain';

export default Terrain;
