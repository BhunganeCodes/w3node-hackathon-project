import { motion } from "framer-motion";
import { Shield, Briefcase } from "lucide-react";

type Role = "treasury" | "bidder";

interface SidebarProps {
  role: Role;
  setRole: (role: Role) => void;
}

export default function Sidebar({ role, setRole }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sidebar"
    >
      <h2 className="sidebar-title">TenderChain</h2>

      <button
        className={`sidebar-btn ${role === "treasury" ? "active" : ""}`}
        onClick={() => setRole("treasury")}
      >
        <Shield size={18} />
        Treasury
      </button>

      <button
        className={`sidebar-btn ${role === "bidder" ? "active" : ""}`}
        onClick={() => setRole("bidder")}
      >
        <Briefcase size={18} />
        Bidder
      </button>
    </motion.aside>
  );
}
