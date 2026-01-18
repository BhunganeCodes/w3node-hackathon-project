import { motion } from "framer-motion";
import { Shield, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type Role = "treasury" | "bidder";

interface SidebarProps {
  role: Role;
  setRole: (role: Role) => void;
}

export default function Sidebar({ role, setRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 220 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="sidebar"
    >
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && <h2 className="sidebar-title">TenderChain</h2>}

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <button
        className={`sidebar-btn ${role === "treasury" ? "active" : ""}`}
        onClick={() => setRole("treasury")}
      >
        <Shield size={20} />
        {!collapsed && <span>Treasury</span>}
      </button>

      <button
        className={`sidebar-btn ${role === "bidder" ? "active" : ""}`}
        onClick={() => setRole("bidder")}
      >
        <Briefcase size={20} />
        {!collapsed && <span>Bidder</span>}
      </button>
    </motion.aside>
  );
}
