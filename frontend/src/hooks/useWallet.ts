import { BrowserProvider } from "ethers";
import { useState } from "react";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);

  async function connect() {
    if (!(window as any).ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const provider = new BrowserProvider((window as any).ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAddress(accounts[0]);
  }

  return { address, connect };
}
