declare global {
  interface Window {
    ethereum?: any;
  }
}

interface TenderData {
  title: string;
  description: string;
  documentHash: string;
  score: number;
}

export const blockchainService = {
  isInitialized: false,
  connected: false,

  async initialize() {
    if (this.isInitialized) return;

    if (!window.ethereum) {
      console.warn("MetaMask not detected. Blockchain features will not work.");
      this.connected = false;
      this.isInitialized = true;
      return;
    }

    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      this.connected = accounts && accounts.length > 0;
      this.isInitialized = true;

      console.log("✅ Blockchain service initialized:", this.connected ? "Connected" : "Not connected");
    } catch (err) {
      console.error("❌ Failed to initialize blockchain service:", err);
      this.connected = false;
      this.isInitialized = true;
    }
  },

  isConnected(): boolean {
    return this.connected;
  },

  async checkConnection(): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      this.connected = accounts && accounts.length > 0;
      return this.connected;
    } catch {
      this.connected = false;
      return false;
    }
  },

  async createTenderWithScore(
    title: string,
    description: string,
    documentHash: string,
    score: number
  ): Promise<string> {
    if (!this.connected) {
      console.warn("No wallet connected. Mocking blockchain transaction...");
      return Promise.resolve("0xMOCKTRANSACTIONHASH1234567890");
    }

    try {
      // Example: replace this with your smart contract interaction
      // const tx = await contract.methods.createTender(title, description, documentHash, score).send({ from: currentAccount });
      console.log("🌐 Sending tender to blockchain:", { title, description, documentHash, score });

      // Return mock transaction hash for demo
      return Promise.resolve("0xMOCKTRANSACTIONHASH1234567890");
    } catch (err) {
      console.error("❌ Failed to send tender to blockchain:", err);
      throw err;
    }
  },
};
