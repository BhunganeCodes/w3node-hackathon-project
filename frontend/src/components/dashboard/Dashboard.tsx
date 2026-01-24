import React, { useEffect, useState } from "react";
import { TenderData } from "../../types/tender";
import { apiService } from "../services/api";
import { blockchainService } from "../services/blockchain";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Button } from "../components/ui/button";
import { ExternalLink, FileText, Bot, Shield } from "lucide-react";

interface Tender {
  id: number;
  title: string;
  description: string;
  documentHash?: string;
  score?: number;
}

const Dashboard: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch tenders from backend (or mock API)
        const apiTenders = await apiService.getTenders();

        // 2️⃣ (Optional) Enrich with blockchain data
        const enrichedTenders = await Promise.all(
          apiTenders.map(async (tender: Tender) => {
            try {
              const onChainData =
                await blockchainService.getTenderById(tender.id);
              return { ...tender, ...onChainData };
            } catch {
              return tender;
            }
          })
        );

        setTenders(enrichedTenders);
      } catch (err) {
        console.error(err);
        setError("Failed to load tenders");
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tender Dashboard
        </h1>

        {tenders.length === 0 ? (
          <p className="text-gray-600">No tenders submitted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenders.map((tender) => (
              <Card key={tender.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {tender.title}
                  </CardTitle>
                  <CardDescription>
                    Tender ID: {tender.id}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">
                    {tender.description}
                  </p>

                  {tender.documentHash && (
                    <a
                      href={`https://ipfs.io/ipfs/${tender.documentHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <FileText size={16} />
                      View Document
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {tender.score !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Bot size={16} />
                      AI Score:{" "}
                      <span className="font-bold">{tender.score}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield size={16} />
                    Stored on blockchain
                  </div>

                  <Button className="w-full mt-2">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
