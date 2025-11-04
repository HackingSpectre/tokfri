'use client';

import { Check } from 'lucide-react';

interface ChooseInterest1Props {
  onNext: () => void;
  onSkip: () => void;
  selectedInterests: string[];
  onInterestToggle: (interest: string) => void;
}

const additionalInterests = [
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'health', name: 'Health & Wellness', icon: '🧘' },
  { id: 'nature', name: 'Nature', icon: '🌿' },
  { id: 'pets', name: 'Pets & Animals', icon: '🐾' },
  { id: 'comedy', name: 'Comedy', icon: '😂' },
  { id: 'news', name: 'News & Politics', icon: '📰' },
  { id: 'cryptocurrency', name: 'Crypto & Web3', icon: '₿' },
  { id: 'diy', name: 'DIY & Crafts', icon: '🛠️' },
  { id: 'beauty', name: 'Beauty', icon: '💄' },
  { id: 'automotive', name: 'Automotive', icon: '🚗' },
];

export default function ChooseInterest1({ 
  onNext, 
  onSkip, 
  selectedInterests, 
  onInterestToggle 
}: ChooseInterest1Props) {
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
          More Interests
        </h2>
        <p className="text-gray-600 text-base md:text-lg">
          Select more to get better recommendations
        </p>
        <div className="mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-300 rounded-full">
            <span className="text-purple-700 text-sm font-medium">
              {selectedInterests.length} selected
            </span>
          </div>
        </div>
      </div>

      {/* Interests Grid */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {additionalInterests.map((interest) => {
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
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
