import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Assets from '../../../assets.json';
import { TerrainData } from './TerrainUtils';

interface GrassProps {
  terrainWidth: number;
  terrainDepth: number;
  terrainData: TerrainData;
  grassDensity?: number;
  grassHeight?: number;
  grassColor?: string;
  windStrength?: number;
  clusterFactor?: number;
  noiseScale?: number;
  clusterThreshold?: number;
}

/**
 * 셰이더 기반 풀 렌더링 컴포넌트
 * 
 * 지형에 맞춰 인스턴스 기반의 풀을 렌더링합니다.
 * 셰이더를 사용하여 바람에 흔들리는 효과와 자연스러운 분포를 구현합니다.
 */
export function Grass({
  terrainWidth,
  terrainDepth,
  terrainData,
  grassDensity = 15,
  grassHeight = 1.5,
  grassColor = '#7cba6b',
  windStrength = 0.3,
  clusterFactor = 8,
  noiseScale = 0.15,
  clusterThreshold = 0.5,
}: GrassProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const time = useRef(0);
  const initialized = useRef(false);
  
  // 셰이더 로딩 상태
  const [vertexShader, setVertexShader] = useState<string | null>(null);
  const [fragmentShader, setFragmentShader] = useState<string | null>(null);

  // 풀 인스턴스 수 계산
  const MAX_GRASS = 500000; // 최대 풀 개수 제한
  const count = Math.min(
    MAX_GRASS,
    Math.floor(terrainWidth * terrainDepth * grassDensity)
  );

  // 임시 오브젝트 생성 (인스턴스 행렬 설정용)
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 풀 지오메트리 생성
  const grassGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, grassHeight, 1, 1);
    geo.translate(0, grassHeight / 2, 0); // 중심을 바닥으로 이동
    return geo;
  }, [grassHeight]);

  // 간단한 노이즈 함수 (클러스터링용)
  const noise2D = (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    const n1 = (Math.sin(X * 0.1 + Y * 0.2) * 0.5 + 0.5) * 
               (Math.cos(X * 0.3 + Y * 0.1) * 0.5 + 0.5);
    const n2 = (Math.sin(X * 0.5 + Y * 0.3) * 0.5 + 0.5) * 
               (Math.cos(X * 0.2 + Y * 0.6) * 0.5 + 0.5);
    
    return n1 * 0.7 + n2 * 0.3;
  };

  // 풀 배치 결정 함수
  const shouldPlaceGrass = (x: number, z: number, clusterFactor: number) => {
    const n = noise2D(x * noiseScale, z * noiseScale);
    return n > clusterThreshold - clusterFactor * 0.05;
  };

  // 셰이더 로딩
  useEffect(() => {
    const loadShaders = async () => {
      try {
        // 버텍스 셰이더 로딩
        const vertexResponse = await fetch(Assets.shaders.grassVertex.url);
        const vertexCode = await vertexResponse.text();
        setVertexShader(vertexCode);

        // 프래그먼트 셰이더 로딩
        const fragmentResponse = await fetch(Assets.shaders.grassFragment.url);
        const fragmentCode = await fragmentResponse.text();
        setFragmentShader(fragmentCode);
      } catch (error) {
        console.error("셰이더 로딩 실패:", error);
      }
    };

    loadShaders();
  }, []);

  // 풀 배치 로직
  useEffect(() => {
    if (!meshRef.current || initialized.current || !vertexShader || !fragmentShader) return;

    console.log(`풀 배치 시작: 클러스터 팩터 ${clusterFactor}, 노이즈 스케일 ${noiseScale}`);

    // 그리드 크기 계산
    const densityFactor = Math.min(3, Math.max(1, grassDensity * 10));
    const gridSize = Math.ceil(Math.sqrt(count * densityFactor));
    const cellWidth = terrainWidth / gridSize;
    const cellDepth = terrainDepth / gridSize;

    let placedCount = 0;
    const halfWidth = terrainWidth / 2;
    const halfDepth = terrainDepth / 2;

    // 인스턴스 정보 저장 배열
    type GrassInstance = {
      position: THREE.Vector3;
      rotation: THREE.Euler;
      scale: THREE.Vector3;
      distanceToCamera: number;
    };

    const instances: GrassInstance[] = [];
    let clusterCount = 0;
    let nonClusterCount = 0;

    // 고밀도 최적화
    const highDensity = grassDensity > 0.1;
    const skipFactor = highDensity ? 2 : 1;

    // 두 패스로 풀 배치 (클러스터 + 분산)
    for (let pass = 0; pass < 2 && placedCount < count; pass++) {
      const currentClusterFactor = pass === 0 ? clusterFactor : clusterFactor * 0.3;
      const targetCount = pass === 0 ? count * (highDensity ? 0.9 : 0.8) : count;

      for (let gz = 0; gz < gridSize && placedCount < targetCount; gz += skipFactor) {
        for (let gx = 0; gx < gridSize && placedCount < targetCount; gx += skipFactor) {
          // 기본 위치 계산
          const baseX = (gx / gridSize) * terrainWidth - halfWidth + cellWidth / 2;
          const baseZ = (gz / gridSize) * terrainDepth - halfDepth + cellDepth / 2;

          // 랜덤 오프셋 추가
          const randomOffset = 0.9;
          const offsetX = (Math.random() - 0.5) * cellWidth * randomOffset;
          const offsetZ = (Math.random() - 0.5) * cellDepth * randomOffset;

          // 최종 풀 위치
          const x = baseX + offsetX;
          const z = baseZ + offsetZ;

          // 클러스터링 적용
          const isInCluster = shouldPlaceGrass(x, z, currentClusterFactor);

          if (pass === 0) {
            // 첫 패스: 클러스터에만 배치
            if (!isInCluster) continue;
            clusterCount++;
          } else {
            // 두번째 패스: 비클러스터 영역에 희소하게 배치
            if (isInCluster) {
              if (Math.random() < 0.9) continue;
            } else {
              if (Math.random() < 0.7) continue;
            }
            nonClusterCount++;
          }

          // 지형 높이 계산
          let y = 0;
          try {
            // 지형 높이 함수 사용
            y = terrainData.heightFunc(x, z);
          } catch {
            continue;
          }

          if (isNaN(y) || y === undefined) {
            continue;
          }

          // 풀 속성 랜덤화
          const angle = Math.random() * Math.PI * 2; // 회전
          const uniformScale = 0.5 + Math.random() * 0.5; // 크기
          
          // 약간의 기울기 추가
          const tiltAngleX = (Math.random() - 0.5) * 0.2;
          const tiltAngleZ = (Math.random() - 0.5) * 0.2;

          // 카메라까지 거리 계산 (간단한 Z 깊이만 고려)
          const distanceToCamera = z + halfDepth;

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
            console.log(`${placedCount}/${count} 풀 인스턴스 배치 중...`);
          }
        }
      }
    }

    console.log(`풀 배치 완료: ${placedCount}개 배치됨`);
    console.log(`클러스터링 통계: 클러스터 ${clusterCount}개, 분산 ${nonClusterCount}개`);

    // 깊이 기준 정렬 (가장 먼 것부터 가장 가까운 것 순)
    instances.sort((a, b) => b.distanceToCamera - a.distanceToCamera);

    // 정렬된 순서로 행렬 설정
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
    terrainData,
    count,
    clusterFactor,
    noiseScale,
    clusterThreshold,
    grassHeight,
    vertexShader,
    fragmentShader
  ]);

  // 풀 색상 객체 생성
  const grassColorObj = useMemo(() => new THREE.Color(grassColor), [grassColor]);

  // 셰이더 유니폼 설정
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      grassColor: { value: grassColorObj },
      windStrength: { value: windStrength },
    }),
    [grassColorObj, windStrength]
  );

  // 애니메이션 프레임 업데이트
  useFrame((state) => {
    time.current = state.clock.elapsedTime;
    if (meshRef.current && meshRef.current.material) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.time.value = time.current;
    }
  });

  // 셰이더가 로딩되지 않았으면 렌더링하지 않음
  if (!vertexShader || !fragmentShader) return null;

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
}
