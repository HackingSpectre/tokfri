import UserProfile from './UserProfile';
import MediaUpload from './MediaUpload';
import HashtagPreview from './HashtagPreview';
import PostToolbar from './PostToolbar';

interface User {
  username: string;
  profileImage?: string | null;
  avatarUrl?: string | null;
  displayName?: string | null;
}

interface PostComposerProps {
  user: User;
  content: string;
  charCount: number;
  maxChars: number;
  mediaUrls: string[];
  hashtags: string[];
  canPost: boolean;
  isPosting: boolean;
  onContentChange: (value: string) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onMintPost: () => void;
}

export default function PostComposer({
  user,
  content,
  charCount,
  maxChars,
  mediaUrls,
  hashtags,
  canPost,
  isPosting,
  onContentChange,
  onImageUpload,
  onRemoveImage,
  onMintPost
}: PostComposerProps) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <UserProfile user={user} />

      <div className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="What's happening? Use #hashtags to categorize your post..."
          className="w-full h-32 lg:h-40 bg-transparent border-none outline-none resize-none text-lg placeholder-gray-500"
          disabled={isPosting}
        />

        <MediaUpload
          mediaUrls={mediaUrls}
          onImageUpload={onImageUpload}
          onRemoveImage={onRemoveImage}
          isDisabled={isPosting}
        />

        <HashtagPreview hashtags={hashtags} />
      </div>

      <PostToolbar
        charCount={charCount}
        maxChars={maxChars}
        mediaUrls={mediaUrls}
        canPost={canPost}
        isPosting={isPosting}
        onImageUpload={onImageUpload}
        onMintPost={onMintPost}
      />
    </div>
  );
}