'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User, 
  Users, 
  Gem,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  LogOut,
  Copy,
  ExternalLink,
  Send,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Globe
} from 'lucide-react';
import { useSidebar } from '@/lib/context/SidebarContext';
import { useWallet } from '@/lib/context/WalletContext';
import { useState, memo } from 'react';

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { logout, user, balance, address } = useWallet();
  const [isBalanceBlurred, setIsBalanceBlurred] = useState(false);
  const [isWalletExpanded, setIsWalletExpanded] = useState(false);
  const [activeWalletTab, setActiveWalletTab] = useState('overview'); // overview, assets, send, receive
  const [selectedNetwork, setSelectedNetwork] = useState('devnet');
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  
  const handleLogout = () => {
    logout();
    router.push('/');
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
  
  const navItems = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: '/mint', icon: Plus, label: 'Mint' },
    { href: '/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/communities', icon: Users, label: 'Communities' },
  ];

  if (pathname === '/' || pathname === '/onboarding') {
    return null;
  }

  return (
    <aside className={`hidden lg:flex fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 flex-col transition-all duration-300 z-30 ${
      isCollapsed ? 'w-20' : 'w-80'
    }`}>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-pink-50 transition-all z-50 shadow-sm"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={14} className="text-gray-900" /> : <ChevronLeft size={14} className="text-gray-900" />}
      </button>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-pink-100 text-pink-600 border border-pink-300' 
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Collapsed Logout Button */}
      {isCollapsed && (
        <div className="pb-6 px-4 flex-shrink-0 space-y-2">
          <button
            onClick={() => setIsWalletExpanded(true)}
            className="flex items-center justify-center w-full p-3 rounded-xl hover:bg-pink-100 text-pink-600 transition-all group"
            title="Open Wallet"
          >
            <Wallet size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-3 rounded-xl hover:bg-red-50 text-red-500 transition-all group"
            title="Log out"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
      
      {/* Wallet Section - Always Visible at Bottom */}
      {!isCollapsed && (
        <div className="pb-6 px-4 space-y-4 flex-shrink-0">
          <div className="w-full bg-pink-50 border border-pink-200 rounded-xl p-4 space-y-3 group">
            <button
              onClick={() => setIsWalletExpanded(!isWalletExpanded)}
              className="flex items-center gap-2 w-full"
            >
              <Gem size={20} className="text-pink-600 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 text-left">Your Balance</p>
                <div className="flex items-center gap-2">
                  <div className={`font-bold text-pink-600 transition-all ${
                    isBalanceBlurred ? 'blur-sm select-none' : ''
                  }`}>
                    {balance ? `${balance} SUI` : '0.00 SUI'}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsBalanceBlurred(!isBalanceBlurred);
                    }}
                    className="p-1 hover:bg-pink-100 rounded transition-all"
                    title={isBalanceBlurred ? 'Show balance' : 'Hide balance'}
                  >
                    {isBalanceBlurred ? <EyeOff size={14} className="text-gray-600" /> : <Eye size={14} className="text-gray-600" />}
                  </button>
                </div>
              </div>
              {isWalletExpanded ? (
                <ChevronDown size={16} className="text-pink-400" />
              ) : (
                <ChevronRight size={16} className="text-pink-400" />
              )}
            </button>
            
            {/* User Info */}
            {user && !isWalletExpanded && (
              <div className="flex items-center gap-2 pt-2 border-t border-pink-200">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate text-gray-900">@{user.username}</p>
                </div>
                <Wallet size={14} className="text-gray-600 group-hover:text-pink-600 transition-colors" />
              </div>
            )}

            {/* Expanded Wallet Details */}
            {isWalletExpanded && (
              <div className="pt-3 border-t border-pink-200 space-y-4">
                {/* Network Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Network</label>
                  <div className="flex gap-1">
                    {networks.map((network) => (
                      <button
                        key={network.id}
                        onClick={() => setSelectedNetwork(network.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                          selectedNetwork === network.id
                            ? 'bg-pink-100 text-pink-700 border border-pink-300'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${network.color}`} />
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
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-all ${
                          activeWalletTab === tab.id
                            ? 'bg-pink-100 text-pink-700'
                            : 'text-gray-600 hover:text-pink-600'
                        }`}
                      >
                        <Icon size={12} />
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
                      {/* Address Display */}
                      {address && (
                        <div className="p-3 bg-white rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">Address</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(address)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Copy address"
                            >
                              <Copy size={12} className="text-gray-500" />
                            </button>
                          </div>
                          <div className="font-mono text-xs text-gray-600 break-all">
                            {address.slice(0, 12)}...{address.slice(-8)}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setActiveWalletTab('send')}
                          className="flex items-center justify-center gap-1 p-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors text-xs"
                        >
                          <ArrowUpRight size={12} />
                          Send
                        </button>
                        <button className="flex items-center justify-center gap-1 p-2 bg-white border border-pink-200 text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition-colors text-xs">
                          <ArrowDownLeft size={12} />
                          Receive
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Assets Tab */}
                  {activeWalletTab === 'assets' && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Your Assets</h4>
                      {assets.map((asset) => (
                        <div key={asset.symbol} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{asset.icon}</span>
                            <div>
                              <p className="text-xs font-medium text-gray-900">{asset.symbol}</p>
                              <p className="text-xs text-gray-500">{asset.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-900">{asset.balance}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Send Tab */}
                  {activeWalletTab === 'send' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-medium text-gray-700">Send Tokens</h4>
                      
                      {/* Amount Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Amount (SUI)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Recipient Address</label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={sendAddress}
                          onChange={(e) => setSendAddress(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                      </div>

                      {/* Send Button */}
                      <div className="space-y-1">
                        <button
                          onClick={handleSendTokens}
                          disabled={!sendAmount || !sendAddress}
                          className="w-full p-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs"
                        >
                          Send Tokens
                        </button>
                        <button
                          onClick={() => setActiveWalletTab('overview')}
                          className="w-full p-1 text-gray-600 hover:text-pink-600 transition-colors text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Explorer Link */}
                {address && (
                  <div className="pt-2 border-t border-gray-200">
                    <a
                      href={`https://suiscan.xyz/${selectedNetwork}/account/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 text-xs"
                    >
                      <ExternalLink size={12} />
                      View on {networks.find(n => n.id === selectedNetwork)?.name} Explorer
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
            
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-red-50 text-red-500 transition-all group text-sm"
            title="Log out"
          >
            <LogOut size={16} className="group-hover:scale-110 transition-transform" />
            <span>Log out</span>
          </button>
        </div>
      )}
      
    </aside>
  );
}

export default memo(Sidebar);