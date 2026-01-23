import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { 
  Home, 
  FileText, 
  BarChart3, 
  Users, 
  Shield, 
  Bot, 
  Wallet, 
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  TrendingUp,
  Globe,
  Lock,
  CheckCircle
} from 'lucide-react';
import { TenderForm } from './components/tender/TenderForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { TenderList } from './components/tender/TenderList';
import { WalletConnect } from './components/wallet/WalletConnect';
import { apiService } from './services/api';
import { blockchainService } from './services/blockchain';
import './styles/globals.css';

// Layout Components
const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
  const location = useLocation();
  
  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/', badge: null },
    { icon: <FileText size={20} />, label: 'Submit Tender', path: '/submit', badge: 'New' },
    { icon: <BarChart3 size={20} />, label: 'Tender Board', path: '/tenders', badge: null },
    { icon: <Users size={20} />, label: 'Bidders', path: '/bidders', badge: null },
    { icon: <Shield size={20} />, label: 'Audit Trail', path: '/audit', badge: null },
    { icon: <Bot size={20} />, label: 'AI Analytics', path: '/analytics', badge: 'AI' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings', badge: null },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">TenderChain AI</h1>
              <p className="text-xs text-gray-400">Transparent Tendering</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-blue-500/20 text-blue-400 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                  }
                `}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">TH</span>
              </div>
              <div>
                <p className="text-sm font-medium">Thamsanqa Hadebe</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'disconnected'>('connected');
  const [aiHealth, setAiHealth] = useState<'healthy' | 'unhealthy'>('healthy');

  useEffect(() => {
    // Check backend health
    apiService.healthCheck()
      .then(() => setAiHealth('healthy'))
      .catch(() => setAiHealth('unhealthy'));

    // Check blockchain connection
    blockchainService.checkConnection()
      .then(connected => setNetworkStatus(connected ? 'connected' : 'disconnected'));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="search"
              placeholder="Search tenders, bidders, analytics..."
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-4">
          {/* Status Indicators */}
          <div className="hidden md:flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${networkStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <div className={`w-2 h-2 rounded-full ${networkStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {networkStatus === 'connected' ? 'Blockchain Connected' : 'Disconnected'}
              </span>
            </div>

            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${aiHealth === 'healthy' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
              <Bot size={16} />
              <span className="text-sm font-medium">
                {aiHealth === 'healthy' ? 'AI Active' : 'AI Unavailable'}
              </span>
            </div>
          </div>

          {/* Wallet & Notifications */}
          <div className="flex items-center space-x-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="hidden md:block">
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
    <div className="px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Shield size={24} />
            <span className="text-xl font-bold">TenderChain AI</span>
          </div>
          <p className="text-gray-400 text-sm">
            Revolutionizing public procurement through blockchain transparency and AI objectivity.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Platform</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/tenders" className="hover:text-white transition-colors">Browse Tenders</Link></li>
            <li><Link to="/submit" className="hover:text-white transition-colors">Submit Tender</Link></li>
            <li><Link to="/analytics" className="hover:text-white transition-colors">AI Analytics</Link></li>
            <li><Link to="/audit" className="hover:text-white transition-colors">Audit Trail</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Technology</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Blockchain Smart Contracts</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>AI-Powered Evaluation</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>IPFS Document Storage</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Security</h3>
          <div className="flex items-center space-x-4">
            <Lock className="text-gray-400" size={20} />
            <Globe className="text-gray-400" size={20} />
            <Shield className="text-gray-400" size={20} />
            <CheckCircle className="text-gray-400" size={20} />
          </div>
          <p className="mt-4 text-gray-400 text-sm">
            Built with ❤️ for transparent governance
          </p>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} TenderChain AI. All rights reserved. | Hackathon Project</p>
      </div>
    </div>
  </footer>
);

// Main App Component
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    // Initialize services
    const initServices = async () => {
      try {
        // Check backend connection
        await apiService.healthCheck();
        setBackendConnected(true);
        
        // Initialize blockchain
        await blockchainService.initialize();
        setWalletConnected(blockchainService.isConnected());
        
        console.log('✅ Services initialized successfully');
      } catch (error) {
        console.error('❌ Service initialization failed:', error);
      }
    };

    initServices();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Loading State
  if (!backendConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Initializing TenderChain AI</h2>
          <p className="text-gray-600">Connecting to AI backend and blockchain services...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'font-sans',
            duration: 4000,
          }}
        />

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <div className="lg:pl-64 flex-1 flex flex-col">
          {/* Header */}
          <Header toggleSidebar={toggleSidebar} />

          {/* Page Content */}
          <main className="flex-1 p-6">
            {/* Status Banner */}
            {!walletConnected && (
              <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Wallet className="text-orange-600" size={20} />
                    <div>
                      <h3 className="font-medium text-gray-900">Connect Your Wallet</h3>
                      <p className="text-sm text-gray-600">
                        Connect MetaMask to submit tenders and interact with smart contracts
                      </p>
                    </div>
                  </div>
                  <WalletConnect />
                </div>
              </div>
            )}

            {/* Stats Overview */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Tenders</p>
                    <p className="text-2xl font-bold text-gray-900">42</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  <TrendingUp size={12} className="inline mr-1" />
                  +12% from last month
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">AI Evaluations</p>
                    <p className="text-2xl font-bold text-gray-900">1,248</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bot className="text-purple-600" size={20} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">99.2% accuracy rate</p>
              </div>

              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Blockchain TX</p>
                    <p className="text-2xl font-bold text-gray-900">8,569</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="text-green-600" size={20} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Immutable records</p>
              </div>

              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">$4.2M</p>
                  </div>
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <TrendingUp className="text-amber-600" size={20} />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  +$850K this quarter
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg. Processing</p>
                    <p className="text-2xl font-bold text-gray-900">2.4d</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CheckCircle className="text-red-600" size={20} />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">-40% faster</p>
              </div>
            </div>

            {/* Routes */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/submit" element={<TenderForm />} />
              <Route path="/tenders" element={<TenderList />} />
              <Route path="/bidders" element={<div>Bidders Page (Coming Soon)</div>} />
              <Route path="/audit" element={<div>Audit Trail Page (Coming Soon)</div>} />
              <Route path="/analytics" element={<div>AI Analytics Page (Coming Soon)</div>} />
              <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;