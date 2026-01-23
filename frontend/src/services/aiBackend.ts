const API_BASE_URL = "http://localhost:8000/api";

interface ScoreTenderPayload {
  title: string;
  description: string;
  documentHash: string;
}

interface ScoreTenderResponse {
  success: boolean;
  score: number; // AI score returned by backend
  confidence?: number; // optional if backend sends confidence
}

export async function scoreTender(payload: ScoreTenderPayload): Promise<ScoreTenderResponse> {
  const response = await fetch(`${API_BASE_URL}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bidData: payload }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI backend error: ${text}`);
  }

  const data = await response.json();

  // Backend returns: { success: true, score: { score: number, confidence?: number } }
  return {
    success: data.success,
    score: data.score.score,
    confidence: data.score.confidence,
  };
}
