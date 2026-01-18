import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface TenderCardProps {
  title: string;
  budget: number;
  status: "open" | "evaluating" | "awarded";
  aiScore: number;
}

export default function TenderCard({
  title,
  budget,
  status,
  aiScore,
}: TenderCardProps) {
  const statusConfig = {
    open: { label: "Open", icon: Clock, color: "#00c896" },
    evaluating: { label: "Evaluating", icon: Clock, color: "#facc15" },
    awarded: { label: "Awarded", icon: CheckCircle, color: "#16a34a" },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="glass-card tender-card"
    >
      <div className="tender-header">
        <h3>{title}</h3>
        <span
          className="tender-status"
          style={{ color: statusConfig[status].color }}
        >
          <StatusIcon size={16} /> {statusConfig[status].label}
        </span>
      </div>

      <p className="tender-budget">
        Budget: R{budget.toLocaleString()}
      </p>

      <div className="ai-score">
        <span>AI Confidence Score</span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${aiScore}%` }}
          />
        </div>
        <strong>{aiScore}%</strong>
      </div>
    </motion.div>
  );
}
