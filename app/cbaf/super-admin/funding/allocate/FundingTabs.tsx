'use client';

import { useState } from 'react';
import { DollarSign, Wallet, Zap } from 'lucide-react';
import FundingAllocationPanel from './FundingAllocationPanel';
import MerchantFundingPanel from './MerchantFundingPanel';
import PaymentPanel from './PaymentPanel';

interface FundingTabsProps {
  period: {
    month: string;
    year: number;
    monthName: string;
  };
  existingDisbursements: any[];
}

export default function FundingTabs({ period, existingDisbursements }: FundingTabsProps) {
  const [activeTab, setActiveTab] = useState<'economy' | 'merchant' | 'payments'>('economy');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border-primary">
        <button
          onClick={() => setActiveTab('economy')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'economy'
              ? 'text-bitcoin border-b-2 border-bitcoin'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Economy-Level Allocation
          </div>
        </button>
        <button
          onClick={() => setActiveTab('merchant')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'merchant'
              ? 'text-bitcoin border-b-2 border-bitcoin'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Merchant-Level Payments
          </div>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'payments'
              ? 'text-bitcoin border-b-2 border-bitcoin'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Lightning Payments
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'economy' ? (
        <FundingAllocationPanel
          period={period}
          existingDisbursements={existingDisbursements}
        />
      ) : activeTab === 'merchant' ? (
        <MerchantFundingPanel period={period} />
      ) : (
        <PaymentPanel
          period={period.month}
          disbursements={existingDisbursements}
          onPaymentComplete={() => window.location.reload()}
        />
      )}
    </div>
  );
}
