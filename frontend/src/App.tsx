import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sphere } from "@react-three/drei";

import Sidebar from "./components/Sidebar";
import TreasuryDashboard from "./pages/TreasuryDashboard";
import BidderDashboard from "./pages/BidderDashboard";

import "./styles/glass.css";

type Role = "treasury" | "bidder";

/* -------------------- 3D BACKGROUND -------------------- */
function AnimatedBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ position: "fixed", inset: 0, zIndex: -1 }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {[...Array(12)].map((_, i) => (
        <Float key={i} speed={1.5} rotationIntensity={1} floatIntensity={2}>
          <Sphere
            args={[0.15, 32, 32]}
            position={[
              Math.random() * 8 - 4,
              Math.random() * 6 - 3,
              Math.random() * 4 - 2,
            ]}
          >
            <meshStandardMaterial
              color="#00c896"
              emissive="#00c896"
              emissiveIntensity={0.4}
              transparent
              opacity={0.8}
            />
          </Sphere>
        </Float>
      ))}

      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

/* -------------------- APP -------------------- */
export default function App() {
  const [role, setRole] = useState<Role>("treasury");

  return (
    <>
      <AnimatedBackground />

      <div className="app-layout">
        <Sidebar role={role} setRole={setRole} />

        <main className="main-content">
          {role === "treasury" ? (
            <TreasuryDashboard />
          ) : (
            <BidderDashboard />
          )}
        </main>
      </div>
    </>
  );
}
