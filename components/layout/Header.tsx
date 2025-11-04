'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Settings, Sun, Moon, LogOut, User, Menu } from 'lucide-react';
import { useTheme } from '@/lib/context/ThemeContext';
import { useWallet } from '@/lib/context/WalletContext';
import { useSidebar } from '@/lib/context/SidebarContext';
import { useState, memo } from 'react';

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { logout, user, address } = useWallet();
  const { toggleMobile } = useSidebar();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setShowSettings(false);
  };
  
  const getTitle = () => {
    if (pathname === '/feed') return 'Feed';
    if (pathname === '/explore') return 'Explore';
    if (pathname === '/mint') return 'Mint';
    if (pathname === '/messages') return 'Messages';
    if (pathname === '/profile') return 'Profile';
    if (pathname === '/communities') return 'Communities';
    return 'Tokfri';
  };

  if (pathname === '/' || pathname === '/onboarding') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-dark border-b border-white/10 dark:border-white/10">
      <div className="flex items-center justify-between h-16 px-4 lg:px-10">
        {/* Left Side - Mobile menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobile}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-all"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          
          <h1 className="text-xl font-bold text-blue-600">Tokfri</h1>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <button 
            className="p-2 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          {/* Profile Button (Mobile) - Shows Quick Actions */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="lg:hidden flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-all"
            aria-label="Profile"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User size={16} className="text-white" />
              )}
            </div>
          </button>

          {/* Mobile Settings Dropdown */}
          {showSettings && (
            <>
              <div 
                className="fixed inset-0 z-30 lg:hidden" 
                onClick={() => setShowSettings(false)}
              />
              <div className="absolute right-4 top-16 w-64 glass-dark border border-white/10 rounded-xl p-4 space-y-3 z-40 lg:hidden">
                <h3 className="font-semibold text-sm text-gray-400">Quick Actions</h3>
                
                {/* User Info Section */}
                {user && address && (
                  <div className="flex items-center gap-3 py-3 border-b border-white/10">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User size={20} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">@{user.username}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all group"
                >
                  <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Log out</span>
                </button>
              </div>
            </>
          )}
          
          {/* Desktop Settings Button */}
          <div className="hidden lg:block relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
            
            {showSettings && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute right-0 top-12 w-72 glass-dark border border-white/10 dark:border-white/10 rounded-xl p-4 space-y-3 z-50">
                  <h3 className="font-semibold text-sm text-gray-400 dark:text-gray-400">Account & Settings</h3>
                  
                  {/* User Info Section */}
                  {user && address && (
                    <div className="flex items-center gap-3 py-3 border-b border-white/10">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <User size={20} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">@{user.username}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                      <span className="text-sm">Theme</span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        theme === 'dark' ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          theme === 'dark' ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all group"
                  >
                    <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Log out @{user?.username || 'user'}</span>
                  </button>
                  
                  <div className="pt-2 border-t border-white/10 dark:border-white/10">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'} • zkLogin Secure
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
