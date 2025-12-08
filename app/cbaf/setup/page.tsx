'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MapPin, Globe, Twitter, Send } from 'lucide-react';

interface FormData {
  economyName: string;
  slug: string;
  country: string;
  city: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  lightningAddress: string;
}

export default function SetupPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    economyName: '',
    slug: '',
    country: '',
    city: '',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
    lightningAddress: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cbaf/economy/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile');
      }

      // Redirect to dashboard
      router.push('/cbaf/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug from economy name
    if (name === 'economyName') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Welcome to CBAF! 👋
          </h1>
          <p className="text-text-secondary">
            Let's set up your circular economy profile
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-bg-secondary border border-border-primary rounded-2xl p-8 shadow-xl space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-heading font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Economy Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="economyName"
                  value={formData.economyName}
                  onChange={handleChange}
                  placeholder="Bitcoin Ekasi"
                  required
                  className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug <span className="text-text-muted text-xs">(auto-generated)</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="bitcoin-ekasi"
                  required
                  pattern="[a-z0-9-]+"
                  className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                />
                <p className="text-xs text-text-muted mt-1">
                  URL: tools.afribit.africa/cbaf/{formData.slug || 'your-slug'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="South Africa"
                    required
                    className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mossel Bay"
                    className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your circular economy..."
                  rows={3}
                  className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-heading font-semibold mb-4">Contact & Social</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://bitcoinekasi.com"
                  className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Twitter className="w-4 h-4 inline mr-1" />
                  Twitter/X Username
                </label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="@BitcoinEkasi"
                  className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Send className="w-4 h-4 inline mr-1" />
                  Telegram Username
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  placeholder="@YourTelegram"
                  className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h2 className="text-xl font-heading font-semibold mb-4">Payment Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Lightning Address <span className="text-text-muted text-xs">(for receiving funding)</span>
              </label>
              <input
                type="email"
                name="lightningAddress"
                value={formData.lightningAddress}
                onChange={handleChange}
                placeholder="name@getalby.com"
                className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
              />
              <p className="text-xs text-text-muted mt-1">
                This is where you'll receive monthly CBAF funding
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border-primary">
            <button
              type="submit"
              disabled={loading || !formData.economyName || !formData.country}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Create Profile & Continue'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-text-muted mt-4">
          Signed in as: {session?.user?.email}
        </p>
      </div>
    </div>
  );
}
