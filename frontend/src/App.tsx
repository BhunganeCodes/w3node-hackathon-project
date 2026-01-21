import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sphere } from "@react-three/drei";

import Sidebar from "./components/Sidebar";
import TreasuryDashboard from "./pages/TreasuryDashboard";
import BidderDashboard from "./pages/BidderDashboard";
import TopBar from "./components/TopBar";
import { ThemeProvider } from "./context/ThemeContext";

import "./styles/glass.css";

type Role = "treasury" | "bidder";

function AnimatedBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ position: "fixed", inset: 0, zIndex: -1 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 4, 4]} intensity={1} />

      {[...Array(10)].map((_, i) => (
        <Float key={i} speed={1.2}>
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
              emissiveIntensity={0.3}
              transparent
              opacity={0.7}
            />
          </Sphere>
        </Float>
      ))}

      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}

export default function App() {
  const [role, setRole] = useState<Role>("treasury");

  return (
    <ThemeProvider>
      <AnimatedBackground />

      <div className="app-layout">
        <Sidebar role={role} setRole={setRole} />

        <main className="main-content">
          <TopBar />
          {role === "treasury" ? (
            <TreasuryDashboard />
          ) : (
            <BidderDashboard />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
