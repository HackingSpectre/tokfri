'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useWallet } from '@/lib/context/WalletContext';
import { useRouter } from 'next/navigation';

// Import modular components
import {
  MintHeader,
  NotificationBanner,
  PostComposer,
  InfoCards,
} from '@/components/mint';

export default function MintPageContent() {
  const { user } = useWallet();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const MAX_CHARS = 280;

  const handleContentChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setContent(value);
      setCharCount(value.length);
      setError('');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Limit to 4 images total
    const filesToUpload = Array.from(files).slice(0, 4 - mediaUrls.length);
    
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to upload image');
        }

        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setMediaUrls(prev => [...prev, ...uploadedUrls].slice(0, 4));
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
      console.error('Image upload error:', err);
    }
  };

  const removeImage = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const extractHashtags = (text: string) => {
    const matches = text.match(/#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi) || [];
    return [...new Set(matches.map(tag => tag.toLowerCase()))];
  };

  const handleMintPost = async () => {
    if (!user) {
      setError('You must be logged in to mint a post');
      return;
    }

    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    setIsPosting(true);
    setError('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          userId: user.id,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      setSuccess('Post minted successfully');
      setContent('');
      setCharCount(0);
      setMediaUrls([]);
      
      // Redirect to feed after short delay
      setTimeout(() => {
        router.push('/feed');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to mint post');
    } finally {
      setIsPosting(false);
    }
  };

  const hashtags = extractHashtags(content);
  const isOverLimit = charCount > MAX_CHARS;
  const canPost = Boolean(content.trim().length > 0 && !isOverLimit && user);

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <MintHeader />

        {success && (
          <NotificationBanner 
            type="success" 
            message={success}
            onClose={() => setSuccess('')}
          />
        )}

        {error && (
          <NotificationBanner 
            type="error" 
            message={error}
            onClose={() => setError('')}
          />
        )}

        <PostComposer
          user={user}
          content={content}
          charCount={charCount}
          maxChars={MAX_CHARS}
          mediaUrls={mediaUrls}
          hashtags={hashtags}
          canPost={canPost}
          isPosting={isPosting}
          onContentChange={handleContentChange}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onMintPost={handleMintPost}
        />

        <InfoCards />
      </div>
    </MainLayout>
  );
}
