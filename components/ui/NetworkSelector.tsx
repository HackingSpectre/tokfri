'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Network } from 'lucide-react';

interface NetworkSelectorProps {
  currentNetwork: 'mainnet' | 'devnet' | 'testnet';
  onNetworkChange: (network: 'mainnet' | 'devnet' | 'testnet') => void;
  disabled?: boolean;
}

const NETWORKS = [
  { value: 'mainnet' as const, label: 'Mainnet', color: 'bg-green-500', desc: '' },
  { value: 'testnet' as const, label: 'Testnet', color: 'bg-orange-500', desc: '' },
  { value: 'devnet' as const, label: 'Devnet', color: 'bg-blue-500', desc: '' },
] as const;

export default function NetworkSelector({ 
  currentNetwork, 
  onNetworkChange, 
  disabled = false 
}: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentNetworkData = NETWORKS.find(n => n.value === currentNetwork) || NETWORKS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNetworkSelect = (network: 'mainnet' | 'devnet' | 'testnet') => {
    console.log('Selecting network:', network);
    onNetworkChange(network);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Main Button */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            console.log('Network selector clicked, current state:', isOpen, 'current network:', currentNetwork);
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-4 rounded-lg transition-all border ${
          disabled 
            ? 'opacity-50 cursor-not-allowed border-white/5' 
            : 'glass hover:bg-white/5 cursor-pointer border-white/10 hover:border-primary/20 focus:border-primary/40 focus:outline-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <Network size={18} className="text-gray-400" />
          <div className={`w-3 h-3 rounded-full ${currentNetworkData.color} flex-shrink-0`} />
          <div className="text-left">
            <div className="text-sm font-medium text-white">{currentNetworkData.label}</div>
            <div className="text-xs text-gray-400">{currentNetworkData.desc}</div>
          </div>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20" 
            onClick={() => {
              console.log('Backdrop clicked, closing dropdown');
              setIsOpen(false);
            }} 
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden shadow-2xl z-50 animate-slide-down">
            {NETWORKS.map((network, index) => {
              const isSelected = network.value === currentNetwork;
              console.log(`Rendering network ${index + 1}:`, network.label, 'selected:', isSelected);
              
              return (
                <button
                  key={network.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Network button clicked:', network.label);
                    handleNetworkSelect(network.value);
                  }}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-white/10 transition-all ${
                    isSelected 
                      ? 'bg-primary/20 text-primary border-l-4 border-primary' 
                      : 'text-gray-100 hover:text-white'
                  } ${index !== NETWORKS.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <div className={`w-3 h-3 rounded-full ${network.color} flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{network.label}</div>
                    <div className="text-xs opacity-70">{network.desc}</div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}