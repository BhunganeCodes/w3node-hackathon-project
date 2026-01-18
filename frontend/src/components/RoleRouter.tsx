import { useRole } from "../context/RoleContext";
import TreasuryDashboard from "../pages/TreasuryDashboard";
import BidderDashboard from "../pages/BidderDashboard";

export default function RoleRouter() {
  const { role } = useRole();

  if (role === "TREASURY") return <TreasuryDashboard />;
  return <BidderDashboard />;
}
