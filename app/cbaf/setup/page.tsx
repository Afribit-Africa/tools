'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MapPin, Globe, Twitter, Send, Zap, ChevronDown } from 'lucide-react';
import { Country, City } from 'country-state-city';

interface FormData {
  economyName: string;
  slug: string;
  country: string;
  countryCode: string;
  city: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  lightningAddress: string;
}

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    economyName: '',
    slug: '',
    country: '',
    countryCode: '',
    city: '',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
    lightningAddress: '',
  });

  // Get African countries
  const africanCountries = useMemo(() => {
    const africaContinentCode = 'AF';
    return Country.getAllCountries()
      .filter(country => {
        // Filter African countries by continent or known African country codes
        const africanCodes = ['DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'];
        return africanCodes.includes(country.isoCode);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Get cities for selected country
  const availableCities = useMemo(() => {
    if (!formData.countryCode) return [];
    return City.getCitiesOfCountry(formData.countryCode)?.sort((a, b) => a.name.localeCompare(b.name)) || [];
  }, [formData.countryCode]);

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

      // Force session refresh to update economyName
      await fetch('/api/auth/session');
      
      // Redirect to dashboard with refresh
      window.location.href = '/cbaf/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle country selection
    if (name === 'country') {
      const selectedCountry = africanCountries.find(c => c.name === value);
      setFormData((prev) => ({ 
        ...prev, 
        country: value,
        countryCode: selectedCountry?.isoCode || '',
        city: '' // Reset city when country changes
      }));
      return;
    }

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

  // Show loading while session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-bitcoin border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

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
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent transition-all"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
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
                  title="Lowercase letters, numbers, and hyphens only"
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent font-mono transition-all"
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
                  <div className="relative">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 pr-10 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent appearance-none cursor-pointer transition-all hover:border-bitcoin/50"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                    >
                      <option value="">Select country...</option>
                      {africanCountries.map((country) => (
                        <option key={country.isoCode} value={country.name}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    City
                  </label>
                  <div className="relative">
                    {availableCities.length > 0 ? (
                      <>
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 pr-10 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent appearance-none cursor-pointer transition-all hover:border-bitcoin/50"
                          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                        >
                          <option value="">Select city...</option>
                          {availableCities.map((city) => (
                            <option key={city.name} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                      </>
                    ) : (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder={formData.country ? "Enter city name" : "Select country first"}
                        disabled={!formData.country}
                        className="w-full px-4 py-2.5 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                      />
                    )}
                  </div>
                  {formData.country && availableCities.length === 0 && (
                    <p className="text-xs text-text-muted mt-1">Enter your city manually</p>
                  )}
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
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent resize-none transition-all"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
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
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent transition-all"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
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
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent transition-all"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
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
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent transition-all"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                />
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-bitcoin" />
              Payment Information
            </h2>

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
                className="w-full px-4 py-2.5 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent transition-all"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
              />
              <p className="text-xs text-text-muted mt-1">
                This is where you'll receive CBAF funding when available
              </p>
              <p className="text-xs text-yellow-500/80 mt-1 flex items-start gap-1">
                <span>ℹ️</span>
                <span>Funding is distributed when available, not on a fixed monthly schedule</span>
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
