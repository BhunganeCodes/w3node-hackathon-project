import { Sun, Moon, Wallet } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../hooks/useWallet";

export default function TopBar() {
  const { toggleTheme, theme } = useTheme();
  const { connect, address } = useWallet();

  return (
    <div className="topbar glass">
      <button onClick={toggleTheme}>
        {theme === "light" ? <Moon /> : <Sun />}
      </button>

      <button onClick={connect} className="wallet-btn">
        <Wallet size={16} />
        {address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : "Connect Wallet"}
      </button>
    </div>
  );
}
