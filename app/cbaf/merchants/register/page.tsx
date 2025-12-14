'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ExternalLink, CheckCircle, AlertCircle, Loader2, MapPin, Zap } from 'lucide-react';
import { Alert } from '@/components/cbaf';

export default function RegisterMerchantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    btcmapUrl: '',
    localName: '',
    lightningAddress: '',
    paymentProvider: 'blink' as 'blink' | 'fedi' | 'machankura' | 'other',
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
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-2">Merchant Registered!</h2>
          <p className="text-gray-300 mb-4">
            The merchant has been added to your circular economy network.
          </p>
          <p className="text-sm text-gray-500">Redirecting to merchants list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Register Merchant</h1>
          <p className="text-gray-400">
            Add a merchant from BTCMap to your circular economy network
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert variant="error" title="Error">
              {error}
            </Alert>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 p-4 bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-lg backdrop-blur-xl">
          <h3 className="font-medium text-white mb-2">How to find merchants on BTCMap:</h3>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>Visit <a href="https://btcmap.org" target="_blank" rel="noopener noreferrer" className="text-bitcoin-400 hover:text-bitcoin-300 font-medium">btcmap.org</a></li>
            <li>Search for merchants in your area</li>
            <li>Click on a merchant to view details</li>
            <li>Copy the merchant's URL (e.g., https://btcmap.org/merchant/12345)</li>
            <li>Paste it below to register them in your economy</li>
          </ol>
        </div>

        {/* CSV Import Option */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-xl">
          <h3 className="font-medium text-white mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Registering Multiple Merchants?
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            Use CSV import to add multiple merchants at once. Required columns: <code className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">btcmap_url</code>, <code className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">lightning_address</code>
          </p>
          <div className="text-xs text-gray-400 mb-2">
            <strong className="text-white">Example CSV format:</strong>
            <pre className="bg-white/5 p-2 rounded mt-1 overflow-x-auto text-gray-300">
              btcmap_url,lightning_address,payment_provider,merchant_name,local_name{'\n'}
              https://btcmap.org/merchant/12345,joes@blink.sv,blink,Joe's Cafe,{'\n'}
              https://btcmap.org/merchant/67890,mamas@blink.sv,blink,Mama's Shop,Mama's
            </pre>
          </div>
          <a
            href="/cbaf/merchants"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Go to Merchants Page to Import CSV →
          </a>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
          {/* BTCMap URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <ExternalLink className="w-4 h-4 inline mr-1" />
              BTCMap URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={formData.btcmapUrl}
              onChange={(e) => setFormData({ ...formData, btcmapUrl: e.target.value })}
              placeholder="https://btcmap.org/merchant/12345"
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-bitcoin-500/50 focus:outline-none focus:ring-1 focus:ring-bitcoin-500/50"
            />
            <p className="text-gray-500 text-xs mt-1">
              The unique BTCMap URL for this merchant
            </p>
          </div>

          {/* Local Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              Local Name (Optional)
            </label>
            <input
              type="text"
              value={formData.localName}
              onChange={(e) => setFormData({ ...formData, localName: e.target.value })}
              placeholder="e.g., 'Joe's Cafe' or 'Mama's Shop'"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-bitcoin-500/50 focus:outline-none focus:ring-1 focus:ring-bitcoin-500/50"
            />
            <p className="text-gray-500 text-xs mt-1">
              Local name if different from BTCMap listing
            </p>
          </div>

          {/* Payment Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Payment Provider <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.paymentProvider}
              onChange={(e) => setFormData({ ...formData, paymentProvider: e.target.value as any })}
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-bitcoin-500/50 focus:outline-none focus:ring-1 focus:ring-bitcoin-500/50 appearance-none"
            >
              <option value="blink" className="bg-gray-900">Blink (Recommended)</option>
              <option value="fedi" className="bg-gray-900">Fedi</option>
              <option value="machankura" className="bg-gray-900">Machankura</option>
              <option value="other" className="bg-gray-900">Other</option>
            </select>
          </div>

          {/* Lightning Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <Zap className="w-4 h-4 inline mr-1" />
              Lightning Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.lightningAddress}
              onChange={(e) => setFormData({ ...formData, lightningAddress: e.target.value })}
              placeholder={
                formData.paymentProvider === 'blink' ? 'username@blink.sv' :
                formData.paymentProvider === 'fedi' ? 'user@federation.fedi.xyz' :
                formData.paymentProvider === 'machankura' ? '+27123456789' :
                'Lightning address or LNURL'
              }
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-bitcoin-500/50 focus:outline-none focus:ring-1 focus:ring-bitcoin-500/50"
            />
            <p className="text-gray-500 text-xs mt-1">
              {formData.paymentProvider === 'blink' && 'Format: username@blink.sv'}
              {formData.paymentProvider === 'fedi' && 'Format: user@federation.fedi.xyz'}
              {formData.paymentProvider === 'machankura' && 'Format: +27XXXXXXXXX'}
              {formData.paymentProvider === 'other' && 'Enter lightning address or LNURL'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional information about this merchant..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-bitcoin-500/50 focus:outline-none focus:ring-1 focus:ring-bitcoin-500/50 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white font-semibold rounded-lg hover:from-bitcoin-600 hover:to-bitcoin-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Register Merchant
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl">
          <h3 className="font-medium text-white mb-2 text-sm">What happens next?</h3>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
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
