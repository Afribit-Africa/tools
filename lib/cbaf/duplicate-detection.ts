import crypto from 'crypto';
import { db } from '@/lib/db';
import { videoSubmissions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Generate a SHA-256 hash of a video URL for duplicate detection
 * Normalizes the URL to catch variations (http/https, www/no-www, trailing slashes, etc.)
 */
export function generateVideoUrlHash(url: string): string {
  try {
    // Normalize URL
    const normalized = normalizeVideoUrl(url);
    
    // Generate SHA-256 hash
    return crypto
      .createHash('sha256')
      .update(normalized)
      .digest('hex');
  } catch (error) {
    console.error('Error generating video URL hash:', error);
    throw new Error('Invalid video URL');
  }
}

/**
 * Normalize video URL to catch duplicates with slight variations
 */
export function normalizeVideoUrl(url: string): string {
  try {
    // Remove whitespace
    let normalized = url.trim().toLowerCase();
    
    // Parse URL
    const urlObj = new URL(normalized);
    
    // Remove www.
    const hostname = urlObj.hostname.replace(/^www\./, '');
    
    // Special handling for different platforms
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return normalizeYouTubeUrl(urlObj);
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return normalizeTwitterUrl(urlObj);
    } else if (hostname.includes('tiktok.com')) {
      return normalizeTikTokUrl(urlObj);
    } else if (hostname.includes('instagram.com')) {
      return normalizeInstagramUrl(urlObj);
    }
    
    // Default: return protocol + hostname + pathname (no query params)
    return `${urlObj.protocol}//${hostname}${urlObj.pathname.replace(/\/$/, '')}`;
  } catch (error) {
    // If URL parsing fails, return original
    return url.trim().toLowerCase();
  }
}

/**
 * Normalize YouTube URLs to extract video ID
 * Handles: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, etc.
 */
function normalizeYouTubeUrl(urlObj: URL): string {
  const hostname = urlObj.hostname.replace(/^www\./, '');
  
  // Extract video ID from different YouTube URL formats
  let videoId: string | null = null;
  
  if (hostname === 'youtu.be') {
    // Short URL: youtu.be/VIDEO_ID
    videoId = urlObj.pathname.split('/')[1];
  } else if (urlObj.pathname.includes('/watch')) {
    // Standard URL: youtube.com/watch?v=VIDEO_ID
    videoId = urlObj.searchParams.get('v');
  } else if (urlObj.pathname.includes('/embed/')) {
    // Embed URL: youtube.com/embed/VIDEO_ID
    videoId = urlObj.pathname.split('/embed/')[1];
  } else if (urlObj.pathname.includes('/v/')) {
    // Old format: youtube.com/v/VIDEO_ID
    videoId = urlObj.pathname.split('/v/')[1];
  } else if (urlObj.pathname.includes('/shorts/')) {
    // Shorts URL: youtube.com/shorts/VIDEO_ID
    videoId = urlObj.pathname.split('/shorts/')[1];
  }
  
  if (videoId) {
    // Clean video ID (remove anything after & or ?)
    videoId = videoId.split('&')[0].split('?')[0];
    return `youtube:${videoId}`;
  }
  
  return urlObj.href;
}

/**
 * Normalize Twitter/X URLs
 * Handles: twitter.com/user/status/ID, x.com/user/status/ID
 */
function normalizeTwitterUrl(urlObj: URL): string {
  const hostname = urlObj.hostname.replace(/^www\./, '');
  
  // Extract tweet ID
  const pathParts = urlObj.pathname.split('/');
  const statusIndex = pathParts.indexOf('status');
  
  if (statusIndex !== -1 && pathParts[statusIndex + 1]) {
    const tweetId = pathParts[statusIndex + 1].split('?')[0];
    return `twitter:${tweetId}`;
  }
  
  return urlObj.href;
}

/**
 * Normalize TikTok URLs
 * Handles: tiktok.com/@user/video/ID, vm.tiktok.com/ID
 */
function normalizeTikTokUrl(urlObj: URL): string {
  const hostname = urlObj.hostname.replace(/^www\./, '');
  
  if (hostname.includes('vm.tiktok.com')) {
    // Short URL
    const videoId = urlObj.pathname.split('/')[1];
    return `tiktok:${videoId}`;
  }
  
  // Extract video ID from path
  const pathParts = urlObj.pathname.split('/');
  const videoIndex = pathParts.indexOf('video');
  
  if (videoIndex !== -1 && pathParts[videoIndex + 1]) {
    const videoId = pathParts[videoIndex + 1].split('?')[0];
    return `tiktok:${videoId}`;
  }
  
  return urlObj.href;
}

/**
 * Normalize Instagram URLs
 * Handles: instagram.com/p/ID, instagram.com/reel/ID, instagram.com/tv/ID
 */
function normalizeInstagramUrl(urlObj: URL): string {
  const pathParts = urlObj.pathname.split('/');
  
  // Extract content ID (after /p/, /reel/, or /tv/)
  if (pathParts.length >= 3 && ['p', 'reel', 'tv'].includes(pathParts[1])) {
    const contentId = pathParts[2].split('?')[0];
    return `instagram:${contentId}`;
  }
  
  return urlObj.href;
}

/**
 * Check if a video URL has been submitted before (duplicate detection)
 * Returns the original submission if found, or null if unique
 */
export async function checkDuplicateVideo(
  videoUrl: string,
  economyId?: string
): Promise<{
  isDuplicate: boolean;
  originalSubmission?: any;
  message?: string;
}> {
  try {
    const urlHash = generateVideoUrlHash(videoUrl);
    
    // Search for existing submissions with same URL hash
    const existingSubmissions = await db.query.videoSubmissions.findMany({
      where: eq(videoSubmissions.videoUrlHash, urlHash),
      orderBy: [desc(videoSubmissions.submittedAt)],
    });
    
    if (existingSubmissions.length === 0) {
      return { isDuplicate: false };
    }
    
    // Found duplicate(s) - get the earliest submission
    const original = existingSubmissions[existingSubmissions.length - 1];
    const isSameEconomy = economyId && original.economyId === economyId;
    const monthsSinceOriginal = getMonthsDifference(
      original.submittedAt,
      new Date()
    );
    
    let message = '';
    
    if (isSameEconomy) {
      message = `⚠️ This video was previously submitted by your economy on ${formatDate(
        original.submittedAt
      )} (${monthsSinceOriginal} month${
        monthsSinceOriginal !== 1 ? 's' : ''
      } ago). Status: ${original.status}. You cannot resubmit the same video.`;
    } else {
      message = `⚠️ This video was previously submitted by another economy on ${formatDate(
        original.submittedAt
      )} (${monthsSinceOriginal} month${
        monthsSinceOriginal !== 1 ? 's' : ''
      } ago). Status: ${original.status}. Each video can only be submitted once across all economies.`;
    }
    
    return {
      isDuplicate: true,
      originalSubmission: original,
      message,
    };
  } catch (error) {
    console.error('Error checking duplicate video:', error);
    return {
      isDuplicate: false,
      message: 'Error checking for duplicates',
    };
  }
}

/**
 * Get the number of months between two dates
 */
function getMonthsDifference(date1: Date, date2: Date): number {
  const months =
    (date2.getFullYear() - date1.getFullYear()) * 12 +
    (date2.getMonth() - date1.getMonth());
  return Math.max(0, months);
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Detect video platform from URL
 */
export function detectVideoPlatform(
  url: string
): 'youtube' | 'twitter' | 'tiktok' | 'instagram' | 'other' {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return 'twitter';
  } else if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok';
  } else if (lowerUrl.includes('instagram.com')) {
    return 'instagram';
  }
  
  return 'other';
}

/**
 * Extract video ID from URL (platform-specific)
 */
export function extractVideoId(url: string): string | null {
  try {
    const normalized = normalizeVideoUrl(url);
    
    // Normalized format is "platform:id"
    if (normalized.includes(':')) {
      const [platform, id] = normalized.split(':');
      return id;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}
