import { Lock } from 'lucide-react';

interface LoginRequiredProps {
  title?: string;
  description?: string;
}

export default function LoginRequired({ 
  title = "Please log in", 
  description = "You need to be logged in to mint posts" 
}: LoginRequiredProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Lock size={48} className="text-gray-600 mx-auto" />
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}