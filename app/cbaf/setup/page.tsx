'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Globe, Twitter, Send, Zap, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import { Country, City } from 'country-state-city';
import { Alert } from '@/components/cbaf';

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
  const [slugError, setSlugError] = useState('');
  const [checkingSlug, setCheckingSlug] = useState(false);

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

  // Check slug availability with debounce
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 3) {
      setSlugError('');
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const response = await fetch(`/api/cbaf/economy/check-slug?slug=${encodeURIComponent(formData.slug)}`);
        const data = await response.json();

        if (!data.available) {
          setSlugError('This slug is already taken');
        } else {
          setSlugError('');
        }
      } catch (err) {
        // Silent fail on check
        setSlugError('');
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-bitcoin-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Black Header */}
      <header className="bg-black text-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold mb-2">
              Welcome to CBAF! 👋
            </h1>
            <p className="text-gray-300">
              Create your circular economy profile
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" title="Error creating profile" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="label">
                  Economy Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="economyName"
                  value={formData.economyName}
                  onChange={handleChange}
                  placeholder="Bitcoin Ekasi"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Slug <span className="text-gray-500 text-xs font-normal">(auto-generated)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="bitcoin-ekasi"
                    required
                    title="Lowercase letters, numbers, and hyphens only"
                    className={`input font-mono pr-10 ${
                      slugError ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {checkingSlug && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-bitcoin-500 animate-spin" />
                    </div>
                  )}
                  {!checkingSlug && slugError && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl">✗</span>
                  )}
                  {!checkingSlug && !slugError && formData.slug.length >= 3 && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {slugError ? (
                  <p className="error-text">{slugError}</p>
                ) : (
                  <p className="helper-text">
                    URL: tools.afribit.africa/cbaf/{formData.slug || 'your-slug'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="select"
                    >
                      <option value="">Select country...</option>
                      {africanCountries.map((country) => (
                        <option key={country.isoCode} value={country.name}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="label">
                    City
                  </label>
                  <div className="relative">
                    {availableCities.length > 0 ? (
                      <>
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="select"
                        >
                          <option value="">Select city...</option>
                          {availableCities.map((city) => (
                            <option key={city.name} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </>
                    ) : (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder={formData.country ? "Enter city name" : "Select country first"}
                        disabled={!formData.country}
                        className="input"
                      />
                    )}
                  </div>
                  {formData.country && availableCities.length === 0 && (
                    <p className="helper-text">Enter your city manually</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your circular economy..."
                  rows={3}
                  className="textarea"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Contact & Social</h2>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://bitcoinekasi.com"
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  <Twitter className="w-4 h-4 inline mr-1" />
                  Twitter/X Username
                </label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="@BitcoinEkasi"
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  <Send className="w-4 h-4 inline mr-1" />
                  Telegram Username
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  placeholder="@YourTelegram"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-bitcoin-500" />
              Payment Information
            </h2>

            <div>
              <label className="label">
                Lightning Address <span className="text-gray-500 text-xs font-normal">(for receiving funding)</span>
              </label>
              <input
                type="email"
                name="lightningAddress"
                value={formData.lightningAddress}
                onChange={handleChange}
                placeholder="name@getalby.com"
                className="input"
              />
              <p className="helper-text">
                This is where you'll receive CBAF funding when available
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || !formData.economyName || !formData.country || !!slugError}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Profile & Continue'
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Signed in as: {session?.user?.email}
        </p>
      </main>
    </div>
  );
}
