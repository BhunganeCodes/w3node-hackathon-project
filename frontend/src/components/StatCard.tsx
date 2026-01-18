// Statistical Card

import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="glass stat-card"
    >
      <p className="stat-title">{title}</p>
      <h3 className="stat-value">{value}</h3>
    </motion.div>
  );
}
