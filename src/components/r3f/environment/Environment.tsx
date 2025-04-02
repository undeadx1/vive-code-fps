import { useEffect, useState, useMemo } from 'react';
import { Environment as DreiEnvironment } from '@react-three/drei';
import { EnvironmentObject } from './EnvironmentObject';
import { TerrainData } from '../terrain/TerrainUtils';
import Assets from '../../../assets.json';

interface EnvironmentProps {
  terrainData: TerrainData | null;
  terrainWidth?: number;
  terrainDepth?: number;
}

/**
 * 환경 컴포넌트
 * 
 * 게임 환경을 설정하고 환경 오브젝트를 배치합니다.
 */
export function Environment({ 
  terrainData, 
  terrainWidth = 100, 
  terrainDepth = 100 
}: EnvironmentProps) {
  // 환경 오브젝트 데이터를 메모이제이션하여 재생성 방지
  const environmentObjectsData = useMemo(() => {
    if (!terrainData) return [];
    
    const objects = [];
    const halfWidth = terrainWidth / 2;
    const halfDepth = terrainDepth / 2;
    
    // 나무 배치 데이터
    const treeCount = 20;
    for (let i = 0; i < treeCount; i++) {
      // 시드 기반 랜덤 값 생성 (일관성 유지)
      const seed = i * 1000;
      const pseudoRandom1 = Math.sin(seed) * 0.5 + 0.5;
      const pseudoRandom2 = Math.cos(seed) * 0.5 + 0.5;
      const pseudoRandom3 = Math.sin(seed * 0.5) * 0.5 + 0.5;
      
      const x = (pseudoRandom1 - 0.5) * terrainWidth * 0.8;
      const z = (pseudoRandom2 - 0.5) * terrainDepth * 0.8;
      const scale = 0.8 + pseudoRandom3 * 0.4;
      const rotation = [0, pseudoRandom1 * Math.PI * 2, 0] as [number, number, number];
      
      objects.push({
        key: `tree-${i}`,
        url: Assets.objects.tree.url,
        position: [x, 0, z] as [number, number, number],
        scale,
        rotation,
        yOffset: 0
      });
    }
    
    // 바위 배치 데이터
    const rockCount = 15;
    for (let i = 0; i < rockCount; i++) {
      const seed = i * 2000;
      const pseudoRandom1 = Math.sin(seed) * 0.5 + 0.5;
      const pseudoRandom2 = Math.cos(seed) * 0.5 + 0.5;
      const pseudoRandom3 = Math.sin(seed * 0.5) * 0.5 + 0.5;
      
      const x = (pseudoRandom1 - 0.5) * terrainWidth * 0.9;
      const z = (pseudoRandom2 - 0.5) * terrainDepth * 0.9;
      const scale = 0.5 + pseudoRandom3 * 0.5;
      const rotation = [0, pseudoRandom1 * Math.PI * 2, 0] as [number, number, number];
      
      objects.push({
        key: `rock-${i}`,
        url: Assets.objects.rock.url,
        position: [x, 0, z] as [number, number, number],
        scale,
        rotation,
        yOffset: 0
      });
    }
    
    // 덤불 배치 데이터
    const bushCount = 30;
    for (let i = 0; i < bushCount; i++) {
      const seed = i * 3000;
      const pseudoRandom1 = Math.sin(seed) * 0.5 + 0.5;
      const pseudoRandom2 = Math.cos(seed) * 0.5 + 0.5;
      const pseudoRandom3 = Math.sin(seed * 0.5) * 0.5 + 0.5;
      
      const x = (pseudoRandom1 - 0.5) * terrainWidth * 0.9;
      const z = (pseudoRandom2 - 0.5) * terrainDepth * 0.9;
      const scale = 0.6 + pseudoRandom3 * 0.4;
      const rotation = [0, pseudoRandom1 * Math.PI * 2, 0] as [number, number, number];
      const bushType = pseudoRandom1 > 0.5 ? Assets.objects.bush.url : Assets.objects.bushWithFlowers.url;
      
      objects.push({
        key: `bush-${i}`,
        url: bushType,
        position: [x, 0, z] as [number, number, number],
        scale,
        rotation,
        yOffset: 0
      });
    }
    
    return objects;
  }, [terrainWidth, terrainDepth]); // terrainData는 의존성에서 제외하여 데이터가 변경되어도 오브젝트 위치가 재계산되지 않도록 함

  return (
    <>
      {/* 환경 설정 */}
      <DreiEnvironment
        files={Assets.environment.skybox.url}
        background={true}
      />
      
      {/* 환경 오브젝트 - terrainData가 있을 때만 렌더링 */}
      {terrainData && environmentObjectsData.map(obj => (
        <EnvironmentObject
          key={obj.key}
          url={obj.url}
          position={obj.position}
          scale={obj.scale}
          rotation={obj.rotation}
          terrainData={terrainData}
          yOffset={obj.yOffset}
        />
      ))}
    </>
  );
}
