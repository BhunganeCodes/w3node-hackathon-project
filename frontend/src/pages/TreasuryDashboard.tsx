import TenderCard from "../components/TenderCard";
import AIScoreDashboard from "../components/AIScoreDashboard";
import TenderForm from "../components/TenderForm";

const tenders = [
  {
    title: "Supply of Medical Equipment",
    budget: 5000000,
    status: "evaluating",
    aiScore: 91,
  },
  {
    title: "Hospital Furniture Upgrade",
    budget: 3200000,
    status: "open",
    aiScore: 0,
  },
  {
    title: "Provincial Ambulance Fleet",
    budget: 12000000,
    status: "awarded",
    aiScore: 96,
  },
] as const;

export default function TreasuryDashboard() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Treasury Dashboard</h1>
        <p>AI-driven, transparent tender evaluation</p>
      </header>

      {/* Tender Creation */}
      <TenderForm />

      {/* Tender List */}
      <section className="tender-section">
        <h2>Active Tenders</h2>

        <div className="tender-grid">
          {tenders.map((tender, index) => (
            <TenderCard key={index} {...tender} />
          ))}
        </div>
      </section>

      {/* AI Scoring Overview */}
      <AIScoreDashboard />
    </div>
  );
}
