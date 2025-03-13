import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Character from './components/Character'

function App() {
  return (
    <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Character position={[0, 0, 0]} />
      <OrbitControls />
      <gridHelper args={[10, 10]} />
    </Canvas>
  )
}

export default App
