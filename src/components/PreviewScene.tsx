import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Character } from "./character/Character";
import { CharacterResource } from "../types/characterResource";
import { Environment, OrbitControls } from "@react-three/drei";
import { CharacterAction } from "../constants/character.constant.ts";
import { Mesh, Vector3 } from "three";
import { EffectsManager } from "./EffectsManager";

// SceneContent 컴포넌트 - Canvas 내부에서 사용될 콘텐츠
const SceneContent = ({ 
  characterResource, 
  currentActionRef, 
  onAnimationComplete 
}) => {
  const characterGroupRef = useRef(null);
  const effectsManagerRef = useRef(null);

  // 캐릭터 주변에 원형으로 파이어볼 생성 (단일 원에 40개)
  const createCircularFireballPattern = useCallback(() => {
    if (!effectsManagerRef.current || !characterGroupRef.current) return;
    
    // 캐릭터 그룹의 월드 위치 가져오기
    const characterPosition = new Vector3();
    characterGroupRef.current.getWorldPosition(characterPosition);
    
    // 정확히 40개의 파이어볼을 단일 원 위에 배치
    const totalFireballs = 40;
    const radius = 2.5; // 원의 반지름
    const height = 0.5; // 모든 파이어볼의 동일한 높이
    
    for (let i = 0; i < totalFireballs; i++) {
      // 원 둘레를 따라 균등하게 분포
      const angle = (Math.PI * 2 / totalFireballs) * i;
      
      // 원의 좌표 계산
      const x = characterPosition.x + Math.cos(angle) * radius;
      const z = characterPosition.z + Math.sin(angle) * radius;
      
      // 파이어볼 위치
      const fireballPosition = new Vector3(x, characterPosition.y + height, z);
      
      // 순차적으로 생성 (5ms 간격으로 생성하여 약간의 시각적 효과 추가)
      setTimeout(() => {
        // 모든 파이어볼은 동일한 크기(원래 크기의 100%)
        effectsManagerRef.current.addFireballEffect(fireballPosition, 1800, 1.0);
      }, i * 5);
    }
  }, []);

  // 캔버스 내부 이벤트 처리
  const handleCanvasClick = useCallback(() => {
    createCircularFireballPattern();
  }, [createCircularFireballPattern]);

  return (
    <>
      {/* Simple ambient light for base illumination */}
      <ambientLight intensity={0.7} />

      {/* Main directional light with shadows */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Environment map for nice reflections */}
      <Environment preset="sunset" background={false} />

      {/* 전체 캔버스에 클릭 이벤트를 위한 투명한 평면 */}
      <mesh position={[0, 0, -10]} onClick={handleCanvasClick}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Character group */}
      <group 
        ref={characterGroupRef}
        scale={2} 
        position={[0, -1.75, 0]}
      >
        <Character
          characterResource={characterResource}
          currentActionRef={currentActionRef}
          onAnimationComplete={onAnimationComplete}
        />
      </group>

      {/* Effects manager for fireball effects */}
      <EffectsManager ref={effectsManagerRef} />

      {/* Simple camera controls */}
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
    </>
  );
};

/**
 * Simple 3D character preview scene
 */
const PreviewScene: React.FC = () => {
  const [currentAction, setCurrentAction] = useState<CharacterAction>(
    CharacterAction.IDLE
  );
  const currentActionRef = useRef<CharacterAction>(CharacterAction.IDLE);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Update currentActionRef when currentAction state changes
  useEffect(() => {
    currentActionRef.current = currentAction;
  }, [currentAction]);

  // Handle animation completion
  const handleAnimationComplete = useCallback((action: CharacterAction) => {
    console.log(`Animation ${action} completed`);

    // Transition to appropriate next state after animation completion
    switch (action) {
      case CharacterAction.JUMP_UP:
        // Transition to FALL_IDLE after JUMP_UP animation completes
        console.log("Transitioning from JUMP_UP to FALL_IDLE");
        setCurrentAction(CharacterAction.FALL_IDLE);
        break;

      case CharacterAction.FALL_DOWN:
        // Transition to IDLE after FALL_DOWN animation completes
        console.log("Transitioning from FALL_DOWN to IDLE");
        setCurrentAction(CharacterAction.IDLE);
        break;

      default:
        // Do nothing by default
        break;
    }
  }, []);

  const characterResource: CharacterResource = useMemo(
    () => ({
      name: "Default Character",
      url: "https://agent8-games.verse8.io/assets/3d/characters/space-marine.glb",
      animations: {
        IDLE: "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/idle.glb",
        WALK: "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/walk.glb",
        RUN: "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/run.glb",
        JUMP_UP:
          "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/jump-up.glb",
        FALL_IDLE:
          "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/fall-idle.glb",
        FALL_DOWN:
          "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/fall-down.glb",
        PUNCH:
          "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/punch.glb",
        MELEE_ATTACK:
          "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/melee-attack.glb",
        AIM: "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/aimming.glb",
        SHOOT:
          "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/shoot.glb",
        AIM_RUN:
          "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/shoot-run.glb",
        HIT: "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/hit.glb",
        DIE: "https://agent8-games.verse8.io/assets/3d/animations/mixamorig/death.glb",
      },
    }),
    []
  );

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        ref={canvasRef}
        style={{
          width: "800px",
          height: "450px",
          backgroundColor: "#2b2b2b",
          marginBottom: "20px",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          cursor: "pointer",
        }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} shadows>
          <SceneContent 
            characterResource={characterResource}
            currentActionRef={currentActionRef}
            onAnimationComplete={handleAnimationComplete}
          />
        </Canvas>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        {Object.values(CharacterAction)
          .filter((action) => typeof action === "string")
          .map((action) => (
            <button
              key={action}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  currentAction === action ? "#2980b9" : "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => setCurrentAction(action as CharacterAction)}
            >
              {action}
            </button>
          ))}
      </div>
      <p style={{ marginTop: "10px", color: "#555", textAlign: "center" }}>
        화면을 클릭하면 캐릭터 주변에 40개의 파이어볼이 원형으로 생성됩니다.
      </p>
    </div>
  );
};

export default PreviewScene;
