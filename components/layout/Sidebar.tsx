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
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';
import { useSidebar } from '@/lib/context/SidebarContext';
import { useWallet } from '@/lib/context/WalletContext';
import { useState, memo } from 'react';
import WalletModal from '@/components/ui/WalletModal';

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { logout, user, balance } = useWallet();
  const [isBalanceBlurred, setIsBalanceBlurred] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
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
    <aside className={`hidden lg:flex fixed left-0 top-16 bottom-0 glass-dark border-r border-white/10 dark:border-white/10 flex-col transition-all duration-300 z-30 ${
      isCollapsed ? 'w-20' : 'w-80'
    }`}>
      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 w-6 h-6 glass rounded-full border border-white/10 dark:border-white/10 flex items-center justify-center hover:bg-primary/20 transition-all z-50"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
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
                    ? 'bg-primary/20 text-primary neon-border' 
                    : 'text-gray-400 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-white/5 hover:text-white dark:hover:text-white'
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
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center justify-center w-full p-3 rounded-xl hover:bg-primary/10 text-primary transition-all group"
            title="Open Wallet"
          >
            <Wallet size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all group"
            title="Log out"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
      
      {/* Wallet Section - Always Visible at Bottom */}
      {!isCollapsed && (
        <div className="pb-6 px-4 space-y-4 flex-shrink-0">
          <div className="w-full glass rounded-xl p-4 space-y-3 group">
            <div className="flex items-center gap-2">
              <Gem size={20} className="text-primary group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 dark:text-gray-400">Your Balance</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className={`font-bold text-primary transition-all hover:text-primary-light ${
                      isBalanceBlurred ? 'blur-sm select-none' : ''
                    }`}
                  >
                    {balance ? `${balance} SUI` : '0.00 SUI'}
                  </button>
                  <button
                    onClick={() => setIsBalanceBlurred(!isBalanceBlurred)}
                    className="p-1 hover:bg-white/5 rounded transition-all"
                    title={isBalanceBlurred ? 'Show balance' : 'Hide balance'}
                  >
                    {isBalanceBlurred ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* User Info */}
            {user && (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="flex items-center gap-2 pt-2 border-t border-white/10 w-full hover:bg-white/5 rounded-lg p-2 -m-2 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">@{user.username}</p>
                </div>
                <Wallet size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
              </button>
            )}
          </div>
            
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all group text-sm"
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