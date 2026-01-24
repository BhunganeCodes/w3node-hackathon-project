export interface TenderData {
  id: number;
  title: string;
  description: string;
  documentHash?: string;   // IPFS hash (optional)
  score?: number;          // AI score (optional)
  blockchainTimestamp?: string; // Optional blockchain field
  owner?: string;          // Optional owner or address
}
