'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Wallet,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Send,
  ArrowLeft,
  RefreshCw,
  Zap,
  DollarSign,
  Globe,
  Shield,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Plasma = dynamic(() => import('@/components/ui/Plasma'), { ssr: false });

interface EconomyAddress {
  id: string;
  economyName: string;
  country: string;
  city: string | null;
  contactEmail: string | null;
  isVerified: boolean;
  totalMerchants: number;
  originalAddress: string;
  cleanedAddress: string;
  issues: string[];
  hasIssues: boolean;
  status: 'pending' | 'verifying' | 'valid' | 'invalid' | 'fixed';
  error?: string;
  walletId?: string;
  selected: boolean;
  amount: number;
}

interface Stats {
  total: number;
  withAddresses: number;
  withIssues: number;
  needsVerification: number;
}

export default function BulkPaymentPage() {
  const router = useRouter();
  const [economies, setEconomies] = useState<EconomyAddress[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, withAddresses: 0, withIssues: 0, needsVerification: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [defaultAmount, setDefaultAmount] = useState(10000); // 10k sats default
  const [fundingMonth, setFundingMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [memo, setMemo] = useState('');
  const [results, setResults] = useState<any>(null);
  const [step, setStep] = useState<'collect' | 'verify' | 'allocate' | 'send' | 'complete'>('collect');

  // Fetch all economy addresses
  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cbaf/funding/collect-addresses');
      const data = await response.json();

      if (data.success) {
        const economiesWithSelection = data.economies.map((e: any) => ({
          ...e,
          selected: true,
          amount: defaultAmount,
        }));
        setEconomies(economiesWithSelection);
        setStats(data.stats);
        setStep('verify');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [defaultAmount]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Verify all addresses using Fastlight-style verification
  const verifyAddresses = async () => {
    setIsVerifying(true);
    setVerificationProgress(0);

    const addressesToVerify = economies.map(e => ({
      id: e.id,
      economyName: e.economyName,
      cleanedAddress: e.cleanedAddress,
    }));

    try {
      // Update status to verifying
      setEconomies(prev => prev.map(e => ({ ...e, status: 'verifying' })));

      const response = await fetch('/api/cbaf/funding/verify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: addressesToVerify }),
      });

      const data = await response.json();

      if (data.success) {
        // Update economies with verification results
        setEconomies(prev => prev.map(e => {
          const result = data.results.find((r: any) => r.id === e.id);
          if (result) {
            return {
              ...e,
              status: result.status,
              error: result.error,
              walletId: result.walletId,
              selected: result.status === 'valid', // Only select valid ones
            };
          }
          return e;
        }));

        setVerificationProgress(100);
        setStep('allocate');
      }
    } catch (error) {
      console.error('Error verifying addresses:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Send batch payments
  const sendPayments = async () => {
    const selectedEconomies = economies.filter(e => e.selected && e.status === 'valid');

    if (selectedEconomies.length === 0) {
      alert('No valid economies selected for payment');
      return;
    }

    setIsSending(true);
    setPaymentProgress(0);
    setStep('send');

    const [year, month] = fundingMonth.split('-').map(Number);

    const payments = selectedEconomies.map(e => ({
      id: e.id,
      economyId: e.id,
      economyName: e.economyName,
      address: e.cleanedAddress,
      amount: e.amount,
    }));

    try {
      const response = await fetch('/api/cbaf/funding/send-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payments,
          fundingMonth,
          fundingYear: year,
          memo: memo || `CBAF Funding - ${fundingMonth}`,
        }),
      });

      const data = await response.json();
      setResults(data);
      setPaymentProgress(100);
      setStep('complete');
    } catch (error) {
      console.error('Error sending payments:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Toggle economy selection
  const toggleSelection = (id: string) => {
    setEconomies(prev => prev.map(e =>
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  // Update individual amount
  const updateAmount = (id: string, amount: number) => {
    setEconomies(prev => prev.map(e =>
      e.id === id ? { ...e, amount } : e
    ));
  };

  // Apply default amount to all
  const applyDefaultToAll = () => {
    setEconomies(prev => prev.map(e => ({ ...e, amount: defaultAmount })));
  };

  // Select/deselect all valid
  const toggleAllValid = () => {
    const validEconomies = economies.filter(e => e.status === 'valid');
    const allSelected = validEconomies.every(e => e.selected);

    setEconomies(prev => prev.map(e =>
      e.status === 'valid' ? { ...e, selected: !allSelected } : e
    ));
  };

  // Calculate totals
  const validCount = economies.filter(e => e.status === 'valid').length;
  const invalidCount = economies.filter(e => e.status === 'invalid').length;
  const selectedCount = economies.filter(e => e.selected && e.status === 'valid').length;
  const totalAmount = economies
    .filter(e => e.selected && e.status === 'valid')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="dark-page min-h-screen relative">
      {/* Plasma Background */}
      <div className="fixed inset-0 z-0">
        <Plasma
          color="#f7931a"
          speed={0.3}
          direction="forward"
          scale={1.5}
          opacity={0.08}
          mouseInteractive={false}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 z-[1]" />

      <div className="relative z-10 pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  href="/cbaf/super-admin/funding"
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white/70" />
                </Link>
                <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-bitcoin-500/20 rounded-xl">
                    <Send className="w-7 h-7 text-bitcoin-400" />
                  </div>
                  Bulk Payment
                </h1>
              </div>
              <p className="text-white/60 ml-14">
                Send batch payments to all economies via Lightning Network
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {['collect', 'verify', 'allocate', 'send', 'complete'].map((s, i) => (
                <div
                  key={s}
                  className={`flex items-center gap-2 ${i > 0 ? 'ml-2' : ''}`}
                >
                  {i > 0 && <div className="w-8 h-0.5 bg-white/20" />}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step === s
                        ? 'bg-bitcoin-500 text-white'
                        : ['collect', 'verify', 'allocate', 'send', 'complete'].indexOf(step) > i
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Economies</span>
                <Users className="w-5 h-5 text-bitcoin-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>

            <div className="stat-card-dark-success">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400/80 text-sm">Valid Addresses</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400">{validCount}</p>
            </div>

            <div className="stat-card-dark-error">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-400/80 text-sm">Invalid</span>
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-400">{invalidCount}</p>
            </div>

            <div className="stat-card-dark-bitcoin">
              <div className="flex items-center justify-between mb-2">
                <span className="text-bitcoin-400/80 text-sm">Total to Send</span>
                <Zap className="w-5 h-5 text-bitcoin-400" />
              </div>
              <p className="text-2xl font-bold text-bitcoin-400">
                {(totalAmount / 1000).toFixed(1)}k <span className="text-sm font-normal">sats</span>
              </p>
            </div>
          </div>

          {/* Main Content */}
          {isLoading ? (
            <div className="glass-card flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-bitcoin-400 animate-spin mr-3" />
              <span className="text-white/70">Collecting economy addresses...</span>
            </div>
          ) : step === 'verify' ? (
            <div className="glass-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Step 1: Verify Addresses</h2>
                  <p className="text-white/60 text-sm">
                    Run Fastlight verification to validate all Blink addresses
                  </p>
                </div>
                <button
                  onClick={verifyAddresses}
                  disabled={isVerifying}
                  className="btn-primary-dark flex items-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Verify All Addresses
                    </>
                  )}
                </button>
              </div>

              {isVerifying && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Verification Progress</span>
                    <span className="text-bitcoin-400">{verificationProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-bitcoin-500 to-orange-500 transition-all duration-300"
                      style={{ width: `${verificationProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Address List */}
              <div className="table-dark-container">
                <table className="table-dark">
                  <thead>
                    <tr>
                      <th>Economy</th>
                      <th>Country</th>
                      <th>Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {economies.map((economy) => (
                      <tr key={economy.id}>
                        <td className="font-medium">{economy.economyName}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-white/40" />
                            {economy.country}
                          </div>
                        </td>
                        <td>
                          <code className="text-xs bg-white/5 px-2 py-1 rounded">
                            {economy.cleanedAddress}
                          </code>
                        </td>
                        <td>
                          {economy.status === 'pending' && (
                            <span className="badge-info-dark">Pending</span>
                          )}
                          {economy.status === 'verifying' && (
                            <span className="badge-warning-dark flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Verifying
                            </span>
                          )}
                          {economy.status === 'valid' && (
                            <span className="badge-success-dark">Valid</span>
                          )}
                          {economy.status === 'invalid' && (
                            <span className="badge-error-dark" title={economy.error}>
                              Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : step === 'allocate' ? (
            <div className="glass-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Step 2: Allocate Amounts</h2>
                  <p className="text-white/60 text-sm">
                    Set payment amounts for each economy
                  </p>
                </div>
              </div>

              {/* Amount Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <label className="label-dark">Default Amount (sats)</label>
                  <input
                    type="number"
                    value={defaultAmount}
                    onChange={(e) => setDefaultAmount(Number(e.target.value))}
                    className="input-dark"
                    min={1}
                  />
                </div>
                <div>
                  <label className="label-dark">Funding Period</label>
                  <input
                    type="month"
                    value={fundingMonth}
                    onChange={(e) => setFundingMonth(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="label-dark">Memo (optional)</label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="CBAF Funding"
                    className="input-dark"
                  />
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button onClick={applyDefaultToAll} className="btn-secondary-dark">
                  Apply Default to All
                </button>
                <button onClick={toggleAllValid} className="btn-secondary-dark">
                  Toggle All Valid
                </button>
              </div>

              {/* Economy List with Amounts */}
              <div className="table-dark-container">
                <table className="table-dark">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={economies.filter(e => e.status === 'valid').every(e => e.selected)}
                          onChange={toggleAllValid}
                          className="w-4 h-4 rounded bg-white/10 border-white/20"
                        />
                      </th>
                      <th>Economy</th>
                      <th>Country</th>
                      <th>Status</th>
                      <th>Amount (sats)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {economies.map((economy) => (
                      <tr key={economy.id} className={economy.status !== 'valid' ? 'opacity-50' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={economy.selected}
                            onChange={() => toggleSelection(economy.id)}
                            disabled={economy.status !== 'valid'}
                            className="w-4 h-4 rounded bg-white/10 border-white/20"
                          />
                        </td>
                        <td className="font-medium">{economy.economyName}</td>
                        <td>{economy.country}</td>
                        <td>
                          {economy.status === 'valid' ? (
                            <span className="badge-success-dark">Valid</span>
                          ) : (
                            <span className="badge-error-dark">Invalid</span>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            value={economy.amount}
                            onChange={(e) => updateAmount(economy.id, Number(e.target.value))}
                            disabled={economy.status !== 'valid'}
                            className="input-dark w-32"
                            min={1}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary and Send */}
              <div className="mt-6 p-4 bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Selected Economies</p>
                    <p className="text-2xl font-bold text-white">
                      {selectedCount} <span className="text-sm font-normal text-white/60">of {validCount} valid</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Amount</p>
                    <p className="text-2xl font-bold text-bitcoin-400">
                      {totalAmount.toLocaleString()} <span className="text-sm font-normal">sats</span>
                    </p>
                  </div>
                  <button
                    onClick={sendPayments}
                    disabled={selectedCount === 0}
                    className="btn-primary-dark flex items-center gap-2 px-8"
                  >
                    <Send className="w-5 h-5" />
                    Send Payments
                  </button>
                </div>
              </div>
            </div>
          ) : step === 'send' ? (
            <div className="glass-card flex flex-col items-center justify-center py-20">
              <Loader2 className="w-16 h-16 text-bitcoin-400 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Processing Payments</h2>
              <p className="text-white/60 mb-6">Sending {selectedCount} payments via Lightning...</p>
              <div className="w-full max-w-md">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-bitcoin-500 to-orange-500 transition-all duration-300 animate-pulse"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            </div>
          ) : step === 'complete' && results ? (
            <div className="glass-card">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Payments Complete</h2>
                <p className="text-white/60">
                  Successfully sent {results.summary?.successful} of {results.summary?.total} payments
                </p>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="stat-card-dark-success">
                  <p className="text-green-400/80 text-sm mb-1">Successful</p>
                  <p className="text-3xl font-bold text-green-400">{results.summary?.successful}</p>
                </div>
                <div className="stat-card-dark-error">
                  <p className="text-red-400/80 text-sm mb-1">Failed</p>
                  <p className="text-3xl font-bold text-red-400">{results.summary?.failed}</p>
                </div>
                <div className="stat-card-dark-bitcoin">
                  <p className="text-bitcoin-400/80 text-sm mb-1">Total Sent</p>
                  <p className="text-3xl font-bold text-bitcoin-400">
                    {results.summary?.totalSent?.toLocaleString()} <span className="text-sm font-normal">sats</span>
                  </p>
                </div>
              </div>

              {/* Results Table */}
              <div className="table-dark-container">
                <table className="table-dark">
                  <thead>
                    <tr>
                      <th>Economy</th>
                      <th>Address</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results?.map((result: any, i: number) => (
                      <tr key={i}>
                        <td className="font-medium">{result.economyName}</td>
                        <td>
                          <code className="text-xs bg-white/5 px-2 py-1 rounded">
                            {result.address}
                          </code>
                        </td>
                        <td>{result.amount.toLocaleString()} sats</td>
                        <td>
                          {result.success ? (
                            <span className="badge-success-dark">Sent</span>
                          ) : (
                            <span className="badge-error-dark" title={result.error}>
                              Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <Link href="/cbaf/super-admin/funding" className="btn-secondary-dark">
                  Back to Funding
                </Link>
                <button onClick={() => window.location.reload()} className="btn-primary-dark">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Send More Payments
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
