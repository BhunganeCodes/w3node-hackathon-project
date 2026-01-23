// This service communicates with the AI backend (FastAPI)

interface TenderData {
  title: string;
  description: string;
  documentHash: string;
}

interface AIResponse {
  score: number;
  riskFlags: string[];
}

export const scoreTender = async (tenderData: TenderData): Promise<AIResponse> => {
  // For now, we'll call the AI backend running on localhost:8000
  const response = await fetch('http://localhost:8000/score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tenderData),
  });

  if (!response.ok) {
    throw new Error('Failed to score tender');
  }

  return response.json();
};