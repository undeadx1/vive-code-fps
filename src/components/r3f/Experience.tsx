import { useRef, useState, useEffect } from 'react';
import { Physics } from '@react-three/rapier';
import { Environment, KeyboardControls } from '@react-three/drei';
import { Player } from './Player';
import { CharacterState } from '../../constants/character';
import { FreeViewController, ControllerHandle } from 'vibe-starter-3d';
import { keyboardMap } from '../../constants/controls';
import { Lights } from './Lights';
import { Terrain } from './Terrain';
import { Grass } from './Grass';
import { Skybox } from './Skybox';
import { 
  TERRAIN_WIDTH, 
  TERRAIN_DEPTH,
  PLAYER_HEIGHT_OFFSET,
  PLAYER_WALK_SPEED,
  PLAYER_RUN_SPEED
} from '../../constants/terrain';

export function Experience() {
  // 물리 활성화 지연
  const [pausedPhysics, setPausedPhysics] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPausedPhysics(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const controllerRef = useRef<ControllerHandle>(null);
  
  // 지형 높이맵 함수 저장
  const [terrainData, setTerrainData] = useState<{
    heightFunc: (x: number, z: number) => number;
  } | null>(null);

  // 플레이어 초기 위치 설정
  const initialPlayerPosition = [0, PLAYER_HEIGHT_OFFSET, 0];

  return (
    <>
      <Skybox type="sunset" intensity={1.0} />
      <Lights />

      <Physics debug={false} paused={pausedPhysics}>
        {/* 키보드 프리셋 */}
        <KeyboardControls map={keyboardMap}>
          {/* 환경 */}
          <Environment preset="sunset" background={false} />

          {/* 지형 */}
          <Terrain
            onHeightMapReady={(heightFunc) => setTerrainData({ heightFunc })}
          />

          {/* 플레이어 캐릭터와 컨트롤러 */}
          <FreeViewController
            ref={controllerRef}
            position={initialPlayerPosition}
            capsuleRadius={0.4}
            capsuleHeight={1.8}
            walkSpeed={PLAYER_WALK_SPEED}
            runSpeed={PLAYER_RUN_SPEED}
          >
            <Player 
              initState={CharacterState.IDLE} 
              controllerRef={controllerRef} 
              targetHeight={1.8}
            />
          </FreeViewController>
        </KeyboardControls>

        {/* 풀 렌더링 */}
        {terrainData && (
          <Grass
            terrainWidth={TERRAIN_WIDTH}
            terrainDepth={TERRAIN_DEPTH}
            terrainHeightFunc={terrainData.heightFunc}
          />
        )}
      </Physics>
    </>
  );
}
