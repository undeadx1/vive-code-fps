import { useRef, useState, useEffect } from 'react';
import { Physics } from '@react-three/rapier';
import { KeyboardControls } from '@react-three/drei';
import { Player } from './Player';
import { CharacterState } from '../../constants/character';
import { FreeViewController, ControllerHandle } from 'vibe-starter-3d';
import { keyboardMap } from '../../constants/controls';
import { Lights } from './Lights';
import { Terrain } from './terrain/Terrain';
import { Grass } from './terrain/Grass';
import { Environment } from './environment/Environment';
import { TerrainData } from './terrain/TerrainUtils';
import { Vector3 } from 'three';

export function Experience() {
  // 물리 엔진 지연 활성화
  const [pausedPhysics, setPausedPhysics] = useState(true);
  
  // 지형 데이터 상태
  const [terrainData, setTerrainData] = useState<TerrainData | null>(null);
  
  // 플레이어 초기 위치
  const [playerPosition, setPlayerPosition] = useState<Vector3>(new Vector3(0, 5, 0));
  
  // 컨트롤러 참조
  const controllerRef = useRef<ControllerHandle>(null);
  
  // 지형 크기 설정
  const terrainWidth = 100;
  const terrainDepth = 100;
  const terrainMaxHeight = 10;
  
  // 캐릭터 높이 설정
  const targetHeight = 1.6;
  
  // 지형 데이터 설정 완료 여부
  const [terrainReady, setTerrainReady] = useState(false);

  // 물리 엔진 지연 활성화
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPausedPhysics(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  // 지형 데이터가 준비되면 플레이어 위치 계산 (한 번만 실행)
  useEffect(() => {
    if (terrainData && !terrainReady) {
      // 플레이어를 지형 중앙에 배치
      const x = 0;
      const z = 0;
      
      // 지형 높이 계산
      const heightAtPosition = terrainData.heightFunc(x, z);
      
      // 플레이어 위치 설정 (높이에 오프셋 추가)
      setPlayerPosition(new Vector3(x, heightAtPosition + 2, z));
      setTerrainReady(true); // 지형 준비 완료 표시
    }
  }, [terrainData, terrainReady]);

  // 지형 높이맵 준비 핸들러
  const handleHeightMapReady = (heightFunc: (x: number, z: number) => number) => {
    if (!terrainData) {
      setTerrainData({ heightFunc });
    }
  };

  return (
    <>
      <Lights />

      <Physics debug={false} paused={pausedPhysics}>
        {/* 키보드 컨트롤 설정 */}
        <KeyboardControls map={keyboardMap}>
          {/* 지형 생성 */}
          <Terrain
            width={terrainWidth}
            depth={terrainDepth}
            maxHeight={terrainMaxHeight}
            onHeightMapReady={handleHeightMapReady}
          />
          
          {/* 풀 시스템 - 지형 데이터가 있을 때만 렌더링 */}
          {terrainData && (
            <Grass
              terrainWidth={terrainWidth}
              terrainDepth={terrainDepth}
              terrainData={terrainData}
              grassDensity={15}
              grassHeight={1.5}
              grassColor="#7cba6b"
              windStrength={0.3}
              clusterFactor={8}
            />
          )}
          
          {/* 환경 설정 */}
          {terrainData && (
            <Environment 
              terrainData={terrainData}
              terrainWidth={terrainWidth}
              terrainDepth={terrainDepth}
            />
          )}

          {/* 플레이어 캐릭터와 컨트롤러 */}
          <FreeViewController
            ref={controllerRef}
            targetHeight={targetHeight}
            position={[playerPosition.x, playerPosition.y, playerPosition.z]}
          >
            <Player 
              initState={CharacterState.IDLE} 
              controllerRef={controllerRef} 
              targetHeight={targetHeight} 
            />
          </FreeViewController>
        </KeyboardControls>
      </Physics>
    </>
  );
}
