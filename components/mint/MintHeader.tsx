interface MintHeaderProps {
  title?: string;
  description?: string;
}

export default function MintHeader({ 
  title = "Mint Your Post", 
  description = "Transform your thoughts into valuable content" 
}: MintHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}