'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Video, AlertCircle, CheckCircle, Users, ExternalLink, Loader2 } from 'lucide-react';

interface Merchant {
  btcmapUrl: string;
  localName?: string;
}

export default function SubmitVideoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    videoUrl: '',
    videoTitle: '',
    videoDescription: '',
    fundingMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
  });

  const [merchants, setMerchants] = useState<Merchant[]>([
    { btcmapUrl: '', localName: '' },
  ]);

  // Check for duplicate when video URL changes
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!formData.videoUrl || formData.videoUrl.length < 10) {
        setDuplicateInfo(null);
        return;
      }

      setCheckingDuplicate(true);
      try {
        const response = await fetch(
          `/api/cbaf/videos/check-duplicate?url=${encodeURIComponent(formData.videoUrl)}`
        );
        const data = await response.json();

        if (data.isDuplicate) {
          setDuplicateInfo(data);
        } else {
          setDuplicateInfo(null);
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      } finally {
        setCheckingDuplicate(false);
      }
    };

    const debounce = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(debounce);
  }, [formData.videoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (duplicateInfo?.isDuplicate) {
      setError('This video has already been submitted. Please use a different video.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Filter out empty merchant entries
      const validMerchants = merchants.filter(m => m.btcmapUrl.trim());

      if (validMerchants.length === 0) {
        setError('Please add at least one merchant BTCMap URL');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/cbaf/videos/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: formData.videoUrl,
          videoTitle: formData.videoTitle,
          videoDescription: formData.videoDescription,
          fundingMonth: formData.fundingMonth,
          merchantBtcmapUrls: validMerchants.map(m => m.btcmapUrl),
          merchantLocalNames: validMerchants.map(m => m.localName || ''),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit video');
      }

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/cbaf/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addMerchant = () => {
    setMerchants([...merchants, { btcmapUrl: '', localName: '' }]);
  };

  const removeMerchant = (index: number) => {
    setMerchants(merchants.filter((_, i) => i !== index));
  };

  const updateMerchant = (index: number, field: keyof Merchant, value: string) => {
    const updated = [...merchants];
    updated[index] = { ...updated[index], [field]: value };
    setMerchants(updated);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary flex items-center justify-center px-4">
        <div className="bg-bg-secondary border border-green-500/50 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Video Submitted!</h2>
          <p className="text-text-muted mb-4">
            Your video has been submitted for review. You'll be notified once it's approved.
          </p>
          <p className="text-sm text-text-muted">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Submit Video</h1>
          <p className="text-text-secondary">
            Upload proof-of-work showcasing merchants in your circular economy
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {duplicateInfo?.isDuplicate && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-500 font-medium mb-2">Duplicate Video Detected</p>
                <p className="text-sm text-text-muted mb-2">
                  This video was already submitted by{' '}
                  <span className="font-medium">{duplicateInfo.originalEconomy}</span> on{' '}
                  {new Date(duplicateInfo.submittedAt).toLocaleDateString()}.
                </p>
                <p className="text-xs text-text-muted">
                  Time since original: {duplicateInfo.timeSinceSubmission}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-primary rounded-2xl p-8 shadow-xl space-y-6">
          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Video URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                required
                className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent pr-10"
              />
              {checkingDuplicate && (
                <Loader2 className="absolute right-3 top-3.5 w-5 h-5 text-bitcoin animate-spin" />
              )}
            </div>
            <p className="text-xs text-text-muted mt-1">
              Supports YouTube, Twitter, TikTok, Instagram
            </p>
          </div>

          {/* Video Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.videoTitle}
              onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
              placeholder="Merchant showcase - December 2025"
              required
              className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
            />
          </div>

          {/* Video Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.videoDescription}
              onChange={(e) => setFormData({ ...formData, videoDescription: e.target.value })}
              placeholder="Describe what's shown in this video..."
              rows={3}
              className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent resize-none"
            />
          </div>

          {/* Funding Month */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Funding Month <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              value={formData.fundingMonth}
              onChange={(e) => setFormData({ ...formData, fundingMonth: e.target.value })}
              required
              className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
            />
            <p className="text-xs text-text-muted mt-1">
              The month this video is being submitted for funding
            </p>
          </div>

          {/* Merchants */}
          <div>
            <label className="block text-sm font-medium mb-3">
              <Users className="w-4 h-4 inline mr-1" />
              Merchants Featured <span className="text-red-500">*</span>
            </label>

            <div className="space-y-3 mb-3">
              {merchants.map((merchant, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={merchant.btcmapUrl}
                    onChange={(e) => updateMerchant(index, 'btcmapUrl', e.target.value)}
                    placeholder="https://btcmap.org/merchant/..."
                    required
                    className="flex-1 px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={merchant.localName}
                    onChange={(e) => updateMerchant(index, 'localName', e.target.value)}
                    placeholder="Local name (optional)"
                    className="w-48 px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                  />
                  {merchants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMerchant(index)}
                      className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addMerchant}
              className="text-sm text-bitcoin hover:underline flex items-center gap-1"
            >
              + Add another merchant
            </button>

            <p className="text-xs text-text-muted mt-2 flex items-start gap-2">
              <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
              Find merchants on{' '}
              <a
                href="https://btcmap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bitcoin hover:underline"
              >
                btcmap.org
              </a>
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-border-primary">
            <button
              type="submit"
              disabled={loading || duplicateInfo?.isDuplicate}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Submit Video for Review
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-text-muted mt-4">
          Videos will be reviewed by CBAF admins before approval
        </p>
      </div>
    </div>
  );
}
