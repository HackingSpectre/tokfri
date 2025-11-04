'use client';

import { Check } from 'lucide-react';

interface ChooseInterestProps {
  onNext: () => void;
  onSkip: () => void;
  selectedInterests: string[];
  onInterestToggle: (interest: string) => void;
}

const interests = [
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'art', name: 'Art & Design', icon: '🎨' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'food', name: 'Food & Cooking', icon: '🍳' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'photography', name: 'Photography', icon: '📸' },
  { id: 'books', name: 'Books', icon: '📚' },
  { id: 'movies', name: 'Movies & TV', icon: '🎬' },
];

export default function ChooseInterest({ 
  onNext, 
  onSkip, 
  selectedInterests, 
  onInterestToggle 
}: ChooseInterestProps) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onSkip}
          className="text-gray-600 hover:text-gray-900 transition-colors text-sm md:text-base font-medium"
        >
          Skip
        </button>
      </div>

      {/* Header */}
      <div className="px-6 pt-20 pb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Choose Your Interests
        </h2>
        <p className="text-gray-600 text-base md:text-lg">
          Select at least 3 interests to personalize your feed
        </p>
      </div>

      {/* Interests Grid */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {interests.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => onInterestToggle(interest.id)}
                className={`relative p-6 rounded-2xl transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-500 shadow-md'
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-purple-300 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                )}
                <div className="text-4xl mb-3">{interest.icon}</div>
                <div className="text-gray-900 font-medium text-sm md:text-base">
                  {interest.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={onNext}
          disabled={selectedInterests.length < 3}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue ({selectedInterests.length}/3)
        </button>
      </div>
    </div>
  );
}
