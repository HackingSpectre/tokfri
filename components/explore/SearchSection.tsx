import { useState } from 'react';
import { Clock, X } from 'lucide-react';
import SearchInput from '@/components/ui/SearchInput';

interface SearchSectionProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  searchHistory: string[];
  onHistorySelect: (query: string) => void;
  onRemoveFromHistory: (query: string) => void;
  onClearHistory: () => void;
  currentQuery: string;
}

export default function SearchSection({
  onSearch,
  onClear,
  isLoading,
  autoFocus = false,
  placeholder = "Search people...",
  searchHistory,
  onHistorySelect,
  onRemoveFromHistory,
  onClearHistory,
  currentQuery
}: SearchSectionProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleHistorySelect = (query: string) => {
    onHistorySelect(query);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <SearchInput
        onSearch={onSearch}
        onClear={onClear}
        placeholder={placeholder}
        isLoading={isLoading}
        autoFocus={autoFocus}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {/* Search Suggestions */}
      {showSuggestions && searchHistory.length > 0 && !currentQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-80 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Recent searches</span>
              <button
                onClick={onClearHistory}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear all
              </button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {searchHistory.map((query, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-white/5 transition-all"
              >
                <button
                  onClick={() => handleHistorySelect(query)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm">{query}</span>
                </button>
                <button
                  onClick={() => onRemoveFromHistory(query)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}