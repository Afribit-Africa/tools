'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, X, Globe, MapPin, FileText, Twitter,
  Zap, Mail, Phone, Building2, Calendar, Users
} from 'lucide-react';
import Link from 'next/link';

interface Economy {
  id: string;
  economyName: string;
  country: string;
  city: string | null;
  description: string | null;
  website: string | null;
  twitter: string | null;
  lightningAddress: string | null;
}

interface Props {
  economy: Economy;
  userRole: string;
  userEmail: string;
}

export default function EconomyEditForm({ economy, userRole, userEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - only editable fields
  const [formData, setFormData] = useState({
    city: economy.city || '',
    description: economy.description || '',
    website: economy.website || '',
    twitter: economy.twitter || '',
    lightningAddress: economy.lightningAddress || '',
  });

  const isBCE = userRole === 'bce';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cbaf/economies/${economy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update economy');
      }

      // Redirect to detail page
      router.push(`/cbaf/admin/economies/${economy.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* Basic Information */}
      <section className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-bitcoin-600" />
          Basic Information
        </h2>

        <div className="space-y-4">
          {/* Economy Name - Read Only */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Economy Name
            </label>
            <input
              type="text"
              value={economy.economyName}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Economy name cannot be changed
            </p>
          </div>

          {/* Country - Read Only */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={economy.country}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Country cannot be changed
            </p>
          </div>

          {/* City - Editable */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              City (Optional)
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Lagos, Cape Town"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-bitcoin-500 focus:ring-2 focus:ring-bitcoin-200 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              The city where your economy operates
            </p>
          </div>

          {/* Description - Editable */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your Bitcoin circular economy initiative..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-bitcoin-500 focus:ring-2 focus:ring-bitcoin-200 transition-colors resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tell us about your mission, goals, and impact
            </p>
          </div>
        </div>
      </section>

      {/* Online Presence */}
      <section className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-bitcoin-600" />
          Online Presence
        </h2>

        <div className="space-y-4">
          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website (Optional)
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://youreconomy.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-bitcoin-500 focus:ring-2 focus:ring-bitcoin-200 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your economy's official website
            </p>
          </div>

          {/* Twitter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              Twitter Handle (Optional)
            </label>
            <input
              type="text"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="@youreconomy"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-bitcoin-500 focus:ring-2 focus:ring-bitcoin-200 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Twitter/X handle (with or without @)
            </p>
          </div>
        </div>
      </section>

      {/* Payment Information */}
      <section className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Payment Information
        </h2>

        <div className="space-y-4">
          {/* Lightning Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Lightning Address
            </label>
            <input
              type="text"
              name="lightningAddress"
              value={formData.lightningAddress}
              onChange={handleChange}
              placeholder="you@getalby.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-bitcoin-500 focus:ring-2 focus:ring-bitcoin-200 transition-colors font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your Lightning address for receiving CBAF funding
            </p>
            <p className="text-xs text-orange-600 mt-1 font-medium">
              ⚠️ This address will be verified using Flashlight before you can receive payments
            </p>
          </div>
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        <Link
          href={`/cbaf/admin/economies/${economy.id}`}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 hover:from-bitcoin-600 hover:to-bitcoin-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
