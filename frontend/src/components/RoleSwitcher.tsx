import { useRole } from "../context/RoleContext";
import { motion } from "framer-motion";

export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <motion.div className="glass role-switcher">
      <button
        className={role === "TREASURY" ? "active" : ""}
        onClick={() => setRole("TREASURY")}
      >
        Treasury
      </button>

      <button
        className={role === "BIDDER" ? "active" : ""}
        onClick={() => setRole("BIDDER")}
      >
        Bidder
      </button>
    </motion.div>
  );
}
