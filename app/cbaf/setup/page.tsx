'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MapPin, Globe, Twitter, Send, Zap } from 'lucide-react';

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

// African countries with major cities
const COUNTRIES_WITH_CITIES: Record<string, string[]> = {
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Mossel Bay', 'East London', 'Pietermaritzburg'],
  'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City', 'Kaduna', 'Enugu'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi'],
  'Ghana': ['Accra', 'Kumasi', 'Tamale', 'Sekondi-Takoradi', 'Cape Coast', 'Sunyani'],
  'Tanzania': ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya', 'Morogoro', 'Tanga'],
  'Uganda': ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja', 'Mbale', 'Entebbe'],
  'Ethiopia': ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar', 'Hawassa'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Port Said', 'Suez'],
  'Morocco': ['Casablanca', 'Rabat', 'Fes', 'Marrakech', 'Tangier', 'Agadir', 'Meknes'],
  'Senegal': ['Dakar', 'Touba', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor'],
  'Rwanda': ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi'],
  'Zambia': ['Lusaka', 'Kitwe', 'Ndola', 'Kabwe', 'Chingola', 'Mufulira'],
  'Zimbabwe': ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru', 'Kwekwe'],
  'Botswana': ['Gaborone', 'Francistown', 'Maun', 'Kasane', 'Serowe'],
  'Namibia': ['Windhoek', 'Walvis Bay', 'Swakopmund', 'Oshakati', 'Rundu'],
  'Malawi': ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu'],
  'Mozambique': ['Maputo', 'Beira', 'Nampula', 'Quelimane', 'Tete'],
  'Angola': ['Luanda', 'Huambo', 'Lobito', 'Benguela', 'Lubango'],
  'Other': ['Enter manually'],
};

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

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

  // Update available cities when country changes
  useEffect(() => {
    if (formData.country && COUNTRIES_WITH_CITIES[formData.country]) {
      setAvailableCities(COUNTRIES_WITH_CITIES[formData.country]);
      // Reset city if not in new country's cities
      if (formData.city && !COUNTRIES_WITH_CITIES[formData.country].includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.country]);

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
                  title="Lowercase letters, numbers, and hyphens only"
                  className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent font-mono"
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
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                  >
                    <option value="">Select country...</option>
                    {Object.keys(COUNTRIES_WITH_CITIES).map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    City
                  </label>
                  {availableCities.length > 0 ? (
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                    >
                      <option value="">Select city...</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                    />
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
                className="w-full px-4 py-2 bg-bg-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-bitcoin focus:border-transparent"
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
