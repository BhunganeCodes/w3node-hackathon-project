import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

function Chain() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh>
        <torusGeometry args={[1.2, 0.35, 32, 100]} />
        <meshStandardMaterial
          color="#0bbf8a"
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 4] }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} />
      <Chain />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
