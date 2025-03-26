import { useThree, useFrame } from '@react-three/fiber';
import { useState, useRef, useCallback } from 'react';
import { Raycaster, Vector2, Vector3, Plane, Mesh } from 'three';

export const useClickPosition = (characterRef?: React.RefObject<Mesh>) => {
  const { camera, size } = useThree();
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const groundPlane = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const [clickPosition, setClickPosition] = useState<Vector3 | null>(null);

  // í´ë¦­ ìì¹ ê³ì° í¨ì
  const calculateClickPosition = useCallback((event: MouseEvent) => {
    // ë§ì°ì¤ ì¢íë¥¼ ì ê·íë ì¥ì¹ ì¢íë¡ ë³í (-1 ~ 1)
    mouse.current.x = (event.clientX / size.width) * 2 - 1;
    mouse.current.y = -(event.clientY / size.height) * 2 + 1;

    // ë ì´ìºì¤í° ìë°ì´í¸
    raycaster.current.setFromCamera(mouse.current, camera);

    // ìºë¦­í°ìì êµì°¨ íì¸ (ìºë¦­í°ê° ìë ê²½ì°)
    if (characterRef?.current) {
      const intersects = raycaster.current.intersectObject(characterRef.current, true);
      if (intersects.length > 0) {
        // ìºë¦­í°ì êµì°¨í ìì¹ ë°í
        setClickPosition(intersects[0].point.clone());
        return;
      }
    }

    // ì§ë©´ íë©´ê³¼ì êµì°¨ ê³ì°
    const planeIntersect = new Vector3();
    raycaster.current.ray.intersectPlane(groundPlane.current, planeIntersect);
    
    // êµì°¨ ìì¹ê° ëë¬´ ë©ë¦¬ ìì¼ë©´ ì¹´ë©ë¼ ë°©í¥ì¼ë¡ ì ë¹í ê±°ë¦¬ì ìì¹ìí´
    if (planeIntersect.distanceTo(camera.position) > 20) {
      const direction = raycaster.current.ray.direction.clone().normalize();
      planeIntersect.copy(camera.position.clone().add(direction.multiplyScalar(10)));
    }
    
    setClickPosition(planeIntersect);
  }, [camera, size, characterRef]);

  return { clickPosition, calculateClickPosition };
};
