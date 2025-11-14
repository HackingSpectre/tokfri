'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User, 
  Users,
  LogOut,
  X,
  Wallet,
  ChevronRight,
  ChevronDown,
  Settings,
  Sun,
  Moon,
  Copy,
  ExternalLink,
  Gem,
  Send,
  Download,
  Eye,
  Globe,
  ArrowUpRight,
  ArrowDownLeft,
  Coins
} from 'lucide-react';
import { useSidebar } from '@/lib/context/SidebarContext';
import { useWallet } from '@/lib/context/WalletContext';
import { useTheme } from '@/lib/context/ThemeContext';

export default function MobileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isMobileOpen, closeMobile } = useSidebar();
  const { logout, user, address, balance } = useWallet();
  const [isWalletExpanded, setIsWalletExpanded] = useState(false);
  const [activeWalletTab, setActiveWalletTab] = useState('overview'); // overview, assets, send, receive
  const [selectedNetwork, setSelectedNetwork] = useState('devnet');
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');

  // Close sidebar when route changes
  useEffect(() => {
    if (isMobileOpen) {
      closeMobile();
    }
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
    closeMobile();
  };

  const handleSendTokens = async () => {
    if (!sendAmount || !sendAddress) {
      alert('Please enter both amount and recipient address');
      return;
    }
    
    try {
      // Here you would implement the actual token sending logic
      // For now, we'll just show an alert
      alert(`Sending ${sendAmount} SUI to ${sendAddress}`);
      setSendAmount('');
      setSendAddress('');
      setActiveWalletTab('overview');
    } catch (error) {
      alert('Failed to send tokens. Please try again.');
    }
  };

  const networks = [
    { id: 'mainnet', name: 'Mainnet', color: 'bg-green-500' },
    { id: 'devnet', name: 'Devnet', color: 'bg-blue-500' },
    { id: 'testnet', name: 'Testnet', color: 'bg-yellow-500' }
  ];

  // Mock assets data - in real app, this would come from wallet context
  const assets = [
    { symbol: 'SUI', name: 'Sui', balance: balance || '0.00', icon: '🔵' },
    { symbol: 'USDC', name: 'USD Coin', balance: '0.00', icon: '💵' },
    { symbol: 'DEEP', name: 'DeepBook', balance: '0.00', icon: '📚' }
  ];


  if (!isMobileOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] lg:hidden"
        onClick={closeMobile}
      />
      
      {/* Mobile Sidebar */}
      <aside 
        className={`
          fixed top-0 right-0 bottom-0 z-50 lg:hidden
          w-[85vw] max-w-sm
          bg-white 
          transform transition-transform duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col shadow-2xl
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with User Info */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={closeMobile}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* User Profile Section */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User size={28} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">@{user.username}</h3>
                <p className="text-pink-100 text-sm truncate">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">
          

          {/* Wallet Section */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => setIsWalletExpanded(!isWalletExpanded)}
              className="w-full flex items-center gap-4 p-4 bg-pink-50 border border-pink-200 rounded-xl hover:bg-pink-100 transition-all group"
            >
              <div className="p-2 bg-pink-100 rounded-lg">
                <Wallet size={20} className="text-pink-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Wallet</p>
                <p className="text-sm text-pink-600 font-medium">
                  {balance ? `${balance} SUI` : '0.00 SUI'}
                </p>
              </div>
              {isWalletExpanded ? (
                <ChevronDown size={16} className="text-pink-400" />
              ) : (
                <ChevronRight size={16} className="text-pink-400" />
              )}
            </button>

            {/* Expanded Wallet Details */}
            {isWalletExpanded && (
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                {/* Network Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Network</label>
                  <div className="flex gap-2">
                    {networks.map((network) => (
                      <button
                        key={network.id}
                        onClick={() => setSelectedNetwork(network.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedNetwork === network.id
                            ? 'bg-pink-100 text-pink-700 border border-pink-300'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${network.color}`} />
                        {network.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wallet Tabs */}
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'assets', label: 'Assets', icon: Coins },
                    { id: 'send', label: 'Send', icon: Send }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveWalletTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                          activeWalletTab === tab.id
                            ? 'bg-pink-100 text-pink-700'
                            : 'text-gray-600 hover:text-pink-600'
                        }`}
                      >
                        <Icon size={14} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="space-y-3">
                  {/* Overview Tab */}
                  {activeWalletTab === 'overview' && (
                    <div className="space-y-3">
                      {/* Balance Display */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Gem size={16} className="text-pink-600" />
                          <span className="text-sm font-medium text-gray-700">Total Balance</span>
                        </div>
                        <span className="font-bold text-pink-600">
                          {balance ? `${balance} SUI` : '0.00 SUI'}
                        </span>
                      </div>

                      {/* Address Display */}
                      {address && (
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Address</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(address)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Copy address"
                            >
                              <Copy size={14} className="text-gray-500" />
                            </button>
                          </div>
                          <div className="font-mono text-xs text-gray-600 break-all">
                            {address}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setActiveWalletTab('send')}
                          className="flex items-center justify-center gap-2 p-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
                        >
                          <ArrowUpRight size={16} />
                          Send
                        </button>
                        <button className="flex items-center justify-center gap-2 p-3 bg-white border border-pink-200 text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition-colors">
                          <ArrowDownLeft size={16} />
                          Receive
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Assets Tab */}
                  {activeWalletTab === 'assets' && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Your Assets</h4>
                      {assets.map((asset) => (
                        <div key={asset.symbol} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{asset.icon}</span>
                            <div>
                              <p className="font-medium text-gray-900">{asset.symbol}</p>
                              <p className="text-xs text-gray-500">{asset.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{asset.balance}</p>
                            <p className="text-xs text-gray-500">{asset.symbol}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Send Tab */}
                  {activeWalletTab === 'send' && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Send Tokens</h4>
                      
                      {/* Amount Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Amount (SUI)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Available: {balance || '0.00'} SUI</span>
                          <button 
                            onClick={() => setSendAmount(balance || '0')}
                            className="text-pink-600 hover:text-pink-700"
                          >
                            Max
                          </button>
                        </div>
                      </div>

                      {/* Recipient Address */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Recipient Address</label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={sendAddress}
                          onChange={(e) => setSendAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>

                      {/* Send Button */}
                      <div className="space-y-2">
                        <button
                          onClick={handleSendTokens}
                          disabled={!sendAmount || !sendAddress}
                          className="w-full p-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Send Tokens
                        </button>
                        <button
                          onClick={() => setActiveWalletTab('overview')}
                          className="w-full p-2 text-gray-600 hover:text-pink-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Explorer Link */}
                {address && (
                  <div className="pt-3 border-t border-gray-200">
                    <a
                      href={`https://suiscan.xyz/${selectedNetwork}/account/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <ExternalLink size={14} />
                      View on {networks.find(n => n.id === selectedNetwork)?.name} Explorer
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings & Actions */}
          <div className="p-4 space-y-2">
            {/* Theme Toggle */}
           

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 text-red-500 transition-all group"
            >
              <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100">
                <LogOut size={18} className="text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Log out</p>
              </div>
              <ChevronRight size={16} className="text-red-400" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}