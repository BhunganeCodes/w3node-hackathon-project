import TenderForm from "./components/TenderForm";

function App() {
  return <TenderForm />;
}

export default App;





// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
// import { Toaster } from 'sonner';
// import { 
//   Home, 
//   FileText, 
//   BarChart3, 
//   Users, 
//   Shield, 
//   Bot, 
//   Wallet, 
//   Settings,
//   Menu,
//   X,
//   LogOut,
//   Bell,
//   Search,
//   TrendingUp,
//   Globe,
//   Lock,
//   CheckCircle,
//   Sun,
//   Moon
// } from 'lucide-react';
// import { TenderForm } from './components/tender/TenderForm';
// import { Dashboard } from './components/dashboard/Dashboard';
// import { TenderList } from './components/tender/TenderList';
// import { WalletConnect } from './components/wallet/WalletConnect';
// import { apiService } from './services/api';
// import { blockchainService } from './services/blockchain';
// import './styles/globals.css';

// // Sidebar
// const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
//   const location = useLocation();
  
//   const navItems = [
//     { icon: <Home size={20} />, label: 'Dashboard', path: '/', badge: null },
//     { icon: <FileText size={20} />, label: 'Submit Tender', path: '/submit', badge: 'New' },
//     { icon: <BarChart3 size={20} />, label: 'Tender Board', path: '/tenders', badge: null },
//     { icon: <Users size={20} />, label: 'Bidders', path: '/bidders', badge: null },
//     { icon: <Shield size={20} />, label: 'Audit Trail', path: '/audit', badge: null },
//     { icon: <Bot size={20} />, label: 'AI Analytics', path: '/analytics', badge: 'AI' },
//     { icon: <Settings size={20} />, label: 'Settings', path: '/settings', badge: null },
//   ];

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isOpen && (
//         <div 
//           className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
//           onClick={toggleSidebar}
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`
//         fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-black text-white
//         transform transition-all duration-300 ease-in-out
//         ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
//         flex flex-col border-r border-slate-800 dark:border-gray-900 shadow-2xl lg:shadow-none
//       `}>
//         {/* Logo */}
//         <div className="p-6 border-b border-slate-800 dark:border-gray-900">
//           <Link to="/" className="flex items-center space-x-3 group">
//             <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
//               <Shield size={24} className="text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight text-white">TenderChain AI</h1>
//               <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Decentralized</p>
//             </div>
//           </Link>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
//           {navItems.map((item) => {
//             const isActive = location.pathname === item.path;
//             return (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`
//                   flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
//                   ${isActive 
//                     ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
//                     : 'hover:bg-slate-800 dark:hover:bg-gray-900 text-slate-400 hover:text-white'
//                   }
//                 `}
//                 onClick={() => window.innerWidth < 1024 && toggleSidebar()}
//               >
//                 <div className="flex items-center space-x-3">
//                   <div className={`${isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-white'} transition-colors`}>
//                     {item.icon}
//                   </div>
//                   <span className="font-medium text-sm">{item.label}</span>
//                 </div>
//                 {item.badge && (
//                   <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter bg-blue-600 text-white rounded-md shadow-sm">
//                     {item.badge}
//                   </span>
//                 )}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Bottom Section */}
//         <div className="p-4 border-t border-slate-800 dark:border-gray-900 bg-slate-900/50 dark:bg-black/50">
//           <div className="flex items-center justify-between p-3 bg-slate-800/30 dark:bg-gray-900/30 rounded-xl border border-slate-800/50 dark:border-gray-900/50">
//             <div className="flex items-center space-x-3 overflow-hidden">
//               <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg ring-2 ring-white/5">
//                 <span className="text-xs font-bold text-white">TH</span>
//               </div>
//               <div className="min-w-0">
//                 <p className="text-xs font-bold text-white truncate">Thamsanqa Hadebe</p>
//                 <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Administrator</p>
//               </div>
//             </div>
//             <button className="flex-shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 dark:hover:bg-gray-800/50 rounded-lg transition-all">
//               <LogOut size={16} />
//             </button>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// };

// const Header = ({ toggleSidebar, theme, toggleTheme }: { toggleSidebar: () => void, theme: string, toggleTheme: () => void }) => {
//   const [networkStatus, setNetworkStatus] = useState<'connected' | 'disconnected'>('connected');
//   const [aiHealth, setAiHealth] = useState<'healthy' | 'unhealthy'>('healthy');

//   useEffect(() => {
//     // Check backend health
//     apiService.healthCheck()
//       .then(() => setAiHealth('healthy'))
//       .catch(() => setAiHealth('unhealthy'));

//     // Check blockchain connection
//     blockchainService.checkConnection()
//       .then(connected => setNetworkStatus(connected ? 'connected' : 'disconnected'));
//   }, []);

//   return (
//     <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
//       <div className="px-6 py-4 flex items-center justify-between">
//         {/* Left */}
//         <div className="flex items-center space-x-4">
//           <button
//             onClick={toggleSidebar}
//             className="lg:hidden p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-95"
//           >
//             <Menu size={22} />
//           </button>
          
//           <div className="relative hidden md:block group">
//             <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
//             <input
//               type="search"
//               placeholder="Search platform..."
//               className="pl-11 pr-4 py-2 w-72 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
//             />
//           </div>
//         </div>

//         {/* Right */}
//         <div className="flex items-center space-x-2">
//           {/* Status Indicators */}
//           <div className="hidden lg:flex items-center space-x-2 mr-4">
//             <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${networkStatus === 'connected' ? 'bg-green-500/5 border-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/5 border-red-500/10 text-red-600 dark:text-red-400'}`}>
//               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${networkStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
//               <span className="text-[11px] font-bold uppercase tracking-wider">
//                 {networkStatus === 'connected' ? 'Mainnet' : 'Offline'}
//               </span>
//             </div>

//             <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${aiHealth === 'healthy' ? 'bg-blue-500/5 border-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-orange-500/5 border-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
//               <Bot size={14} />
//               <span className="text-[11px] font-bold uppercase tracking-wider">
//                 {aiHealth === 'healthy' ? 'AI Ready' : 'AI Syncing'}
//               </span>
//             </div>
//           </div>

//           <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-2 hidden lg:block" />

//           {/* Theme Toggle */}
//           <button
//             onClick={toggleTheme}
//             className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-95"
//             title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
//           >
//             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
//           </button>

//           {/* Notifications */}
//           <button className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-95">
//             <Bell size={20} />
//             <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-950" />
//           </button>

//           <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-2" />

//           {/* Wallet */}
//           <div className="hidden sm:block">
//             <WalletConnect />
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// const Footer = () => (
//   <footer className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-950 text-white mt-auto">
//     <div className="px-6 py-8">
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//         <div>
//           <div className="flex items-center space-x-3 mb-4">
//             <Shield size={24} className="text-blue-400" />
//             <span className="text-xl font-bold">TenderChain AI</span>
//           </div>
//           <p className="text-gray-400 text-sm">
//             Revolutionizing public procurement through blockchain transparency and AI objectivity.
//           </p>
//         </div>

//         <div>
//           <h3 className="font-semibold mb-4 text-white">Platform</h3>
//           <ul className="space-y-2 text-gray-400 text-sm">
//             <li><Link to="/tenders" className="hover:text-white transition-colors">Browse Tenders</Link></li>
//             <li><Link to="/submit" className="hover:text-white transition-colors">Submit Tender</Link></li>
//             <li><Link to="/analytics" className="hover:text-white transition-colors">AI Analytics</Link></li>
//             <li><Link to="/audit" className="hover:text-white transition-colors">Audit Trail</Link></li>
//           </ul>
//         </div>

//         <div>
//           <h3 className="font-semibold mb-4 text-white">Technology</h3>
//           <ul className="space-y-2 text-gray-400 text-sm">
//             <li className="flex items-center space-x-2">
//               <div className="w-2 h-2 bg-blue-500 rounded-full" />
//               <span>Blockchain Smart Contracts</span>
//             </li>
//             <li className="flex items-center space-x-2">
//               <div className="w-2 h-2 bg-purple-500 rounded-full" />
//               <span>AI-Powered Evaluation</span>
//             </li>
//             <li className="flex items-center space-x-2">
//               <div className="w-2 h-2 bg-green-500 rounded-full" />
//               <span>IPFS Document Storage</span>
//             </li>
//           </ul>
//         </div>

//         <div>
//           <h3 className="font-semibold mb-4 text-white">Security</h3>
//           <div className="flex items-center space-x-4">
//             <Lock className="text-gray-400 hover:text-white cursor-pointer" size={20} />
//             <Globe className="text-gray-400 hover:text-white cursor-pointer" size={20} />
//             <Shield className="text-gray-400 hover:text-white cursor-pointer" size={20} />
//             <CheckCircle className="text-gray-400 hover:text-white cursor-pointer" size={20} />
//           </div>
//           <p className="mt-4 text-gray-400 text-sm">
//             Built with ❤️ for transparent governance
//           </p>
//         </div>
//       </div>

//       <div className="mt-8 pt-8 border-t border-gray-700/50 text-center text-gray-400 text-sm">
//         <p>© {new Date().getFullYear()} TenderChain AI. All rights reserved. | Hackathon Project</p>
//       </div>
//     </div>
//   </footer>
// );

// // Main App Component
// function App() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [backendConnected, setBackendConnected] = useState(true);
//   const [walletConnected, setWalletConnected] = useState(false);
//   const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

//   useEffect(() => {
//     // Apply theme
//     if (theme === 'dark') {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//     localStorage.setItem('theme', theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme(prev => prev === 'light' ? 'dark' : 'light');
//   };

//   useEffect(() => {
//     // Initialize services
//     const initServices = async () => {
//       try {
//         // Check backend connection (don't block on failure)
//         apiService.healthCheck()
//           .then(() => setBackendConnected(true))
//           .catch(() => console.log('Backend not available - running in demo mode'));
        
//         // Initialize blockchain
//         await blockchainService.initialize();
//         setWalletConnected(blockchainService.isConnected());
        
//         console.log('✅ Services initialized successfully');
//       } catch (error) {
//         console.error('❌ Service initialization failed:', error);
//       }
//     };

//     initServices();
//   }, []);

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
//         {/* Toast Notifications */}
//         <Toaster 
//           position="top-right"
//           theme={theme as 'light' | 'dark'}
//           toastOptions={{
//             className: 'font-sans',
//             duration: 4000,
//           }}
//         />

//         {/* Sidebar */}
//         <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

//         {/* Main Content */}
//         <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
//           {/* Header */}
//           <Header toggleSidebar={toggleSidebar} theme={theme} toggleTheme={toggleTheme} />

//           {/* Page Content */}
//           <main className="flex-1 p-6">
//             {/* Status Banner */}
//             {!walletConnected && (
//               <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 shadow-sm">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <Wallet className="text-orange-600 dark:text-orange-400" size={20} />
//                     <div>
//                       <h3 className="font-medium text-gray-900 dark:text-white">Connect Your Wallet</h3>
//                       <p className="text-sm text-gray-600 dark:text-gray-400">
//                         Connect MetaMask to submit tenders and interact with smart contracts
//                       </p>
//                     </div>
//                   </div>
//                   <WalletConnect />
//                 </div>
//               </div>
//             )}

//             {/* Stats Overview */}
//             <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//               {[
//                 { label: 'Active Tenders', value: '42', icon: <FileText size={18} />, color: 'blue', change: '↑ 12%' },
//                 { label: 'AI Evaluations', value: '1,248', icon: <Bot size={18} />, color: 'indigo', change: '99.2% Acc' },
//                 { label: 'Blockchain TX', value: '8,569', icon: <Shield size={18} />, color: 'emerald', change: 'Verified' },
//                 { label: 'Total Value', value: '$4.2M', icon: <TrendingUp size={18} />, color: 'amber', change: '↑ 18%' },
//                 { label: 'Avg. Processing', value: '2.4d', icon: <CheckCircle size={18} />, color: 'rose', change: '↓ 40% Time' }
//               ].map((stat, i) => (
//                 <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default group">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
//                       <p className="text-2xl font-black text-gray-900 dark:text-white mt-1.5 tabular-nums tracking-tight">{stat.value}</p>
//                     </div>
//                     <div className={`p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-400 dark:text-gray-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all duration-300`}>
//                       {stat.icon}
//                     </div>
//                   </div>
//                   <div className="flex items-center mt-3 space-x-2">
//                     <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800`}>
//                       {stat.change}
//                     </span>
//                     <div className="h-1 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
//                       <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Routes */}
//             <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 p-6 min-h-[500px] shadow-sm transition-all duration-300">
//               <Routes>
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/submit" element={<TenderForm />} />
//                 <Route path="/tenders" element={<TenderList />} />
//                 <Route path="/bidders" element={<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 font-medium">Bidders Directory (Coming Soon)</div>} />
//                 <Route path="/audit" element={<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 font-medium">Immutable Audit Trail (Coming Soon)</div>} />
//                 <Route path="/analytics" element={<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 font-medium text-center">AI Analytics Dashboard<br/><span className="text-xs font-normal opacity-60">Syncing with neural engine...</span></div>} />
//                 <Route path="/settings" element={<div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 font-medium">Platform Settings (Coming Soon)</div>} />
//                 <Route path="*" element={<Navigate to="/" />} />
//               </Routes>
//             </div>
//           </main>

//           {/* Footer */}

//           {/* Footer */}
//           <Footer />
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;