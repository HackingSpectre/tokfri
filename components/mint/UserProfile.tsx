interface User {
  username: string;
  profileImage?: string | null;
  avatarUrl?: string | null;
  displayName?: string | null;
}

interface UserProfileProps {
  user: User;
  status?: string;
}

export default function UserProfile({ user, status = "Ready to mint..." }: UserProfileProps) {
  const avatarSrc = user.profileImage || user.avatarUrl;
  
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
      <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
        {avatarSrc ? (
          <img 
            src={avatarSrc} 
            alt="Profile" 
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-xl font-bold text-white">
            {user.username.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <p className="font-semibold">
          {user.displayName ? `${user.displayName} (@${user.username})` : `@${user.username}`}
        </p>
        <p className="text-sm text-gray-400">{status}</p>
      </div>
    </div>
  );
}