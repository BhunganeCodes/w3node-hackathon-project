import TenderCard from "../components/TenderCard";  
  
const availableTenders = [  
  {  
    title: "Supply of Medical Equipment",  
    budget: 5000000,  
    status: "open" as const,  
    aiScore: 0,  
  },  
  {  
    title: "Hospital Furniture Upgrade",   
    budget: 3200000,  
    status: "open" as const,  
    aiScore: 0,  
  }  
];  
  
export default function BidderDashboard() {  
  return (  
    <div className="dashboard-container">  
      <header className="dashboard-header">  
        <h1>Bidder Dashboard</h1>  
        <p>Available tenders for submission</p>  
      </header>  
  
      <section className="tender-section">  
        <h2>Open Tenders</h2>  
        <div className="tender-grid">  
          {availableTenders.map((tender, index) => (  
            <TenderCard key={index} {...tender} />  
          ))}  
        </div>  
      </section>  
    </div>  
  );  
}