import { TrendingTopic, SuggestedUser } from '@/types/feed';

interface FeedSidebarProps {
  trendingTopics?: TrendingTopic[];
  suggestedUsers?: SuggestedUser[];
  onFollowUser?: (userId: string) => void;
}

const defaultTrendingTopics: TrendingTopic[] = [
  {
    id: '1',
    category: 'Trending in NFTs',
    hashtag: '#NFTCommunity',
    postCount: '12.5K posts'
  },
  {
    id: '2',
    category: 'Trending',
    hashtag: '#Web3',
    postCount: '8.2K posts'
  }
];

const defaultSuggestedUsers: SuggestedUser[] = [
  {
    id: '1',
    username: 'creator',
    bio: 'NFT Artist',
    verified: true
  }
];

export default function FeedSidebar({ 
  trendingTopics = defaultTrendingTopics, 
  suggestedUsers = defaultSuggestedUsers,
  onFollowUser 
}: FeedSidebarProps) {
  return (
    <div className="hidden lg:block lg:col-span-4 xl:col-span-5">
      <div className="sticky top-6 space-y-6">
        
        {/* Trending Section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">Trending</h3>
          <div className="space-y-4">
            {trendingTopics.map((topic) => (
              <div 
                key={topic.id}
                className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-3 rounded-xl transition-colors"
              >
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{topic.category}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{topic.hashtag}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{topic.postCount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Users */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">Who to follow</h3>
          <div className="space-y-4">
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-gray-900 dark:text-white">@{user.username}</p>
                      {user.verified && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </div>
                    {user.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.bio}</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => onFollowUser?.(user.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}