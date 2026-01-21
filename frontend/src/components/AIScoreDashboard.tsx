import { motion } from "framer-motion";

interface Metric {
  label: string;
  score: number;
}

const metrics: Metric[] = [
  { label: "Compliance", score: 92 },
  { label: "Pricing Fairness", score: 85 },
  { label: "Experience", score: 78 },
  { label: "BBBEE", score: 88 },
  { label: "Risk Profile", score: 95 },
];

export default function AIScoreDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <h2>AI Evaluation Overview</h2>

      <div className="ai-metrics">
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-row">
            <span>{metric.label}</span>

            <div className="progress-bar small">
              <div
                className="progress-fill"
                style={{ width: `${metric.score}%` }}
              />
            </div>

            <strong>{metric.score}%</strong>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
