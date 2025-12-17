import { requireAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Settings, Wallet, Key, Zap, Shield, Info, DollarSign } from 'lucide-react';
import { DashboardLayout, SuperAdminSidebarSections, PageHeader } from '@/components/cbaf';
import BlinkWalletSettings from './BlinkWalletSettings';
import FundingConfigSettings from './FundingConfigSettings';

export default async function SettingsPage() {
  const session = await requireAdmin();

  // Restrict to super_admin only for payment and system settings
  if (session.user.role !== 'super_admin') {
    redirect('/unauthorized');
  }

  return (
    <DashboardLayout
      sidebar={{
        sections: SuperAdminSidebarSections,
        userRole: 'super_admin'
      }}
    >
      <PageHeader
        title="System Settings"
        description="Configure payment integrations and system settings"
        icon={Settings}
        breadcrumbs={[
          { label: 'Super Admin', href: '/cbaf/super-admin' },
          { label: 'Settings' }
        ]}
      />

      <div className="max-w-5xl mx-auto">
        {/* Funding Configuration */}
        <section className="mb-8">
          <div className="glass-card rounded-xl overflow-hidden backdrop-blur-xl border-emerald-500/30">
            <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 px-6 py-5 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                      <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-white">
                      Funding Allocation Configuration
                    </h2>
                  </div>
                  <p className="text-white/70 text-sm font-medium">
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
          <div className="glass-card rounded-xl overflow-hidden backdrop-blur-xl border-bitcoin-500/30">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-bitcoin-500/20 to-bitcoin-600/20 px-6 py-5 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-bitcoin-500/20 rounded-xl border border-bitcoin-500/30">
                      <Wallet className="w-6 h-6 text-bitcoin-400" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-white">
                      Blink Wallet Integration
                    </h2>
                  </div>
                  <p className="text-white/70 text-sm font-medium">
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
        <div className="mt-8 glass-card rounded-xl p-6 backdrop-blur-xl">
          <h3 className="font-heading font-bold mb-4 text-white flex items-center gap-2 text-lg">
            <div className="p-2 bg-bitcoin-500/20 rounded-lg border border-bitcoin-500/30">
              <Info className="w-5 h-5 text-bitcoin-400" />
            </div>
            How to Get Your Blink API Key
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bitcoin-500/20 flex items-center justify-center text-bitcoin-400 font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">Create a Blink Account</h4>
                <p className="text-sm text-white/70 mb-2">
                  Sign up for a business account at{' '}
                  <a
                    href="https://blink.sv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bitcoin-400 hover:text-bitcoin-500 font-medium underline"
                  >
                    blink.sv
                  </a>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bitcoin-500/20 flex items-center justify-center text-bitcoin-400 font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">Generate API Key</h4>
                <p className="text-sm text-white/70">
                  Navigate to Settings → Developer → API Keys and generate a new API key with "Send Payment" permissions
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bitcoin-500/20 flex items-center justify-center text-bitcoin-400 font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">Fund Your Wallet</h4>
                <p className="text-sm text-white/70">
                  Ensure your Blink wallet has sufficient Bitcoin balance to cover CBAF merchant payments
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bitcoin-500/20 flex items-center justify-center text-bitcoin-400 font-bold">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">Test Connection</h4>
                <p className="text-sm text-white/70">
                  After entering your API key above, use the "Test Connection" button to verify the integration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
