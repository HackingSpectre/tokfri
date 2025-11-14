'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  showClearButton?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export default function SearchInput({
  onSearch,
  onClear,
  onFocus,
  onBlur,
  placeholder = "Search users...",
  debounceMs = 300,
  isLoading = false,
  showClearButton = true,
  autoFocus = false,
  className = ""
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, debounceMs]); // Remove onSearch from deps to prevent infinite loop

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    setQuery('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200
        ${isFocused 
          ? 'border-primary/50 bg-white/5 shadow-lg shadow-primary/10' 
          : 'border-white/10 bg-white/5 hover:border-white/20'
        }
      `}>
        <Search 
          size={20} 
          className={`flex-shrink-0 transition-colors ${
            isFocused ? 'text-primary' : 'text-gray-400'
          }`} 
        />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Loading Spinner */}
        {isLoading && (
          <Loader2 size={18} className="text-primary animate-spin flex-shrink-0" />
        )}

        {/* Clear Button */}
        {showClearButton && query && !isLoading && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-white/10 rounded-full transition-all flex-shrink-0 group"
            aria-label="Clear search"
          >
            <X size={16} className="text-gray-400 group-hover:text-white" />
          </button>
        )}
      </div>

      {/* Search suggestions backdrop */}
      {isFocused && query && (
        <div className="absolute inset-x-0 top-full mt-2 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-hidden">
          {/* This will be populated by the parent component */}
        </div>
      )}
    </div>
  );
}