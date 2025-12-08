'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ExternalLink, CheckCircle, AlertCircle, Loader2, MapPin } from 'lucide-react';

export default function RegisterMerchantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    btcmapUrl: '',
    localName: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cbaf/merchants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register merchant');
      }

      setSuccess(true);
      
      // Redirect to merchants list after 2 seconds
      setTimeout(() => {
        router.push('/cbaf/merchants');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary flex items-center justify-center px-4">
        <div className="bg-bg-secondary border border-green-500/50 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Merchant Registered!</h2>
          <p className="text-text-muted mb-4">
            The merchant has been added to your circular economy network.
          </p>
          <p className="text-sm text-text-muted">Redirecting to merchants list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Register Merchant</h1>
          <p className="text-text-secondary">
            Add a merchant from BTCMap to your circular economy network
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 p-4 bg-bitcoin/10 border border-bitcoin/30 rounded-lg">
          <h3 className="font-medium text-bitcoin mb-2">How to find merchants on BTCMap:</h3>
          <ol className="text-sm text-text-muted space-y-1 list-decimal list-inside">
            <li>Visit <a href="https://btcmap.org" target="_blank" rel="noopener noreferrer" className="text-bitcoin hover:underline">btcmap.org</a></li>
            <li>Search for merchants in your area</li>
            <li>Click on a merchant to view details</li>
            <li>Copy the merchant's URL (e.g., https://btcmap.org/merchant/12345)</li>
            <li>Paste it below to register them in your economy</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-primary rounded-2xl p-8 shadow-xl space-y-6">
          {/* BTCMap URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <ExternalLink className="w-4 h-4 inline mr-1" />
              BTCMap URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.btcmapUrl}
              onChange={(e) => setFormData({ ...formData, btcmapUrl: e.target.value })}
              placeholder="https://btcmap.org/merchant/12345"
              required
              className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
            />
            <p className="text-xs text-text-muted mt-1">
              The unique BTCMap URL for this merchant
            </p>
          </div>

          {/* Local Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Local Name (Optional)
            </label>
            <input
              type="text"
              value={formData.localName}
              onChange={(e) => setFormData({ ...formData, localName: e.target.value })}
              placeholder="e.g., 'Joe's Cafe' or 'Mama's Shop'"
              className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
            />
            <p className="text-xs text-text-muted mt-1">
              Local name if different from BTCMap listing
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional information about this merchant..."
              rows={3}
              className="w-full px-4 py-3 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-border-primary">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Register Merchant
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-bg-secondary border border-border-primary rounded-lg">
          <h3 className="font-medium mb-2 text-sm">What happens next?</h3>
          <ul className="text-xs text-text-muted space-y-1 list-disc list-inside">
            <li>The merchant will be added to your economy's network</li>
            <li>We'll verify the merchant details against BTCMap</li>
            <li>You can feature this merchant in your video submissions</li>
            <li>Merchant appearances will count toward your monthly rankings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
