import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Wallet } from "lucide-react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setError(null);

    if (!window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }

    try {
      setIsConnecting(true);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  // Auto-detect already connected wallet
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch {
        // silent fail
      }
    };

    checkConnection();
  }, []);

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Connection
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {account ? (
          <>
            <div className="text-sm text-muted-foreground">
              Connected as
            </div>

            <div className="font-mono text-sm bg-muted p-2 rounded">
              {shortAddress(account)}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </Button>
          </>
        ) : (
          <>
            <Button
              className="w-full"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
