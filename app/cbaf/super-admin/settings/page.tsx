import { requireAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Settings, Wallet, Key, Zap, Shield, Info, DollarSign } from 'lucide-react';
import FloatingNav from '@/components/ui/FloatingNav';
import BlinkWalletSettings from './BlinkWalletSettings';
import FundingConfigSettings from './FundingConfigSettings';

export default async function SettingsPage() {
  const session = await requireAdmin();

  // Restrict to super_admin only for payment and system settings
  if (session.user.role !== 'super_admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <FloatingNav role={session.user.role} />

      {/* Hero Header */}
      <header className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white shadow-xl pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Settings className="w-8 h-8" />
                </div>
                Super Admin Settings
              </h1>
              <p className="text-bitcoin-50 text-lg">
                Configure payment integrations and system settings
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Funding Configuration */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b-2 border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-xl border-2 border-green-200">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900">
                      Funding Allocation Configuration
                    </h2>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    Configure default funding distribution parameters
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <FundingConfigSettings />
            </div>
          </div>
        </section>

        {/* Blink Wallet Integration */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-bitcoin-50 to-orange-50 px-6 py-5 border-b-2 border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-bitcoin-100 rounded-xl border-2 border-bitcoin-200">
                      <Wallet className="w-6 h-6 text-bitcoin-600" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900">
                      Blink Wallet Integration
                    </h2>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    Connect your Blink wallet to enable automated Bitcoin payments to merchants
                  </p>
                </div>
              </div>
            </div>

            {/* Section Body */}
            <div className="p-6">
              <BlinkWalletSettings />
            </div>
          </div>
        </section>

        {/* Setup Instructions */}
        <div className="mt-8 bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
          <h3 className="font-heading font-bold mb-4 text-gray-900 flex items-center gap-2 text-lg">
            <div className="p-2 bg-bitcoin-50 rounded-lg border-2 border-bitcoin-200">
              <Info className="w-5 h-5 text-bitcoin-600" />
            </div>
            How to Get Your Blink API Key
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bitcoin-100 flex items-center justify-center text-bitcoin-600 font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">Create a Blink Account</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Sign up for a business account at{' '}
                  <a
                    href="https://blink.sv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bitcoin-600 hover:text-bitcoin-700 font-medium underline"
                  >
                    blink.sv
                  </a>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bitcoin-100 flex items-center justify-center text-bitcoin-600 font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">Generate API Key</h4>
                <p className="text-sm text-gray-600">
                  Navigate to Settings → Developer → API Keys and generate a new API key with "Send Payment" permissions
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bitcoin-100 flex items-center justify-center text-bitcoin-600 font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">Fund Your Wallet</h4>
                <p className="text-sm text-gray-600">
                  Ensure your Blink wallet has sufficient Bitcoin balance to cover CBAF merchant payments
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bitcoin-100 flex items-center justify-center text-bitcoin-600 font-bold">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">Test Connection</h4>
                <p className="text-sm text-gray-600">
                  After entering your API key above, use the "Test Connection" button to verify the integration
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
