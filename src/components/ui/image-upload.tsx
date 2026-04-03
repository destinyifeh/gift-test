'use client';

import {useState, useRef} from 'react';
import {cn} from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload: (formData: FormData) => Promise<{success: boolean; url?: string; error?: string}>;
  className?: string;
  placeholder?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  className,
  placeholder = 'Click to upload or drag and drop',
  maxSizeMB = 2,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Image size must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await onUpload(formData);

      if (result.success && result.url) {
        onChange(result.url);
      } else {
        setError(result.error || 'Failed to upload image');
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        id="image-upload"
      />

      {value ? (
        <div className="relative rounded-xl overflow-hidden bg-[var(--v2-surface-container-high)]">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-white text-black rounded-lg font-bold text-sm flex items-center gap-2"
            >
              <span className="v2-icon text-sm">edit</span>
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-sm flex items-center gap-2"
            >
              <span className="v2-icon text-sm">delete</span>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors',
            isDragging
              ? 'border-[var(--v2-primary)] bg-[var(--v2-primary)]/10'
              : 'border-[var(--v2-outline-variant)]/30 hover:border-[var(--v2-primary)]/50 hover:bg-[var(--v2-surface-container-low)]',
            isUploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <>
              <span className="v2-icon text-3xl text-[var(--v2-primary)] animate-spin mb-2">
                progress_activity
              </span>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">Uploading...</p>
            </>
          ) : (
            <>
              <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)]/50 mb-2">
                cloud_upload
              </span>
              <p className="text-sm text-[var(--v2-on-surface-variant)] text-center px-4">
                {placeholder}
              </p>
              <p className="text-xs text-[var(--v2-on-surface-variant)]/50 mt-1">
                PNG, JPG up to {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="v2-icon text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
