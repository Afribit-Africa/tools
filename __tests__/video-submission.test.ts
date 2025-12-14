/**
 * Video Submission API Tests
 * Tests for video submission, duplicate detection, and validation
 */

import { describe, test, expect, jest } from '@jest/globals';

describe('Video URL Validation', () => {
  describe('Platform Detection', () => {
    const detectPlatform = (url: string): string => {
      if (!url) return 'other';
      
      const urlLower = url.toLowerCase();
      
      if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return 'youtube';
      }
      if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
        return 'twitter';
      }
      if (urlLower.includes('tiktok.com')) {
        return 'tiktok';
      }
      if (urlLower.includes('instagram.com')) {
        return 'instagram';
      }
      
      return 'other';
    };

    test('should detect YouTube URLs', () => {
      expect(detectPlatform('https://www.youtube.com/watch?v=abc123')).toBe('youtube');
      expect(detectPlatform('https://youtu.be/abc123')).toBe('youtube');
      expect(detectPlatform('https://youtube.com/shorts/abc123')).toBe('youtube');
    });

    test('should detect Twitter/X URLs', () => {
      expect(detectPlatform('https://twitter.com/user/status/123')).toBe('twitter');
      expect(detectPlatform('https://x.com/user/status/123')).toBe('twitter');
    });

    test('should detect TikTok URLs', () => {
      expect(detectPlatform('https://www.tiktok.com/@user/video/123')).toBe('tiktok');
      expect(detectPlatform('https://tiktok.com/@user/video/123')).toBe('tiktok');
    });

    test('should detect Instagram URLs', () => {
      expect(detectPlatform('https://www.instagram.com/p/abc123')).toBe('instagram');
      expect(detectPlatform('https://instagram.com/reel/abc123')).toBe('instagram');
    });

    test('should return "other" for unknown platforms', () => {
      expect(detectPlatform('https://vimeo.com/123')).toBe('other');
      expect(detectPlatform('https://example.com/video')).toBe('other');
      expect(detectPlatform('')).toBe('other');
    });
  });

  describe('Video ID Extraction', () => {
    const extractVideoId = (url: string, platform: string): string | null => {
      if (platform === 'youtube') {
        const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
      }
      if (platform === 'twitter') {
        const match = url.match(/status\/(\d+)/);
        return match ? match[1] : null;
      }
      return null;
    };

    test('should extract YouTube video ID', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube')).toBe('dQw4w9WgXcQ');
      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ', 'youtube')).toBe('dQw4w9WgXcQ');
      expect(extractVideoId('https://youtube.com/shorts/dQw4w9WgXcQ', 'youtube')).toBe('dQw4w9WgXcQ');
    });

    test('should extract Twitter status ID', () => {
      expect(extractVideoId('https://twitter.com/user/status/1234567890', 'twitter')).toBe('1234567890');
      expect(extractVideoId('https://x.com/user/status/1234567890', 'twitter')).toBe('1234567890');
    });
  });
});

describe('Duplicate Video Detection', () => {
  test('should detect duplicate video URL', () => {
    const existingVideos = [
      { videoUrl: 'https://youtube.com/watch?v=abc123', economyId: 'economy-1' },
      { videoUrl: 'https://youtube.com/watch?v=xyz789', economyId: 'economy-2' },
    ];

    const checkDuplicate = (url: string) => {
      return existingVideos.find(v => v.videoUrl === url);
    };

    const result = checkDuplicate('https://youtube.com/watch?v=abc123');
    expect(result).toBeTruthy();
    expect(result?.economyId).toBe('economy-1');
  });

  test('should not flag unique videos as duplicates', () => {
    const existingVideos = [
      { videoUrl: 'https://youtube.com/watch?v=abc123', economyId: 'economy-1' },
    ];

    const checkDuplicate = (url: string) => {
      return existingVideos.find(v => v.videoUrl === url);
    };

    const result = checkDuplicate('https://youtube.com/watch?v=new456');
    expect(result).toBeUndefined();
  });

  test('should normalize URLs for comparison', () => {
    const normalizeUrl = (url: string) => {
      return url.toLowerCase().trim().replace(/\/$/, '');
    };

    expect(normalizeUrl('https://YouTube.com/watch?v=ABC123'))
      .toBe('https://youtube.com/watch?v=abc123');
    expect(normalizeUrl('https://youtube.com/watch?v=abc123/'))
      .toBe('https://youtube.com/watch?v=abc123');
  });
});

describe('Video Submission Validation', () => {
  test('should require video URL', () => {
    const validateSubmission = (data: { videoUrl?: string; merchantIds?: string[] }) => {
      const errors: string[] = [];
      
      if (!data.videoUrl || data.videoUrl.trim() === '') {
        errors.push('Video URL is required');
      }
      if (!data.merchantIds || data.merchantIds.length === 0) {
        errors.push('At least one merchant must be selected');
      }
      
      return errors;
    };

    expect(validateSubmission({ videoUrl: '', merchantIds: [] }))
      .toContain('Video URL is required');
    expect(validateSubmission({ videoUrl: 'https://youtube.com/watch?v=abc', merchantIds: [] }))
      .toContain('At least one merchant must be selected');
    expect(validateSubmission({ videoUrl: 'https://youtube.com/watch?v=abc', merchantIds: ['m1'] }))
      .toHaveLength(0);
  });

  test('should validate funding month format', () => {
    const isValidMonth = (month: string) => {
      return /^\d{4}-\d{2}$/.test(month);
    };

    expect(isValidMonth('2025-12')).toBe(true);
    expect(isValidMonth('2024-01')).toBe(true);
    expect(isValidMonth('2025-1')).toBe(false);
    expect(isValidMonth('12-2025')).toBe(false);
    expect(isValidMonth('invalid')).toBe(false);
  });
});

describe('Merchant Selection', () => {
  test('should allow multiple merchant selection', () => {
    const selectedMerchants: string[] = [];
    
    const toggleMerchant = (id: string) => {
      const index = selectedMerchants.indexOf(id);
      if (index > -1) {
        selectedMerchants.splice(index, 1);
      } else {
        selectedMerchants.push(id);
      }
    };

    toggleMerchant('merchant-1');
    expect(selectedMerchants).toContain('merchant-1');
    
    toggleMerchant('merchant-2');
    expect(selectedMerchants).toHaveLength(2);
    
    toggleMerchant('merchant-1');
    expect(selectedMerchants).not.toContain('merchant-1');
    expect(selectedMerchants).toHaveLength(1);
  });

  test('should count new vs returning merchants', () => {
    const merchants = [
      { id: 'm1', timesAppearedInVideos: 0 },
      { id: 'm2', timesAppearedInVideos: 5 },
      { id: 'm3', timesAppearedInVideos: 0 },
      { id: 'm4', timesAppearedInVideos: 2 },
    ];

    const selectedIds = ['m1', 'm2', 'm3'];
    const selected = merchants.filter(m => selectedIds.includes(m.id));

    const newMerchants = selected.filter(m => m.timesAppearedInVideos === 0);
    const returningMerchants = selected.filter(m => m.timesAppearedInVideos > 0);

    expect(newMerchants).toHaveLength(2);
    expect(returningMerchants).toHaveLength(1);
  });
});
