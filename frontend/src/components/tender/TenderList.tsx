import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { FileText, ExternalLink } from "lucide-react";

export interface Tender {
  id: string;
  title: string;
  reference: string;
  department: string;
  budget: string;
  closingDate: string;
  status: "open" | "closed" | "awarded";
}

interface TenderListProps {
  tenders?: Tender[];
}

const mockTenders: Tender[] = [
  {
    id: "1",
    title: "Supply of Medical Equipment",
    reference: "MED-2025-001",
    department: "Department of Health",
    budget: "R 5,000,000",
    closingDate: "2026-02-15",
    status: "open",
  },
  {
    id: "2",
    title: "IT Infrastructure Upgrade",
    reference: "IT-2025-014",
    department: "Department of Public Works",
    budget: "R 12,500,000",
    closingDate: "2026-01-30",
    status: "closed",
  },
  {
    id: "3",
    title: "Security Services Contract",
    reference: "SEC-2025-009",
    department: "Department of Transport",
    budget: "R 8,200,000",
    closingDate: "2026-03-10",
    status: "open",
  },
];

const statusColor = (status: Tender["status"]) => {
  switch (status) {
    case "open":
      return "bg-green-500";
    case "closed":
      return "bg-gray-500";
    case "awarded":
      return "bg-blue-500";
    default:
      return "bg-gray-400";
  }
};

export default function TenderList({ tenders = mockTenders }: TenderListProps) {
  return (
    <div className="space-y-4">
      {tenders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No tenders available.
          </CardContent>
        </Card>
      ) : (
        tenders.map((tender) => (
          <Card key={tender.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {tender.title}
                  </CardTitle>
                  <CardDescription>
                    Ref: {tender.reference}
                  </CardDescription>
                </div>

                <Badge className={`${statusColor(tender.status)} text-white`}>
                  {tender.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Department:</span>{" "}
                  {tender.department}
                </div>
                <div>
                  <span className="font-medium">Budget:</span>{" "}
                  {tender.budget}
                </div>
                <div>
                  <span className="font-medium">Closing Date:</span>{" "}
                  {tender.closingDate}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button size="sm" className="flex items-center gap-1">
                  Apply
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
