import { Raycaster, Vector3, Camera } from 'three';

class ShootingSystem {
  private raycaster: Raycaster;
  
  constructor() {
    this.raycaster = new Raycaster();
    this.raycaster.far = 100; // 최대 발사 거리
  }
  
  // 레이캐스트 수행 (조준점 방향으로 발사)
  performRaycast(origin: Vector3, direction: Vector3) {
    this.raycaster.set(origin, direction);
    
    // 여기서는 간단한 구현으로 레이캐스트 결과를 반환
    // 실제 게임에서는 충돌 대상을 필터링하고 처리해야 함
    return {
      point: new Vector3(0, 0, -10).add(origin) // 임시 타격 지점
    };
  }
  
  // 발사 처리
  shoot(camera: Camera) {
    // 카메라 방향으로 레이캐스트
    const direction = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    
    // 발사 이벤트 발생
    const shootEvent = new CustomEvent('shoot');
    window.dispatchEvent(shootEvent);
    
    return this.performRaycast(camera.position, direction);
  }
}

export default ShootingSystem;
