/**
 * Video Embed Componnent
 * Embeds videos from various platforms (YouTube, Twitter, TikTok, etc.)
 */

'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  platform?: 'youtube' | 'twitter' | 'tiktok' | 'instagram' | 'other';
  thumbnail?: string | null;
  title?: string;
  className?: string;
}

export default function VideoEmbed({ url, platform, thumbnail, title, className = '' }: VideoEmbedProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tweetNotFound, setTweetNotFound] = useState(false);

  // Auto-detect platform if not provided
  const detectedPlatform = platform || detectPlatform(url);

  // Extract video ID based on platform
  const videoId = extractVideoId(url, detectedPlatform);

  // Check if URL is valid
  const isValidUrl = detectedPlatform !== 'other' && videoId;

  // Monitor for Twitter 404 errors
  useEffect(() => {
    if (detectedPlatform === 'twitter') {
      const checkTweetLoad = () => {
        const tweetFrame = document.querySelector('iframe.twitter-tweet-rendered');
        if (tweetFrame) {
          // Tweet loaded successfully
          setLoading(false);
          setTweetNotFound(false);
        }
      };

      // Check periodically for tweet load
      const checkInterval = setInterval(checkTweetLoad, 500);

      // Listen for console errors (Twitter API 404)
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        if (args[0]?.toString().includes('syndication.twimg.com') && response.status === 404) {
          setTweetNotFound(true);
          setLoading(false);
        }
        return response;
      };

      return () => {
        clearInterval(checkInterval);
        window.fetch = originalFetch;
      };
    }
  }, [detectedPlatform]);

  // Load social media embed scripts
  useEffect(() => {
    if (detectedPlatform === 'twitter') {
      // Load Twitter widget script if not already loaded
      if (!(window as any).twttr) {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.onload = () => {
          // Force widget load
          if ((window as any).twttr?.widgets) {
            (window as any).twttr.widgets.load();
          }
        };
        script.onerror = () => {
          setError(true);
          setLoading(false);
        };
        document.body.appendChild(script);
      } else {
        // Script already loaded, just render widgets
        if ((window as any).twttr?.widgets) {
          (window as any).twttr.widgets.load();
        }
      }
    } else if (detectedPlatform === 'tiktok') {
      if (!(window as any).TikTok) {
        const script = document.createElement('script');
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        script.onload = () => setLoading(false);
        script.onerror = () => setError(true);
        document.body.appendChild(script);
      } else {
        setLoading(false);
      }
    } else if (detectedPlatform === 'instagram') {
      if (!(window as any).instgrm) {
        const script = document.createElement('script');
        script.src = '//www.instagram.com/embed.js';
        script.async = true;
        script.onload = () => {
          setLoading(false);
          if ((window as any).instgrm?.Embeds) {
            (window as any).instgrm.Embeds.process();
          }
        };
        script.onerror = () => setError(true);
        document.body.appendChild(script);
      } else {
        if ((window as any).instgrm?.Embeds) {
          (window as any).instgrm.Embeds.process();
        }
        setLoading(false);
      }
    }
  }, [detectedPlatform]);

  // Set a timeout to stop loading after 10 seconds (in case embed fails silently)
  useEffect(() => {
    if (!isValidUrl) {
      setLoading(false);
      setError(true);
      return;
    }

    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        // For Twitter, if still loading after timeout, assume it's broken
        if (detectedPlatform === 'twitter') {
          setTweetNotFound(true);
        } else if (detectedPlatform === 'tiktok' || detectedPlatform === 'instagram') {
          // For other platforms, set error
          setError(true);
        }
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading, isValidUrl, detectedPlatform]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Error Message */}
      {(error || tweetNotFound) && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">
              {tweetNotFound ? '❌ Tweet Not Found (404 Error)' : '❌ Failed to Load Video'}
            </p>
            <p className="text-xs text-red-700 mt-1">
              {tweetNotFound
                ? 'This tweet does not exist, has been deleted, or the account is private/suspended. The video URL is invalid or broken.'
                : 'The video URL may be invalid, the content has been removed, or the server is unavailable. Please verify the URL is correct.'
              }
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-xs font-medium text-red-800">Video URL:</p>
              <code className="text-xs bg-red-100 text-red-900 px-2 py-1 rounded border border-red-200 break-all">
                {url}
              </code>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-700 hover:text-red-900 font-semibold inline-flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3 h-3" />
                Try Opening Link Manually
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Player */}
      {detectedPlatform === 'youtube' && videoId && (
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <Loader2 className="w-8 h-8 text-bitcoin-500 animate-spin" />
            </div>
          )}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            title={title || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      )}

      {detectedPlatform === 'twitter' && videoId && !tweetNotFound && !error && (
        <div className="bg-gray-50 rounded-lg overflow-hidden shadow-lg p-4 relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-bitcoin-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading tweet...</p>
              </div>
            </div>
          )}
          <blockquote className="twitter-tweet" data-dnt="true">
            <a href={`https://twitter.com/i/status/${videoId}`} target="_blank" rel="noopener noreferrer">
              View Tweet
            </a>
          </blockquote>
          {/* Always provide fallback link */}
          {!loading && (
            <div className="mt-4 text-center">
              <a
                href={`https://twitter.com/i/status/${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-medium inline-flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Open Tweet in X/Twitter
              </a>
            </div>
          )}
        </div>
      )}

      {detectedPlatform === 'tiktok' && videoId && !error && (
        <div className="aspect-[9/16] max-w-md mx-auto bg-black rounded-lg overflow-hidden shadow-lg relative min-h-[500px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-bitcoin-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-white">Loading TikTok...</p>
              </div>
            </div>
          )}
          <blockquote
            className="tiktok-embed"
            cite={url}
            data-video-id={videoId}
            style={{ maxWidth: '605px', minWidth: '325px' }}
          >
            <section>
              <a target="_blank" href={url} rel="noopener noreferrer">View on TikTok</a>
            </section>
          </blockquote>
          {/* Always provide fallback link */}
          {!loading && (
            <div className="mt-4 text-center">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-medium inline-flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Open in TikTok
              </a>
            </div>
          )}
        </div>
      )}

      {detectedPlatform === 'instagram' && !error && (
        <div className="bg-gray-50 rounded-lg overflow-hidden shadow-lg p-4 relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-bitcoin-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading Instagram post...</p>
              </div>
            </div>
          )}
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{ maxWidth: '540px', minWidth: '326px', width: '100%' }}
          >
            <a href={url} target="_blank" rel="noopener noreferrer">View on Instagram</a>
          </blockquote>
          {/* Always provide fallback link */}
          {!loading && (
            <div className="mt-4 text-center">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-medium inline-flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Instagram
              </a>
            </div>
          )}
        </div>
      )}

      {/* Fallback or Invalid URL: Show message and external link button - but not if we already showed error above */}
      {!isValidUrl && !error && !tweetNotFound && (
        <div className="space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Unsupported video format</p>
              <p className="text-xs text-yellow-600 mt-1">
                This video platform is not supported for embedding. Use the button below to open it in a new tab.
              </p>
            </div>
          </div>
          {thumbnail && (
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <img
                src={thumbnail}
                alt={title || 'Video thumbnail'}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Video in New Tab
          </a>
        </div>
      )}

      {/* Always show external link button */}
      {detectedPlatform !== 'other' && videoId && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-medium flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Open in {detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)}
        </a>
      )}
    </div>
  );
}

/**
 * Detect video platform from URL
 */
function detectPlatform(url: string): 'youtube' | 'twitter' | 'tiktok' | 'instagram' | 'other' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'twitter';
  }
  if (url.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (url.includes('instagram.com')) {
    return 'instagram';
  }
  return 'other';
}

/**
 * Extract video ID from URL based on platform
 */
function extractVideoId(url: string, platform: string): string {
  try {
    switch (platform) {
      case 'youtube':
        // Match various YouTube URL formats
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return ytMatch ? ytMatch[1] : '';

      case 'twitter':
        // Extract tweet ID from Twitter/X URL
        const twitterMatch = url.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/);
        return twitterMatch ? twitterMatch[2] : '';

      case 'tiktok':
        // Extract TikTok video ID
        const tiktokMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
        return tiktokMatch ? tiktokMatch[1] : '';

      case 'instagram':
        // Instagram doesn't need ID extraction for embed
        return url;

      default:
        return '';
    }
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return '';
  }
}
