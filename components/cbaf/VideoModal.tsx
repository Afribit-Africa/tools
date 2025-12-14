'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import VideoEmbed from './VideoEmbed';

interface VideoModalProps {
  videoUrl: string;
  platform?: 'youtube' | 'twitter' | 'tiktok' | 'instagram' | 'other';
  thumbnail?: string | null;
  title?: string;
  description?: string;
  triggerButton: React.ReactNode;
}

export default function VideoModal({
  videoUrl,
  platform,
  thumbnail,
  title,
  description,
  triggerButton,
}: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <div onClick={() => setIsOpen(true)}>
        {triggerButton}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-heading font-bold text-gray-900">
                {title || 'Video Preview'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <VideoEmbed
                url={videoUrl}
                platform={platform}
                thumbnail={thumbnail}
                title={title}
              />

              {description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium mb-2">Description:</p>
                  <p className="text-sm text-gray-900">{description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
