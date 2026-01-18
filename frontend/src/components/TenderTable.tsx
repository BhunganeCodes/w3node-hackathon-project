// Tender Table 

import { motion } from "framer-motion";

const tenders = [
  {
    id: "TC-001",
    title: "Medical Equipment Supply",
    status: "AI Scored",
    score: "92%",
  },
  {
    id: "TC-002",
    title: "Road Infrastructure Upgrade",
    status: "Pending Review",
    score: "-",
  },
];

export default function TenderTable() {
  return (
    <div className="glass table-container">
      <h3>Active Tenders</h3>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tender</th>
            <th>Status</th>
            <th>Top Score</th>
          </tr>
        </thead>

        <tbody>
          {tenders.map((tender) => (
            <motion.tr
              key={tender.id}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <td>{tender.id}</td>
              <td>{tender.title}</td>
              <td>
                <span className={`status ${tender.status.replace(" ", "-").toLowerCase()}`}>
                  {tender.status}
                </span>
              </td>
              <td>{tender.score}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
