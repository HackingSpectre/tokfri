'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { memo } from 'react';

function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: '/mint', icon: Plus, label: 'Mint' },
    { href: '/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  if (pathname === '/' || pathname === '/onboarding') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/10 dark:border-white/10 pb-safe lg:hidden">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-400'
              }`}
            >
              <Icon 
                size={22} 
                className={`mb-1 ${isActive ? 'animate-glow' : ''}`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default memo(BottomNav);
