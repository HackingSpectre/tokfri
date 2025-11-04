import { Search } from 'lucide-react';

interface ExploreHeaderProps {
  title?: string;
}

export default function ExploreHeader({ title = "Explore" }: ExploreHeaderProps) {
  return (
    <div className="sticky top-16 z-20 glass-dark border-b border-white/10 p-4">
      <div className="flex items-center gap-3">
        <Search size={20} className="text-primary" />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
    </div>
  );
}