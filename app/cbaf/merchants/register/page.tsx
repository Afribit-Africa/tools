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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border-2 border-green-200 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Merchant Registered!</h2>
          <p className="text-gray-600 mb-4">
            The merchant has been added to your circular economy network.
          </p>
          <p className="text-sm text-gray-500">Redirecting to merchants list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Register Merchant</h1>
          <p className="text-gray-600">
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
        <div className="mb-6 p-4 bg-bitcoin-50 border-2 border-bitcoin-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">How to find merchants on BTCMap:</h3>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Visit <a href="https://btcmap.org" target="_blank" rel="noopener noreferrer" className="text-bitcoin-600 hover:text-bitcoin-700 font-medium">btcmap.org</a></li>
            <li>Search for merchants in your area</li>
            <li>Click on a merchant to view details</li>
            <li>Copy the merchant's URL (e.g., https://btcmap.org/merchant/12345)</li>
            <li>Paste it below to register them in your economy</li>
          </ol>
        </div>

        {/* CSV Import Option */}
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Registering Multiple Merchants?
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Use CSV import to add multiple merchants at once. Required columns: <code className="bg-white px-2 py-0.5 rounded text-xs">btcmap_url</code>, <code className="bg-white px-2 py-0.5 rounded text-xs">lightning_address</code>
          </p>
          <div className="text-xs text-gray-600 mb-2">
            <strong>Example CSV format:</strong>
            <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
              btcmap_url,lightning_address,payment_provider,merchant_name,local_name{'\n'}
              https://btcmap.org/merchant/12345,joes@blink.sv,blink,Joe's Cafe,{'\n'}
              https://btcmap.org/merchant/67890,mamas@blink.sv,blink,Mama's Shop,Mama's
            </pre>
          </div>
          <a
            href="/cbaf/merchants"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Go to Merchants Page to Import CSV →
          </a>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
          {/* BTCMap URL */}
          <div>
            <label className="label">
              <ExternalLink className="w-4 h-4 inline mr-1" />
              BTCMap URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.btcmapUrl}
              onChange={(e) => setFormData({ ...formData, btcmapUrl: e.target.value })}
              placeholder="https://btcmap.org/merchant/12345"
              required
              className="input"
            />
            <p className="helper-text">
              The unique BTCMap URL for this merchant
            </p>
          </div>

          {/* Local Name */}
          <div>
            <label className="label">
              <Users className="w-4 h-4 inline mr-1" />
              Local Name (Optional)
            </label>
            <input
              type="text"
              value={formData.localName}
              onChange={(e) => setFormData({ ...formData, localName: e.target.value })}
              placeholder="e.g., 'Joe's Cafe' or 'Mama's Shop'"
              className="input"
            />
            <p className="helper-text">
              Local name if different from BTCMap listing
            </p>
          </div>

          {/* Payment Provider */}
          <div>
            <label className="label">
              Payment Provider <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.paymentProvider}
              onChange={(e) => setFormData({ ...formData, paymentProvider: e.target.value as any })}
              required
              className="input"
            >
              <option value="blink">Blink (Recommended)</option>
              <option value="fedi">Fedi</option>
              <option value="machankura">Machankura</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Lightning Address */}
          <div>
            <label className="label">
              <Zap className="w-4 h-4 inline mr-1" />
              Lightning Address <span className="text-red-500">*</span>
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
              className="input"
            />
            <p className="helper-text">
              {formData.paymentProvider === 'blink' && 'Format: username@blink.sv'}
              {formData.paymentProvider === 'fedi' && 'Format: user@federation.fedi.xyz'}
              {formData.paymentProvider === 'machankura' && 'Format: +27XXXXXXXXX'}
              {formData.paymentProvider === 'other' && 'Enter lightning address or LNURL'}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="label">
              <MapPin className="w-4 h-4 inline mr-1" />
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional information about this merchant..."
              rows={3}
              className="textarea"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
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

        <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-900 mb-2 text-sm">What happens next?</h3>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
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
