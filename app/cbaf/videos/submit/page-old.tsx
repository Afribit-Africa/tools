'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Video, Users, ExternalLink, Loader2, X, ArrowLeft, Plus, CheckCircle } from 'lucide-react';
import { Alert } from '@/components/cbaf';
import Link from 'next/link';

interface Merchant {
  btcmapUrl: string;
  localName?: string;
  lightningAddress?: string;
  paymentProvider?: 'blink' | 'fedi' | 'machankura' | 'other';
}

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

  const [formData, setFormData] = useState({
    videoUrl: '',
    videoTitle: '',
    videoDescription: '',
    fundingMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
  });

  const [merchants, setMerchants] = useState<Merchant[]>([
    {
      btcmapUrl: '',
      localName: '',
      lightningAddress: '',
      paymentProvider: 'blink',
    },
  ]);

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
          merchantLightningAddresses: validMerchants.map(m => m.lightningAddress || ''),
          merchantPaymentProviders: validMerchants.map(m => m.paymentProvider || 'other'),
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
    setMerchants([...merchants, {
      btcmapUrl: '',
      localName: '',
      lightningAddress: '',
      paymentProvider: 'blink',
    }]);
  };

  const removeMerchant = (index: number) => {
    setMerchants(merchants.filter((_, i) => i !== index));
  };

  const selectRegisteredMerchant = (index: number, merchantId: string) => {
    const selected = registeredMerchants.find(m => m.id === merchantId);
    if (!selected) return;

    const updated = [...merchants];
    updated[index] = {
      btcmapUrl: selected.btcmapUrl,
      localName: selected.localName || '',
      lightningAddress: selected.lightningAddress || '',
      paymentProvider: (selected.paymentProvider as any) || 'blink',
    };
    setMerchants(updated);
  };

  const updateMerchant = (index: number, field: keyof Merchant, value: string) => {
    const updated = [...merchants];
    updated[index] = { ...updated[index], [field]: value };
    setMerchants(updated);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border-2 border-green-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Video Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your video has been submitted for review. You'll be notified once it's approved.
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/cbaf/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Submit Video</h1>
          <p className="text-gray-600">
            Upload proof-of-work showcasing merchants in your circular economy
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert variant="error" title="Error">
              {error}
            </Alert>
          </div>
        )}

        {duplicateInfo?.isDuplicate && (
          <div className="mb-6">
            <Alert variant="warning" title="Duplicate Video Detected">
              <p className="text-sm text-gray-700 mb-2">
                This video was already submitted by{' '}
                <span className="font-medium">{duplicateInfo.originalEconomy}</span> on{' '}
                {new Date(duplicateInfo.submittedAt).toLocaleDateString()}.
              </p>
              <p className="text-xs text-gray-600">
                Time since original: {duplicateInfo.timeSinceSubmission}
              </p>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
          {/* Video URL */}
          <div>
            <label className="label">
              Video URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                required
                className="input pr-10"
              />
              {checkingDuplicate && (
                <Loader2 className="absolute right-3 top-3.5 w-5 h-5 text-bitcoin-500 animate-spin" />
              )}
            </div>
            <p className="helper-text">
              Supports YouTube, Twitter, TikTok, Instagram
            </p>
          </div>

          {/* Video Title */}
          <div>
            <label className="label">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.videoTitle}
              onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
              placeholder="Merchant showcase - December 2025"
              required
              className="input"
            />
          </div>

          {/* Video Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.videoDescription}
              onChange={(e) => setFormData({ ...formData, videoDescription: e.target.value })}
              placeholder="Describe what's shown in this video..."
              rows={3}
              className="textarea"
            />
          </div>

          {/* Funding Month */}
          <div>
            <label className="label">
              Funding Month <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              value={formData.fundingMonth}
              onChange={(e) => setFormData({ ...formData, fundingMonth: e.target.value })}
              required
              className="input"
            />
            <p className="helper-text">
              The month this video is being submitted for funding
            </p>
          </div>

          {/* Merchants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label">
                <Users className="w-4 h-4 inline mr-1" />
                Merchants Featured <span className="text-red-500">*</span>
              </label>
              {registeredMerchants.length > 0 && (
                <Link
                  href="/cbaf/merchants"
                  className="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-medium flex items-center gap-1"
                  target="_blank"
                >
                  <Plus className="w-3 h-3" />
                  Manage Merchants
                </Link>
              )}
            </div>

            <div className="space-y-4 mb-3">
              {merchants.map((merchant, index) => (
                <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Merchant {index + 1}
                    </span>
                    {merchants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMerchant(index)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm inline-flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Quick Select from Registered Merchants */}
                  {registeredMerchants.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Quick Select (Optional)
                      </label>
                      <select
                        value=""
                        onChange={(e) => selectRegisteredMerchant(index, e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">-- Select a registered merchant --</option>
                        {registeredMerchants.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.localName || m.merchantName || 'Unnamed'} - {m.lightningAddress || 'No address'}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Or fill in manually below
                      </p>
                    </div>
                  )}

                  {/* BTCMap URL */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      BTCMap URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={merchant.btcmapUrl}
                      onChange={(e) => updateMerchant(index, 'btcmapUrl', e.target.value)}
                      placeholder="https://btcmap.org/merchant/..."
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  {/* Local Name */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Local Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={merchant.localName}
                      onChange={(e) => updateMerchant(index, 'localName', e.target.value)}
                      placeholder="e.g., Mama's Shop, Juma's Electronics"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  {/* Payment Provider */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Payment Provider <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={merchant.paymentProvider}
                      onChange={(e) => updateMerchant(index, 'paymentProvider', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-transparent text-gray-900"
                    >
                      <option value="blink">Blink (Recommended)</option>
                      <option value="fedi">Fedi</option>
                      <option value="machankura">Machankura</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Lightning Address */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Lightning Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={merchant.lightningAddress || ''}
                      onChange={(e) => updateMerchant(index, 'lightningAddress', e.target.value)}
                      placeholder={
                        merchant.paymentProvider === 'blink' ? 'username@blink.sv' :
                        merchant.paymentProvider === 'fedi' ? 'user@federation.fedi.xyz' :
                        merchant.paymentProvider === 'machankura' ? '+27123456789' :
                        'Lightning address or LNURL'
                      }
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-transparent text-gray-900"
                    />

                    {merchant.paymentProvider === 'blink' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Format: username@blink.sv
                      </p>
                    )}
                    {merchant.paymentProvider === 'fedi' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Format: user@federation.fedi.xyz
                      </p>
                    )}
                    {merchant.paymentProvider === 'machankura' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Format: +27, +254, +256, +233, or +234 (with country code)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addMerchant}
              className="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-medium flex items-center gap-1"
            >
              + Add another merchant
            </button>

            <p className="helper-text flex items-start gap-2 mt-2">
              <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
              Find merchants on{' '}
              <a
                href="https://btcmap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bitcoin-600 hover:text-bitcoin-700 font-medium"
              >
                btcmap.org
              </a>
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || duplicateInfo?.isDuplicate}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
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

        <p className="text-center text-xs text-gray-500 mt-4">
          Videos will be reviewed by CBAF admins before approval
        </p>
      </div>
    </div>
  );
}
