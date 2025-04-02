import { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { calculatePositionOnTerrain, TerrainData } from '../terrain/TerrainUtils';

interface EnvironmentObjectProps {
  url: string;
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  terrainData?: TerrainData | null;
  yOffset?: number;
}

/**
 * 환경 오브젝트 컴포넌트
 * 
 * 지형 위에 나무, 바위 등의 환경 오브젝트를 배치합니다.
 */
export function EnvironmentObject({
  url,
  position,
  scale = 1,
  rotation = [0, 0, 0],
  terrainData = null,
  yOffset = 0
}: EnvironmentObjectProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(url);
  const [finalPosition, setFinalPosition] = useState<Vector3>(new Vector3(...position));
  
  // 위치 계산이 완료되었는지 추적하는 상태
  const [positionCalculated, setPositionCalculated] = useState(false);

  // 지형 데이터가 있으면 지형 높이에 맞게 위치 조정 (한 번만 실행)
  useEffect(() => {
    if (terrainData && !positionCalculated) {
      const calculatedPosition = calculatePositionOnTerrain(
        terrainData,
        position,
        yOffset
      );
      setFinalPosition(calculatedPosition);
      setPositionCalculated(true); // 위치 계산 완료 표시
    }
  }, [terrainData, position, yOffset, positionCalculated]);

  // 모델 복제 및 설정 (메모이제이션)
  const model = useRef(scene.clone()).current;

  return (
    <group 
      ref={groupRef} 
      position={[finalPosition.x, finalPosition.y, finalPosition.z]}
      rotation={[rotation[0], rotation[1], rotation[2]]}
      scale={scale}
    >
      <primitive object={model} />
    </group>
  );
}
