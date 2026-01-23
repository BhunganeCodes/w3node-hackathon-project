export interface BidSubmission {
  title: string;
  description: string;
  budget: number;
  category: string;
  documentHash: string;
  deadline?: Date;
}

export interface AIScoringResponse {
  bidId: string;
  score: number;
  riskFlags: string[];
  explanation: string;
  factors: {
    name: string;
    score: number;
    weight: number;
    comment: string;
  }[];
}

export interface TenderCreateData {
  title: string;
  description: string;
  budget: number;
  category: string;
  issuer: string;
  deadline: Date;
  evaluationCriteria: string[];
}

export interface BlockchainSubmission {
  tenderId: string;
  bidder: string;
  aiScore: number;
  riskFlags: string[];
  ipfsHash: string;
  timestamp: number;
}
