import { Raycaster, Vector3, Camera } from 'three';

class ShootingSystem {
  private raycaster: Raycaster;
  private lastShootTime: number = 0;
  private shootCooldown: number = 150; // 150ms between shots
  
  constructor() {
    this.raycaster = new Raycaster();
    this.raycaster.far = 100; // Maximum shooting distance
  }
  
  // Perform raycast (shoot in the direction of the crosshair)
  performRaycast(origin: Vector3, direction: Vector3) {
    this.raycaster.set(origin, direction);
    
    // Add some random spread to make shooting more realistic
    const spread = 0.01;
    const randomDirection = direction.clone().add(
      new Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      )
    ).normalize();
    
    this.raycaster.set(origin, randomDirection);
    
    // In a real game, you would check for collisions with objects in the scene
    // For now, we'll just return a hit point at a fixed distance
    const hitDistance = 20 + Math.random() * 10; // Random distance between 20-30 units
    const hitPoint = new Vector3().copy(origin).add(
      randomDirection.clone().multiplyScalar(hitDistance)
    );
    
    return {
      point: hitPoint
    };
  }
  
  // Handle shooting with cooldown
  shoot(camera: Camera): boolean {
    const now = performance.now();
    
    // Check if we're still in cooldown
    if (now - this.lastShootTime < this.shootCooldown) {
      console.log("ShootingSystem: ì¿¨ë¤ì´ ì¤ìëë¤. ë°ì¬ ë¶ê°.");
      return false; // Still in cooldown, don't shoot
    }
    
    // Update last shoot time
    this.lastShootTime = now;
    
    // Get camera direction
    const direction = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    
    // Trigger shoot event - ì¤ì: ì´ë²¤í¸ë í ë²ë§ ë°ììí´
    const shootEvent = new CustomEvent('shoot');
    window.dispatchEvent(shootEvent);
    
    return true;
  }
}

export default ShootingSystem;
