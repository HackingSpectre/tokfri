'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { useSidebar } from '@/lib/context/SidebarContext';
import { useSessionMonitor } from '@/lib/hooks/useSessionMonitor';

export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Monitor session validity (optimized)
  useSessionMonitor();
  
  // Handle route change loading states
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 100);
    return () => clearTimeout(timer);
  }, [pathname]);
  
  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors">
      {/* Header - Full width, independent of sidebar */}
      <Header />
      
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar />
      
      {/* Main content - Adjust padding based on sidebar state */}
      <main className={`pt-16 pb-20 lg:pb-8 min-h-screen transition-all duration-300 ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-80'
      }`}>
        <div className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto px-4">
          {/* Navigation loading indicator */}
          {isNavigating && (
            <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-pink-600 animate-pulse"></div>
          )}
          {children}
        </div>
      </main>
      
      {/* Bottom navigation for mobile */}
      <BottomNav />
    </div>
  );
}
