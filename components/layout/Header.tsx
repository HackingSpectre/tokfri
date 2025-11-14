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

  if (pathname === '/' || pathname === '/onboarding') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-10">
        {/* Left Side - Profile/Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile: Profile Image, Desktop: Logo */}
          <div className="lg:hidden">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-pink-200"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
            )}
          </div>
          
          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <h1 className="text-xl font-bold text-pink-600">Tokfri</h1>
          </div>
        </div>

        {/* Center - Desktop Title */}
        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-gray-900">
            {pathname === '/feed' && 'Feed'}
            {pathname === '/explore' && 'Explore'} 
            {pathname === '/mint' && 'Mint'}
            {pathname === '/messages' && 'Messages'}
            {pathname === '/profile' && 'Profile'}
            {pathname === '/communities' && 'Communities'}
            {!pathname.match(/\/(feed|explore|mint|messages|profile|communities)$/) && 'Tokfri'}
          </h2>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobile}
            className="lg:hidden p-2 hover:bg-pink-50 rounded-lg transition-all"
            aria-label="Menu"
          >
            <Menu size={22} className="text-gray-900" />
          </button>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Notifications */}
            <button 
              className="p-2 hover:bg-pink-50 rounded-lg transition-all"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-900" />
            </button>

            {/* Settings Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-pink-50 rounded-lg transition-all"
                aria-label="Settings"
              >
                <Settings size={20} className="text-gray-900" />
              </button>
              
              {showSettings && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSettings(false)}
                  />
                  <div className="absolute right-0 top-12 w-72 bg-white border border-gray-200 rounded-xl p-4 space-y-3 z-50 shadow-xl">
                    <h3 className="font-semibold text-sm text-gray-600">Account & Settings</h3>
                    
                    {/* User Info Section */}
                    {user && address && (
                      <div className="flex items-center gap-3 py-3 border-b border-gray-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
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
                          <p className="font-medium text-sm truncate text-gray-900">@{user.username}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 text-gray-900">
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        <span className="text-sm">Theme</span>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative w-12 h-6 rounded-full transition-all ${
                          theme === 'dark' ? 'bg-pink-600' : 'bg-gray-300'
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
                      className="w-full flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-red-50 text-red-500 transition-all group"
                    >
                      <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Log out @{user?.username || 'user'}</span>
                    </button>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'} • zkLogin Secure
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);