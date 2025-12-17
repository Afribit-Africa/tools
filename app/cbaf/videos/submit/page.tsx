'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Video, Users, Loader2, ArrowLeft, CheckCircle, AlertCircle, Check, Calendar } from 'lucide-react';
import { Alert, Input, Button } from '@/components/cbaf';
import Link from 'next/link';

interface RegisteredMerchant {
  id: string;
  btcmapUrl: string;
  merchantName: string | null;
  localName: string | null;
  lightningAddress: string | null;
  paymentProvider: string | null;
}

export default function SubmitVideoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);
  const [registeredMerchants, setRegisteredMerchants] = useState<RegisteredMerchant[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(true);
  const [selectedMerchantIds, setSelectedMerchantIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    videoUrl: '',
    videoTitle: '',
    videoDescription: '',
    fundingMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
  });

  // Load registered merchants
  useEffect(() => {
    const loadMerchants = async () => {
      if (!session?.user?.economyId) return;

      try {
        const response = await fetch(`/api/cbaf/merchants/list?economyId=${session.user.economyId}`);
        if (response.ok) {
          const data = await response.json();
          setRegisteredMerchants(data.merchants || []);
        }
      } catch (err) {
        console.error('Failed to load merchants:', err);
      } finally {
        setLoadingMerchants(false);
      }
    };

    loadMerchants();
  }, [session?.user?.economyId]);

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

    if (selectedMerchantIds.length === 0) {
      setError('Please select at least one merchant featured in this video.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get selected merchants data
      const selectedMerchants = registeredMerchants.filter(m =>
        selectedMerchantIds.includes(m.id)
      );

      const response = await fetch('/api/cbaf/videos/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: formData.videoUrl,
          videoTitle: formData.videoTitle,
          videoDescription: formData.videoDescription,
          fundingMonth: formData.fundingMonth,
          merchantIds: selectedMerchantIds,
          merchantBtcmapUrls: selectedMerchants.map(m => m.btcmapUrl),
          merchantLocalNames: selectedMerchants.map(m => m.localName || ''),
          merchantLightningAddresses: selectedMerchants.map(m => m.lightningAddress || ''),
          merchantPaymentProviders: selectedMerchants.map(m => m.paymentProvider || 'other'),
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

  const toggleMerchant = (merchantId: string) => {
    setSelectedMerchantIds(prev =>
      prev.includes(merchantId)
        ? prev.filter(id => id !== merchantId)
        : [...prev, merchantId]
    );
  };

  const filteredMerchants = registeredMerchants.filter(merchant => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      merchant.localName?.toLowerCase().includes(query) ||
      merchant.merchantName?.toLowerCase().includes(query) ||
      merchant.lightningAddress?.toLowerCase().includes(query)
    );
  });

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="glass-card border-2 border-emerald-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">Video Submitted!</h2>
          <p className="text-white/70 mb-4">
            Your video has been submitted for review. You'll be notified once it's approved.
          </p>
          <p className="text-sm text-white/50">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Show warning if less than 5 merchants registered
  const needsMoreMerchants = registeredMerchants.length < 5;

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/cbaf/dashboard"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Submit Video</h1>
          <p className="text-white/70">
            Upload proof-of-work showcasing merchants in your circular economy
          </p>
        </div>

        {needsMoreMerchants && (
          <div className="mb-6">
            <Alert variant="warning" title="Register More Merchants" darkMode={true}>
              <div className="space-y-2">
                <div className="text-sm">
                  You have {registeredMerchants.length} merchant{registeredMerchants.length !== 1 ? 's' : ''} registered.
                  We recommend registering at least 5 merchants before submitting videos.
                </div>
                <Link
                  href="/cbaf/merchants/register"
                  className="inline-flex items-center gap-1 text-sm font-medium text-bitcoin-400 hover:text-bitcoin-300"
                >
                  <Users className="w-4 h-4" />
                  Register Merchants →
                </Link>
              </div>
            </Alert>
          </div>
        )}

        {error && (
          <div className="mb-6">
            <Alert variant="error" title="Error" darkMode={true}>
              {error}
            </Alert>
          </div>
        )}

        {duplicateInfo?.isDuplicate && (
          <div className="mb-6">
            <Alert variant="warning" title="Duplicate Video Detected" darkMode={true}>
              <div className="space-y-1">
                <div className="text-sm">
                  This video was already submitted by{' '}
                  <span className="font-medium">{duplicateInfo.originalEconomy}</span> on{' '}
                  {new Date(duplicateInfo.submittedAt).toLocaleDateString()}.
                </div>
                <div className="text-xs text-white/50">
                  Time since original: {duplicateInfo.timeSinceSubmission}
                </div>
              </div>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          {/* Video URL */}
          <div>
            <label className="label-dark">
              Video URL <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                required
                className="input-dark w-full pr-10"
              />
              {checkingDuplicate && (
                <Loader2 className="absolute right-3 top-3.5 w-5 h-5 text-bitcoin-400 animate-spin" />
              )}
            </div>
            <p className="text-sm text-white/50 mt-1">
              Supports YouTube, Twitter, TikTok, Instagram
            </p>
          </div>

          {/* Video Title */}
          <div>
            <label className="label-dark">
              Video Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.videoTitle}
              onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
              placeholder="Merchant showcase - December 2025"
              required
              className="input-dark w-full"
            />
          </div>

          {/* Video Description */}
          <div>
            <label className="label-dark">Description</label>
            <textarea
              value={formData.videoDescription}
              onChange={(e) => setFormData({ ...formData, videoDescription: e.target.value })}
              placeholder="Describe what's shown in this video..."
              rows={3}
              className="input-dark w-full resize-none"
            />
          </div>

          {/* Funding Month */}
          <div>
            <label className="label-dark flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Funding Month <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="month"
                value={formData.fundingMonth}
                onChange={(e) => setFormData({ ...formData, fundingMonth: e.target.value })}
                required
                className="input-dark w-full pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
            </div>
            <p className="text-sm text-white/50 mt-1">
              Select the month this video is being submitted for
            </p>
          </div>

          {/* Merchant Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label-dark">
                <Users className="w-4 h-4 inline mr-1" />
                Select Merchants Featured <span className="text-red-400">*</span>
              </label>
              <Link
                href="/cbaf/merchants/register"
                className="text-sm text-bitcoin-400 hover:text-bitcoin-300 font-medium transition-colors"
              >
                + Add New Merchant
              </Link>
            </div>

            {loadingMerchants ? (
              <div className="flex items-center justify-center py-12 bg-white/5 rounded-xl border border-white/10">
                <Loader2 className="w-6 h-6 text-bitcoin-400 animate-spin" />
              </div>
            ) : registeredMerchants.length === 0 ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center backdrop-blur-xl">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="font-medium text-white mb-2">No Merchants Registered</p>
                <p className="text-sm text-white/70 mb-4">
                  You need to register at least one merchant before submitting a video.
                </p>
                <Link
                  href="/cbaf/merchants/register"
                  className="btn-primary-dark inline-flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Register Your First Merchant
                </Link>
              </div>
            ) : (
              <>
                {/* Search */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search merchants..."
                  className="input-dark w-full mb-3"
                />

                {/* Merchant List */}
                <div className="border border-white/10 rounded-xl overflow-hidden max-h-96 overflow-y-auto bg-white/5 backdrop-blur-xl">
                  {filteredMerchants.length === 0 ? (
                    <div className="p-6 text-center text-white/50 text-sm">
                      No merchants found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {filteredMerchants.map((merchant) => {
                        const isSelected = selectedMerchantIds.includes(merchant.id);
                        return (
                          <label
                            key={merchant.id}
                            className={`flex items-start gap-3 p-4 cursor-pointer transition-all hover:bg-white/10 ${
                              isSelected ? 'bg-bitcoin-500/20 hover:bg-bitcoin-500/30' : ''
                            }`}
                          >
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-bitcoin-500 border-bitcoin-500'
                                  : 'border-white/30 bg-white/5'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleMerchant(merchant.id)}
                              className="sr-only"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white">
                                {merchant.localName || merchant.merchantName || 'Unnamed Merchant'}
                              </div>
                              <div className="text-sm text-white/60 truncate">
                                {merchant.lightningAddress || 'No payment address'}
                              </div>
                              {merchant.paymentProvider && (
                                <div className="text-xs text-white/50 mt-1">
                                  {merchant.paymentProvider === 'blink' && '⚡ Blink'}
                                  {merchant.paymentProvider === 'fedi' && '🏛️ Fedi'}
                                  {merchant.paymentProvider === 'machankura' && '📱 Machankura'}
                                  {merchant.paymentProvider === 'other' && '💳 Other'}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="text-sm text-white/60 mt-2">
                  {selectedMerchantIds.length} merchant{selectedMerchantIds.length !== 1 ? 's' : ''} selected
                </p>
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={loading || duplicateInfo?.isDuplicate || selectedMerchantIds.length === 0}
              className="w-full btn-primary-dark disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
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

        <p className="text-center text-xs text-white/50 mt-4">
          Videos will be reviewed by CBAF admins before approval
        </p>
      </div>
    </div>
  );
}
