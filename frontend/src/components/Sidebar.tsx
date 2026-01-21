import { motion } from "framer-motion";
import {
  Shield,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
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
      animate={{ width: collapsed ? 84 : 240 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="sidebar glass"
    >
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand">
          <Layers size={22} />
          {!collapsed && <span>TenderChain</span>}
        </div>

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${
            role === "treasury" ? "active" : ""
          }`}
          onClick={() => setRole("treasury")}
        >
          <Shield size={20} />
          {!collapsed && <span>Treasury</span>}
        </button>

        <button
          className={`sidebar-link ${
            role === "bidder" ? "active" : ""
          }`}
          onClick={() => setRole("bidder")}
        >
          <Briefcase size={20} />
          {!collapsed && <span>Bidder</span>}
        </button>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <p>GovTech • Web3 • AI</p>
          <small>W3Node Hackathon</small>
        </div>
      )}
    </motion.aside>
  );
}
