import { useThree, useFrame } from '@react-three/fiber';
import { useState, useRef, useCallback } from 'react';
import { Raycaster, Vector2, Vector3, Plane, Mesh } from 'three';

export const useClickPosition = (characterRef?: React.RefObject<Mesh>) => {
  const { camera, size } = useThree();
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const groundPlane = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const [clickPosition, setClickPosition] = useState<Vector3 | null>(null);

  // 클릭 위치 계산 함수
  const calculateClickPosition = useCallback((event: MouseEvent) => {
    // 마우스 좌표를 정규화된 장치 좌표로 변환 (-1 ~ 1)
    mouse.current.x = (event.clientX / size.width) * 2 - 1;
    mouse.current.y = -(event.clientY / size.height) * 2 + 1;

    // 레이캐스터 업데이트
    raycaster.current.setFromCamera(mouse.current, camera);

    // 캐릭터와의 교차 확인 (캐릭터가 있는 경우)
    if (characterRef?.current) {
      const intersects = raycaster.current.intersectObject(characterRef.current, true);
      if (intersects.length > 0) {
        // 캐릭터와 교차한 위치 반환
        setClickPosition(intersects[0].point.clone());
        return;
      }
    }

    // 지면 평면과의 교차 계산
    const planeIntersect = new Vector3();
    raycaster.current.ray.intersectPlane(groundPlane.current, planeIntersect);
    
    // 교차 위치가 너무 멀리 있으면 카메라 방향으로 적당한 거리에 위치시킴
    if (planeIntersect.distanceTo(camera.position) > 20) {
      const direction = raycaster.current.ray.direction.clone().normalize();
      planeIntersect.copy(camera.position.clone().add(direction.multiplyScalar(10)));
    }
    
    setClickPosition(planeIntersect);
  }, [camera, size, characterRef]);

  return { clickPosition, calculateClickPosition };
};
