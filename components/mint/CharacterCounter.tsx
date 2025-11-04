interface CharacterCounterProps {
  charCount: number;
  maxChars: number;
}

export default function CharacterCounter({ charCount, maxChars }: CharacterCounterProps) {
  const isOverLimit = charCount > maxChars;
  const isNearLimit = charCount > maxChars * 0.8;
  
  const textColor = isOverLimit ? 'text-red-400' : 
                   isNearLimit ? 'text-orange-400' : 
                   'text-gray-400';

  const ringColor = isOverLimit ? 'text-red-400' : 
                   isNearLimit ? 'text-orange-400' : 
                   'text-primary';

  return (
    <div className="flex items-center gap-2">
      <div className={`text-sm ${textColor}`}>
        {charCount}/{maxChars}
      </div>
      
      {/* Progress Ring */}
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-gray-600"
          />
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 8}`}
            strokeDashoffset={`${2 * Math.PI * 8 * (1 - charCount / maxChars)}`}
            className={`transition-all ${ringColor}`}
          />
        </svg>
      </div>
    </div>
  );
}