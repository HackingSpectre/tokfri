'use client';

import { Check, Sparkles } from 'lucide-react';

interface ChooseInterest2Props {
  onNext: () => void;
  selectedInterests: string[];
  onInterestToggle: (interest: string) => void;
}

const premiumInterests = [
  { id: 'investing', name: 'Investing', icon: '📈' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏠' },
  { id: 'startups', name: 'Startups', icon: '🚀' },
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖' },
  { id: 'design', name: 'UI/UX Design', icon: '🎯' },
  { id: 'marketing', name: 'Marketing', icon: '📊' },
  { id: 'blockchain', name: 'Blockchain', icon: '⛓️' },
  { id: 'sustainability', name: 'Sustainability', icon: '♻️' },
  { id: 'astronomy', name: 'Astronomy', icon: '🌌' },
  { id: 'philosophy', name: 'Philosophy', icon: '🧠' },
  { id: 'meditation', name: 'Meditation', icon: '🧘‍♂️' },
  { id: 'languages', name: 'Languages', icon: '🗣️' },
];

export default function ChooseInterest2({ 
  onNext, 
  selectedInterests, 
  onInterestToggle 
}: ChooseInterest2Props) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-20 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-purple-600" size={28} />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Premium Interests
          </h2>
        </div>
        <p className="text-gray-600 text-base md:text-lg">
          Final step! Select any additional interests
        </p>
        <div className="mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-300 rounded-full">
            <span className="text-purple-700 text-sm font-medium">
              {selectedInterests.length} total selected
            </span>
          </div>
        </div>
      </div>

      {/* Interests Grid */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {premiumInterests.map((interest) => {
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

      {/* Get Started Button */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={onNext}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Sparkles size={20} />
          Get Started
        </button>
        <p className="text-center text-gray-500 text-sm mt-4">
          You can always change your interests later in settings
        </p>
      </div>
    </div>
  );
}
