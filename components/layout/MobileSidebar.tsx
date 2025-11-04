'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User, 
  Users,
  Settings,
  LogOut,
  X,
  Gem,
  Wallet,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';
import { useSidebar } from '@/lib/context/SidebarContext';
import { useWallet } from '@/lib/context/WalletContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { formatAddress } from '@/lib/utils/zklogin';

export default function MobileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileOpen, closeMobile } = useSidebar();
  const { logout, user, address, balance } = useWallet();
  const { theme, toggleTheme } = useTheme();

  // Close sidebar when route changes (but not on initial load)
  useEffect(() => {
    // Only close if sidebar is actually open and we're navigating
    if (isMobileOpen) {
      closeMobile();
    }
  }, [pathname]); // Remove closeMobile from dependency array

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

  const navItems = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: '/mint', icon: Plus, label: 'Mint' },
    { href: '/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/communities', icon: Users, label: 'Communities' },
  ];

  if (!isMobileOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
        onClick={closeMobile}
      />
      
      {/* Mobile Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 bottom-0 z-50 lg:hidden
          w-[80vw] max-w-sm
          glass-dark border-r border-white/10
          transform transition-transform duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <h2 className="text-xl font-bold text-primary">Tokfri</h2>
          </div>
          <button
            onClick={closeMobile}
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info Section */}
        {user && (
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User size={24} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">@{user.username}</h3>
                <p className="text-sm text-gray-400 truncate">
                  {address ? formatAddress(address) : ''}
                </p>
              </div>
            </div>
            
            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Stats */}

          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={22} className="flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Wallet Section */}
        <div className="p-4 border-t border-white/10">
          <div className="glass rounded-xl p-4 space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <Gem size={18} className="text-primary" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Balance</p>
                <p className="font-bold text-primary">
                  {balance ? `${balance} SUI` : '0.00 SUI'}
                </p>
              </div>
              <Wallet size={16} className="text-gray-400" />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-2 mb-4">
     

            <Link
              href={`https://suiscan.xyz/${address ? 'devnet' : 'devnet'}/account/${address}`}
              target="_blank"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
            >
              <ExternalLink size={20} />
              <span>View on Explorer</span>
            </Link>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all"
          >
            <LogOut size={20} />
            <span>Log out @{user?.username}</span>
          </button>
        </div>
      </aside>
    </>
  );
}