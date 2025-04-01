// 지형 크기 설정
export const TERRAIN_WIDTH = 100;
export const TERRAIN_DEPTH = 100;
export const TERRAIN_HEIGHT_SCALE = 10;
export const TERRAIN_RESOLUTION = 128;

// 노이즈 설정
export const TERRAIN_NOISE_SCALE = 0.03;
export const TERRAIN_NOISE_OCTAVES = 6;
export const TERRAIN_NOISE_PERSISTENCE = 0.5;
export const TERRAIN_NOISE_LACUNARITY = 2.0;
export const TERRAIN_SEED = "terrain123";

// 지형 세부 설정
export const TERRAIN_MAX_HEIGHT = 15;
export const TERRAIN_WIDTH_SEGMENTS = 128;
export const TERRAIN_DEPTH_SEGMENTS = 128;
export const TERRAIN_ROUGHNESS = 0.6;
export const TERRAIN_DETAIL = 4;
export const TERRAIN_COLOR = "#8B7355"; // 지형 기본 색상
export const TERRAIN_TEXTURE_REPEAT = 8; // 텍스처 반복 횟수
export const TERRAIN_NORMAL_SCALE = 1.0; // 노말맵 강도

// 플레이어 설정
export const PLAYER_HEIGHT_OFFSET = 5; // 플레이어 시작 높이 (지형 위)
export const PLAYER_WALK_SPEED = 5.0; // 걷기 속도 (기본값보다 빠르게)
export const PLAYER_RUN_SPEED = 10.0; // 달리기 속도 (기본값보다 빠르게)

// 풀 설정
export const GRASS_DENSITY = 20.05; // 풀 밀도 (낮을수록 성능 좋음)
export const GRASS_CLUSTER_FACTOR = 10.7; // 클러스터링 강도 (높을수록 더 많은 클러스터)
export const GRASS_WIND_STRENGTH = 0.8; // 바람 강도
export const GRASS_COLOR = "#4d8a3d"; // 풀 색상
export const GRASS_HEIGHT = 1.0; // 풀 높이
