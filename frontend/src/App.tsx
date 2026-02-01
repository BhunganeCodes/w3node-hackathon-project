import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TenderRegistryABI from './contracts/TenderRegistry.json';
import TreasuryEscrowABI from './contracts/TreasuryEscrow.json';

// Contract addresses (update after deployment)
const TENDER_REGISTRY_ADDRESS = process.env.REACT_APP_TENDER_REGISTRY_ADDRESS || '';
const TREASURY_ESCROW_ADDRESS = process.env.REACT_APP_TREASURY_ESCROW_ADDRESS || '';

interface Tender {
  id: number;
  title: string;
  description: string;
  budget: string;
  deadline: number;
  status: number;
}

interface Bid {
  id: number;
  tenderId: number;
  bidder: string;
  amount: string;
  aiScore: number;
  status: number;
}

const App: React.FC = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>('');
  const [tenderRegistry, setTenderRegistry] = useState<ethers.Contract | null>(null);
  const [treasuryEscrow, setTreasuryEscrow] = useState<ethers.Contract | null>(null);
  
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [selectedView, setSelectedView] = useState<'tenders' | 'bids' | 'create'>('tenders');
  
  const [newTender, setNewTender] = useState({
    title: '',
    description: '',
    ipfsHash: '',
    budget: '',
    deadline: '',
    criteria: ['Price', 'Experience', 'Quality'],
    weights: [40, 30, 30]
  });

  useEffect(() => {
    initializeEthers();
  }, []);

  const initializeEthers = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        
        const accounts = await web3Provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
        
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        
        const registryContract = new ethers.Contract(
          TENDER_REGISTRY_ADDRESS,
          TenderRegistryABI.abi,
          web3Signer
        );
        setTenderRegistry(registryContract);
        
        const escrowContract = new ethers.Contract(
          TREASURY_ESCROW_ADDRESS,
          TreasuryEscrowABI.abi,
          web3Signer
        );
        setTreasuryEscrow(escrowContract);
        
      } catch (error) {
        console.error('Error initializing Ethers:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const connectWallet = async () => {
    if (provider) {
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
    }
  };

  const createTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenderRegistry) return;
    
    try {
      const deadlineTimestamp = Math.floor(new Date(newTender.deadline).getTime() / 1000);
      const budgetWei = ethers.utils.parseEther(newTender.budget);
      
      const tx = await tenderRegistry.createTender(
        newTender.title,
        newTender.description,
        newTender.ipfsHash,
        budgetWei,
        deadlineTimestamp,
        newTender.criteria,
        newTender.weights
      );
      
      await tx.wait();
      alert('Tender created successfully!');
      
      setNewTender({
        title: '',
        description: '',
        ipfsHash: '',
        budget: '',
        deadline: '',
        criteria: ['Price', 'Experience', 'Quality'],
        weights: [40, 30, 30]
      });
      
      loadTenders();
    } catch (error) {
      console.error('Error creating tender:', error);
      alert('Failed to create tender');
    }
  };

  const submitBid = async (tenderId: number, amount: string, ipfsHash: string) => {
    if (!tenderRegistry) return;
    
    try {
      const amountWei = ethers.utils.parseEther(amount);
      const tx = await tenderRegistry.submitBid(tenderId, ipfsHash, amountWei);
      await tx.wait();
      alert('Bid submitted successfully!');
      loadUserBids();
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Failed to submit bid');
    }
  };

  const loadTenders = async () => {
    if (!tenderRegistry) return;
    
    try {
      // This is a simplified version - in production, use events or The Graph
      const loadedTenders: Tender[] = [];
      for (let i = 1; i <= 10; i++) {
        try {
          const tender = await tenderRegistry.tenders(i);
          if (tender.id.toNumber() > 0) {
            loadedTenders.push({
              id: tender.id.toNumber(),
              title: tender.title,
              description: tender.description,
              budget: ethers.utils.formatEther(tender.budget),
              deadline: tender.deadline.toNumber(),
              status: tender.status
            });
          }
        } catch {
          break;
        }
      }
      setTenders(loadedTenders);
    } catch (error) {
      console.error('Error loading tenders:', error);
    }
  };

  const loadUserBids = async () => {
    if (!tenderRegistry || !account) return;
    
    try {
      const bidIds = await tenderRegistry.getBidderBids(account);
      const loadedBids: Bid[] = [];
      
      for (const bidId of bidIds) {
        const bid = await tenderRegistry.bids(bidId);
        loadedBids.push({
          id: bid.id.toNumber(),
          tenderId: bid.tenderId.toNumber(),
          bidder: bid.bidder,
          amount: ethers.utils.formatEther(bid.amount),
          aiScore: bid.aiScore.toNumber(),
          status: bid.status
        });
      }
      
      setUserBids(loadedBids);
    } catch (error) {
      console.error('Error loading user bids:', error);
    }
  };

  useEffect(() => {
    if (tenderRegistry) {
      loadTenders();
      loadUserBids();
    }
  }, [tenderRegistry, account]);

  const getStatusText = (status: number) => {
    const statuses = ['Open', 'Under Review', 'Awarded', 'Cancelled', 'Completed'];
    return statuses[status] || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🏛️ TenderChain AI</h1>
              <p className="text-sm opacity-90">Decentralized Transparent Tendering</p>
            </div>
            <div>
              {account ? (
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <p className="text-xs">Connected:</p>
                  <p className="font-mono text-sm">{account.slice(0, 6)}...{account.slice(-4)}</p>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setSelectedView('tenders')}
              className={`py-4 px-2 border-b-2 font-medium ${
                selectedView === 'tenders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Browse Tenders
            </button>
            <button
              onClick={() => setSelectedView('bids')}
              className={`py-4 px-2 border-b-2 font-medium ${
                selectedView === 'bids'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Bids
            </button>
            <button
              onClick={() => setSelectedView('create')}
              className={`py-4 px-2 border-b-2 font-medium ${
                selectedView === 'create'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Tender
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {selectedView === 'tenders' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Available Tenders</h2>
            {tenders.length === 0 ? (
              <p className="text-gray-500">No tenders available</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tenders.map((tender) => (
                  <div key={tender.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{tender.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tender.status === 0 ? 'bg-green-100 text-green-800' :
                        tender.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                        tender.status === 2 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(tender.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{tender.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Budget:</span>
                        <span className="font-semibold">{tender.budget} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Deadline:</span>
                        <span className="font-semibold">
                          {new Date(tender.deadline * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {tender.status === 0 && (
                      <button
                        onClick={() => {
                          const amount = prompt('Enter bid amount (ETH):');
                          const hash = prompt('Enter IPFS document hash:');
                          if (amount && hash) submitBid(tender.id, amount, hash);
                        }}
                        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                      >
                        Submit Bid
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedView === 'bids' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">My Bids</h2>
            {userBids.length === 0 ? (
              <p className="text-gray-500">You haven't submitted any bids yet</p>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bid ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userBids.map((bid) => (
                      <tr key={bid.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{bid.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.amount} ETH</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bid.aiScore > 0 ? `${bid.aiScore}/100` : 'Pending'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            bid.status === 0 ? 'bg-gray-100 text-gray-800' :
                            bid.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                            bid.status === 2 ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {['Submitted', 'Under Review', 'Accepted', 'Rejected'][bid.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedView === 'create' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Tender</h2>
            <form onSubmit={createTender} className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={newTender.title}
                  onChange={(e) => setNewTender({...newTender, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Road Construction Project"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={newTender.description}
                  onChange={(e) => setNewTender({...newTender, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Detailed tender description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newTender.budget}
                  onChange={(e) => setNewTender({...newTender, budget: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="date"
                  required
                  value={newTender.deadline}
                  onChange={(e) => setNewTender({...newTender, deadline: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IPFS Document Hash</label>
                <input
                  type="text"
                  required
                  value={newTender.ipfsHash}
                  onChange={(e) => setNewTender({...newTender, ipfsHash: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="QmXxx..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Create Tender
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;