import { forwardRef, memo, useMemo, useEffect, useState, useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import {
  Vector3,
  Group,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  TextureLoader,
  RepeatWrapping,
  Vector2,
} from 'three';
import { createNoise2D } from 'simplex-noise';
import seedrandom from 'seedrandom';
import Assets from '../../assets.json';
import {
  TERRAIN_WIDTH,
  TERRAIN_DEPTH,
  TERRAIN_MAX_HEIGHT,
  TERRAIN_WIDTH_SEGMENTS,
  TERRAIN_DEPTH_SEGMENTS,
  TERRAIN_SEED,
  TERRAIN_ROUGHNESS,
  TERRAIN_DETAIL,
  TERRAIN_COLOR,
  TERRAIN_TEXTURE_REPEAT,
  TERRAIN_NORMAL_SCALE
} from '../../constants/terrain';

/** TerrainGenerator 컴포넌트의 Props */
interface TerrainProps {
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
  /** 지형 생성에 사용할 시드 값 */
  seed?: string;
  /** 지형의 거칠기 (높을수록 더 거친 지형) */
  roughness?: number;
  /** 지형의 세부 사항 수준 (높을수록 더 세부적인 지형) */
  detail?: number;
  /** 지형의 물리적 마찰력 */
  friction?: number;
  /** 지형의 반발력 */
  restitution?: number;
  /** 지형 재질 색상 */
  color?: string;
  /** 텍스처 반복 횟수 */
  textureRepeat?: number;
  /** 노말맵 강도 */
  normalScale?: number;
  /** 디버깅 모드 활성화 */
  debug?: boolean;
  /** 생성된 높이맵 함수를 외부로 전달하는 콜백 */
  onHeightMapReady?: (heightFunc: (x: number, z: number) => number) => void;
}

/**
 * 높이맵 기반 자연 지형 생성 컴포넌트
 *
 * 특징:
 * - Simplex 노이즈를 사용한 자연스러운 지형 생성
 * - 시드 값 기반의 재현 가능한 랜덤 지형
 * - 물리 충돌 영역 자동 생성
 * - 다양한 커스터마이징 옵션
 */
export const Terrain = memo(
  forwardRef<Group, TerrainProps>(
    (
      {
        width = TERRAIN_WIDTH,
        depth = TERRAIN_DEPTH,
        maxHeight = TERRAIN_MAX_HEIGHT,
        widthSegments = TERRAIN_WIDTH_SEGMENTS,
        depthSegments = TERRAIN_DEPTH_SEGMENTS,
        seed = TERRAIN_SEED,
        roughness = TERRAIN_ROUGHNESS,
        detail = TERRAIN_DETAIL,
        friction = 1,
        restitution = 0,
        color = TERRAIN_COLOR,
        textureRepeat = TERRAIN_TEXTURE_REPEAT,
        normalScale = TERRAIN_NORMAL_SCALE,
        debug = false,
        onHeightMapReady,
      },
      ref
    ) => {
      // 지형 메시 참조
      const [terrainMesh, setTerrainMesh] = useState<Mesh | null>(null);
      const groupRef = useRef<Group>(null);

      // 시드 기반 노이즈 생성기 초기화
      const noiseGenerator = useMemo(() => {
        // seedrandom으로 랜덤 함수 생성
        const rng = seedrandom(seed);
        return createNoise2D(() => rng());
      }, [seed]);

      // 높이맵 생성 함수
      const generateHeightmap = useMemo(() => {
        return (x: number, z: number) => {
          const normX = x / width;
          const normZ = z / depth;

          // 1. 대규모 지형 생성 (언덕과 계곡)
          let baseHeight = 0;
          let frequency = 0.2; // 더 낮은 주파수로 시작 (더 넓은 언덕/계곡)
          let amplitude = 5;

          for (let i = 0; i < 5; i++) {
            // 더 적은 옥타브 (대형 지형에만 집중)
            baseHeight +=
              noiseGenerator(normX * frequency, normZ * frequency) * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
          }

          // 2. 세부 디테일 생성 (울퉁불퉁함)
          let detailHeight = 0;
          frequency = 1;
          amplitude = 0.1; // 디테일의 영향 감소

          for (let i = 0; i < detail; i++) {
            detailHeight +=
              noiseGenerator(normX * frequency, normZ * frequency) * amplitude;
            amplitude *= roughness;
            frequency *= 2;
          }

          // 3. 평지 생성 - 지수 함수로 높이 분포 조정
          baseHeight =
            Math.pow(Math.abs(baseHeight), 1.5) * Math.sign(baseHeight);

          // 4. 평지화 적용 - 낮은 값은 평평하게, 높은 값은 언덕으로
          const flatness = 0.3; // 평지화 강도 (높을수록 더 많은 평지)
          if (baseHeight < flatness) {
            baseHeight *= 0.3; // 낮은 지역은 더 평평하게
          }

          // 최종 높이 = 기본 지형 + 디테일 (디테일은 언덕에서만 더 강하게)
          const combinedHeight =
            baseHeight + detailHeight * (baseHeight * 0.5 + 0.5);

          // 최종 스케일링
          return (maxHeight * (combinedHeight + 1)) / 2;
        };
      }, [noiseGenerator, width, depth, maxHeight, roughness, detail]);

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

        // 높이값 부드럽게 보간
        for (let i = 0; i < vertices.count; i++) {
          const x = vertices.getX(i);
          const z = vertices.getZ(i);
          const y = generateHeightmap(x + width / 2, z + depth / 2);
          vertices.setY(i, y);
        }

        // 법선 벡터 재계산
        geometry.computeVertexNormals();

        // 텍스처 로더 생성
        const textureLoader = new TextureLoader();

        // 디퓨즈 텍스처 로딩
        const texture = textureLoader.load(Assets.textures.terrainBase.url);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(textureRepeat, textureRepeat);

        // 노말맵 텍스처 로딩
        const normalMap = textureLoader.load(Assets.textures.terrainNormal.url);
        normalMap.wrapS = RepeatWrapping;
        normalMap.wrapT = RepeatWrapping;
        normalMap.repeat.set(textureRepeat, textureRepeat);

        // 재질 설정에 텍스처와 노말맵 추가
        const material = new MeshStandardMaterial({
          color,
          map: texture,
          normalMap: normalMap,
          normalScale: new Vector2(normalScale, normalScale),
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
        textureRepeat,
        normalScale,
      ]);

      // 지형 메시 설정
      useEffect(() => {
        setTerrainMesh(terrain);
      }, [terrain]);

      // 높이맵 함수와 위치 정보를 부모 컴포넌트에 전달
      useEffect(() => {
        if (onHeightMapReady) {
          onHeightMapReady(generateHeightmap);
        }
      }, [generateHeightmap, onHeightMapReady]);

      return (
        <group ref={groupRef}>
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
