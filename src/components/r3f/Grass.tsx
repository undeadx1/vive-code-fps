import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Assets from '../../assets.json';
import {
  GRASS_DENSITY,
  GRASS_CLUSTER_FACTOR,
  GRASS_WIND_STRENGTH,
  GRASS_COLOR,
  GRASS_HEIGHT
} from '../../constants/terrain';

interface GrassShaderProps {
  terrainWidth: number;
  terrainDepth: number;
  terrainHeightFunc: (x: number, z: number) => number;
  grassDensity?: number;
  grassHeight?: number;
  grassColor?: string;
  windStrength?: number;
  clusterFactor?: number;
  useProcedural?: boolean; 
  noiseScale?: number; 
  clusterThreshold?: number; 
}

export const Grass: React.FC<GrassShaderProps> = ({
  terrainWidth,
  terrainDepth,
  terrainHeightFunc,
  grassDensity = GRASS_DENSITY,
  grassHeight = GRASS_HEIGHT,
  grassColor = GRASS_COLOR,
  windStrength = GRASS_WIND_STRENGTH, 
  clusterFactor = GRASS_CLUSTER_FACTOR, 
  useProcedural = true,
  noiseScale = 0.15,
  clusterThreshold = 0.5,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const time = useRef(0);
  const initialized = useRef(false);

  // 최대 풀 개수 설정
  const MAX_GRASS = 1000000;
  const count = Math.min(
    MAX_GRASS,
    Math.floor(terrainWidth * terrainDepth * grassDensity)
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 풀 지오메트리 생성
  const grassGeometry = useMemo(() => {
    // 텍스처를 위한 더 넓은 평면 사용
    const geo = new THREE.PlaneGeometry(1, grassHeight, 1, 1);

    // 중심을 바닥으로 이동
    geo.translate(0, grassHeight / 2, 0);

    return geo;
  }, [grassHeight]);

  // 향상된 노이즈 함수 (더 자연스러운 분포)
  const noise2D = (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    // 더 복잡한 노이즈 패턴 (다중 주파수)
    const n1 =
      (Math.sin(X * 0.1 + Y * 0.2) * 0.5 + 0.5) *
      (Math.cos(X * 0.3 + Y * 0.1) * 0.5 + 0.5);
    const n2 =
      (Math.sin(X * 0.5 + Y * 0.3) * 0.5 + 0.5) *
      (Math.cos(X * 0.2 + Y * 0.6) * 0.5 + 0.5);

    // 노이즈 혼합
    return n1 * 0.7 + n2 * 0.3;
  };

  // 개선된 클러스터링 함수
  const shouldPlaceGrass = (x: number, z: number, clusterFactor: number) => {
    // 노이즈 스케일 적용 (더 큰 noiseScale은 더 작고 더 많은 클러스터 생성)
    const n = noise2D(x * noiseScale, z * noiseScale);

    // 개선된 임계값 로직
    // 더 큰 clusterFactor는 더 많은 풀 생성
    // clusterThreshold는 기본 임계값 (낮은 값은 더 많은 풀 생성)
    return n > clusterThreshold - clusterFactor * 0.05;
  };

  const [vertexShader, setVertexShader] = useState<string | null>(null);
  const [fragmentShader, setFragmentShader] = useState<string | null>(null);

  // 셰이더 로드
  useEffect(() => {
    const loadShaders = async () => {
      try {
        // 버텍스 셰이더 가져오기
        const vertexResponse = await fetch(Assets.shaders.grassVertex.url);
        const vertexCode = await vertexResponse.text();
        setVertexShader(vertexCode);

        // 프래그먼트 셰이더 가져오기
        const fragmentResponse = await fetch(Assets.shaders.grassFragment.url);
        const fragmentCode = await fragmentResponse.text();
        setFragmentShader(fragmentCode);
      } catch (error) {
        console.error("셰이더 로드 실패:", error);
      }
    };

    loadShaders();
  }, []);

  // 풀 배치 로직
  useEffect(() => {
    if (!meshRef.current || initialized.current || !vertexShader || !fragmentShader) return;

    console.log(
      `클러스터링 팩터 ${clusterFactor}와 노이즈 스케일 ${noiseScale}로 풀 배치 시작`
    );

    // 그리드 크기 계산 - 밀도에 따라 조정
    const densityFactor = Math.min(3, Math.max(1, grassDensity * 10)); // 높은 밀도는 더 상세한 그리드를 의미
    const gridSize = Math.ceil(Math.sqrt(count * densityFactor));
    const cellWidth = terrainWidth / gridSize;
    const cellDepth = terrainDepth / gridSize;

    let placedCount = 0;
    const halfWidth = terrainWidth / 2;
    const halfDepth = terrainDepth / 2;

    // 위치와 정보를 저장할 배열
    type GrassInstance = {
      position: THREE.Vector3;
      rotation: THREE.Euler;
      scale: THREE.Vector3;
      distanceToCamera: number;
    };

    const instances: GrassInstance[] = [];

    // 클러스터링 정보 추적
    let clusterCount = 0;
    let nonClusterCount = 0;

    // 높은 밀도를 위한 최적화된 간격
    const highDensity = grassDensity > 0.1;
    const skipFactor = highDensity ? 2 : 1; // 높은 밀도의 경우, 일부만 처리

    // 그리드 기반 배치 (두 패스)
    for (let pass = 0; pass < 2 && placedCount < count; pass++) {
      // 첫 번째 패스: 주요 클러스터링 (더 많은 풀)
      // 두 번째 패스: 빈 공간 채우기 (더 적은 풀)
      const currentClusterFactor =
        pass === 0 ? clusterFactor : clusterFactor * 0.3;

      // 높은 밀도의 경우, 첫 번째 패스에서 더 많은 풀 배치
      const targetCount =
        pass === 0 ? count * (highDensity ? 0.9 : 0.8) : count;

      for (
        let gz = 0;
        gz < gridSize && placedCount < targetCount;
        gz += skipFactor
      ) {
        for (
          let gx = 0;
          gx < gridSize && placedCount < targetCount;
          gx += skipFactor
        ) {
          // 위치 계산
          const baseX =
            (gx / gridSize) * terrainWidth - halfWidth + cellWidth / 2;
          const baseZ =
            (gz / gridSize) * terrainDepth - halfDepth + cellDepth / 2;

          // 랜덤 오프셋
          const randomOffset = 0.9;
          const offsetX = (Math.random() - 0.5) * cellWidth * randomOffset;
          const offsetZ = (Math.random() - 0.5) * cellDepth * randomOffset;

          // 최종 풀 위치
          const x = baseX + offsetX;
          const z = baseZ + offsetZ;

          // 개선된 클러스터링 적용
          const isInCluster = shouldPlaceGrass(x, z, currentClusterFactor);

          if (pass === 0) {
            // 첫 번째 패스: 클러스터에만 배치
            if (!isInCluster) continue;
            clusterCount++;
          } else {
            // 두 번째 패스: 비클러스터 영역에 드물게 배치
            if (isInCluster) {
              // 이미 클러스터에 있는 경우 높은 확률로 건너뛰기
              if (Math.random() < 0.9) continue;
            } else {
              // 비클러스터 영역에 낮은 확률로 배치
              if (Math.random() < 0.7) continue;
            }
            nonClusterCount++;
          }

          // 높이 계산
          let y = 0;
          try {
            const sampleX = x + halfWidth;
            const sampleZ = z + halfDepth;

            if (
              sampleX >= 0 &&
              sampleX <= terrainWidth &&
              sampleZ >= 0 &&
              sampleZ <= terrainDepth
            ) {
              y = terrainHeightFunc(sampleX, sampleZ);
            }
          } catch {
            continue;
          }

          if (isNaN(y) || y === undefined) {
            continue;
          }

          // 풀 속성 랜덤화
          const angle = Math.random() * (Math.PI * 0.5);

          // 스케일 제한: 0.5 - 1.0
          const uniformScale = 0.5 + Math.random() * 0.5;

          // 약간의 기울기 추가
          const tiltAngleX = (Math.random() - 0.5) * 0.5; // X축 기울기
          const tiltAngleZ = (Math.random() - 0.5) * 0.5; // Z축 기울기

          // 카메라까지의 거리 계산 (간단한 Z 깊이만 고려)
          const distanceToCamera = z + halfDepth; // 더 큰 Z는 카메라에서 더 멀다는 의미

          // 인스턴스 정보 저장
          instances.push({
            position: new THREE.Vector3(x, y, z),
            rotation: new THREE.Euler(tiltAngleX, angle, tiltAngleZ),
            scale: new THREE.Vector3(uniformScale, uniformScale, uniformScale),
            distanceToCamera,
          });

          placedCount++;

          // 진행 상황 로깅
          if (placedCount % 10000 === 0) {
            console.log(`${placedCount}/${count} 풀 인스턴스 배치 완료...`);
          }
        }
      }

      // 패스 완료 로깅
      console.log(
        `패스 ${pass + 1} 완료: ${pass === 0 ? clusterCount : nonClusterCount} 인스턴스 배치됨`
      );
    }

    console.log(`성공적으로 ${placedCount}개의 풀 배치 완료`);
    console.log(
      `클러스터링 통계: ${clusterCount}개 클러스터, ${nonClusterCount}개 분산`
    );

    // 깊이별로 인스턴스 정렬 (가장 먼 것부터 가장 가까운 것까지)
    instances.sort((a, b) => b.distanceToCamera - a.distanceToCamera);

    // 정렬된 순서로 매트릭스 설정
    instances.forEach((instance, i) => {
      dummy.position.copy(instance.position);
      dummy.rotation.copy(instance.rotation);
      dummy.scale.copy(instance.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.count = placedCount;
    meshRef.current.instanceMatrix.needsUpdate = true;
    initialized.current = true;
  }, [
    terrainWidth,
    terrainDepth,
    terrainHeightFunc,
    count,
    clusterFactor,
    useProcedural,
    noiseScale,
    clusterThreshold,
    vertexShader,
    fragmentShader
  ]);

  const grassColorObj = useMemo(
    () => new THREE.Color(grassColor),
    [grassColor]
  );

  // 유니폼 설정
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      grassColor: { value: grassColorObj },
      windStrength: { value: windStrength },
    }),
    [grassColorObj, windStrength]
  );

  // 애니메이션
  useFrame((state) => {
    time.current = state.clock.elapsedTime;
    if (meshRef.current && meshRef.current.material) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.time.value =
        time.current;
    }
  });

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  return (
    <instancedMesh
      ref={meshRef}
      args={[grassGeometry, undefined, count]}
      frustumCulled={false}
      renderOrder={2}
    >
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader} 
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
        depthWrite={true}
        depthTest={true}
        alphaTest={0.1}
        blending={THREE.NormalBlending}
      />
    </instancedMesh>
  );
};

export default Grass;
