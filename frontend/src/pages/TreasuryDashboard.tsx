import TenderForm from "../components/TenderForm";

export default function TreasuryDashboard() {
  return (
    <>
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Treasury Dashboard</h1>
        <p>Secure • Transparent • AI-Assisted Procurement</p>
      </header>

      <TenderForm />
    </div>
    </>
   );
}