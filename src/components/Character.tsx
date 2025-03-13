import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh } from 'three'
import { useSpring, animated } from '@react-three/drei'

interface CharacterProps {
  position: [number, number, number]
}

const Character = ({ position }: CharacterProps) => {
  const groupRef = useRef<Group>(null)
  const headRef = useRef<Mesh>(null)
  const leftArmRef = useRef<Mesh>(null)
  const rightArmRef = useRef<Mesh>(null)
  const leftLegRef = useRef<Mesh>(null)
  const rightLegRef = useRef<Mesh>(null)
  
  const [time, setTime] = useState(0)
  
  // Animate the character
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle bobbing motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 + position[1]
    }
    
    if (leftArmRef.current && rightArmRef.current) {
      // Swing arms
      leftArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.2
      rightArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5 + Math.PI) * 0.2
    }
    
    if (leftLegRef.current && rightLegRef.current) {
      // Swing legs slightly
      leftLegRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.1
      rightLegRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5 + Math.PI) * 0.1
    }
    
    if (headRef.current) {
      // Slight head movement
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
    
    setTime(state.clock.elapsedTime)
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#f1c40f" />
        
        {/* Eyes */}
        <mesh position={[0.15, 0.05, 0.2]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[-0.15, 0.05, 0.2]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        
        {/* Mouth */}
        <mesh position={[0, -0.1, 0.2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.03, 0.01]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      </mesh>
      
      {/* Left Arm */}
      <mesh 
        ref={leftArmRef}
        position={[-0.4, 0.75, 0]} 
        rotation={[0, 0, -0.2]}
      >
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      
      {/* Right Arm */}
      <mesh 
        ref={rightArmRef}
        position={[0.4, 0.75, 0]} 
        rotation={[0, 0, 0.2]}
      >
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      
      {/* Left Leg */}
      <mesh 
        ref={leftLegRef}
        position={[-0.2, -0.1, 0]} 
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      {/* Right Leg */}
      <mesh 
        ref={rightLegRef}
        position={[0.2, -0.1, 0]} 
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
    </group>
  )
}

export default Character
