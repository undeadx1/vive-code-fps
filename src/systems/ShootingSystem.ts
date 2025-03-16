import { Vector3, Raycaster } from 'three';

class ShootingSystem {
  private raycaster: Raycaster;
  
  constructor() {
    this.raycaster = new Raycaster();
    this.raycaster.far = 100; // 레이캐스트 최대 거리
  }
  
  // 레이캐스트 수행
  performRaycast(origin: Vector3, direction: Vector3) {
    this.raycaster.set(origin, direction);
    
    // 여기서는 간단한 예시로 바닥 평면과의 교차점을 계산
    // 실제 게임에서는 씬의 모든 오브젝트와의 교차를 확인해야 함
    const floorY = 0; // 바닥 높이
    
    // 레이가 수직이 아닌 경우에만 계산
    if (direction.y !== 0) {
      const t = (floorY - origin.y) / direction.y;
      
      if (t > 0) {
        const hitPoint = new Vector3(
          origin.x + direction.x * t,
          floorY,
          origin.z + direction.z * t
        );
        
        // 최대 거리 내에 있는지 확인
        if (origin.distanceTo(hitPoint) <= this.raycaster.far) {
          return {
            point: hitPoint,
            distance: origin.distanceTo(hitPoint)
          };
        }
      }
    }
    
    // 바닥과 교차하지 않는 경우, 최대 거리에 있는 점 반환
    const farPoint = new Vector3(
      origin.x + direction.x * this.raycaster.far,
      origin.y + direction.y * this.raycaster.far,
      origin.z + direction.z * this.raycaster.far
    );
    
    return {
      point: farPoint,
      distance: this.raycaster.far
    };
  }
  
  // 발사 이벤트 발생
  shoot(camera: any) {
    // 발사 이벤트 생성 및 디스패치
    const shootEvent = new Event('shoot');
    window.dispatchEvent(shootEvent);
    
    return true;
  }
}

export default ShootingSystem;
