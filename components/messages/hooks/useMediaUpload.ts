import { useState, useCallback } from 'react';

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useMediaUpload() {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error(`${file.name} is not an image file`);
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${file.name} is too large (max 5MB)`);
    }

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
  }, []);

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    
    if (mediaFiles.length + newFiles.length > MAX_IMAGES) {
      console.error(`You can only upload up to ${MAX_IMAGES} images per message`);
      return;
    }

    setIsUploading(true);

    try {
      const urls = await Promise.all(newFiles.map(uploadImage));
      
      setMediaFiles(prev => [...prev, ...newFiles]);
      setMediaUrls(prev => [...prev, ...urls]);
    } catch (err: any) {
      console.error('Failed to upload images:', err.message);
    } finally {
      setIsUploading(false);
    }
  }, [mediaFiles.length, uploadImage]);

  const removeImage = useCallback((index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearMedia = useCallback(() => {
    setMediaFiles([]);
    setMediaUrls([]);
  }, []);

  return {
    mediaFiles,
    mediaUrls,
    isUploading,
    handleImageUpload,
    removeImage,
    clearMedia,
  };
}
