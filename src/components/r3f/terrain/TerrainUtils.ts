import { Vector3 } from 'three';

/**
 * 지형 데이터 인터페이스
 */
export interface TerrainData {
  heightFunc: (x: number, z: number) => number;
}

/**
 * 지형 높이에 기반하여 오브젝트 위치를 계산하는 유틸리티 함수
 * 
 * 이 함수는 지형 데이터와 초기 위치를 기반으로 오브젝트의 최종 위치를 계산합니다.
 * 계산된 위치는 지형의 높이에 맞게 조정됩니다.
 */
export const calculatePositionOnTerrain = (
  terrain: TerrainData | null,
  initialPosition: [number, number, number] | [number, number] = [0, 0, 0],
  offset: number = 0
): Vector3 => {
  if (!terrain || !terrain.heightFunc) {
    console.warn('유효하지 않은 지형 데이터');
    return new Vector3(
      initialPosition[0], 
      initialPosition[1] || 0, 
      initialPosition[2] !== undefined ? initialPosition[2] : initialPosition[1] || 0
    );
  }

  const x = initialPosition[0];
  const z = initialPosition[2] !== undefined ? initialPosition[2] : initialPosition[1];
  
  // 지형 높이 계산 - 좌표 변환에 주의
  // 지형 함수는 지형 중심이 원점인 좌표계를 사용하므로 적절한 변환 필요
  const heightAtPosition = terrain.heightFunc(x, z);
  
  // 최종 위치 계산
  return new Vector3(
    x,
    heightAtPosition + offset,
    z
  );
};
