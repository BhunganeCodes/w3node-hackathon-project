export async function evaluateTender(bidData: any) {
  const response = await fetch("http://localhost:8000/api/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bidData }),
  });

  if (!response.ok) {
    throw new Error("Failed to evaluate tender");
  }

  return response.json();
}