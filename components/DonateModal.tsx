'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lightningAddress: string;
  recipientName: string;
}

const PRESET_AMOUNTS = [
  { label: '1K sats', value: 1000 },
  { label: '5K sats', value: 5000 },
  { label: '10K sats', value: 10000 },
  { label: '21K sats', value: 21000 },
  { label: '50K sats', value: 50000 },
  { label: '100K sats', value: 100000 },
];

export function DonateModal({ isOpen, onClose, lightningAddress, recipientName }: DonateModalProps) {
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [invoiceUrl, setInvoiceUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generatePaymentRequest();
    }
  }, [isOpen, amount]);

  const generatePaymentRequest = async () => {
    setIsGenerating(true);
    try {
      // Create Blink payment URL
      const username = lightningAddress.split('@')[0];
      const paymentUrl = `https://pay.blink.sv/${username}`;
      
      // Add amount and message as query parameters
      const params = new URLSearchParams();
      if (amount > 0) {
        params.append('amount', amount.toString());
      }
      if (message) {
        params.append('message', encodeURIComponent(message));
      }
      
      const fullUrl = params.toString() ? `${paymentUrl}?${params.toString()}` : paymentUrl;
      setInvoiceUrl(fullUrl);

      // Generate artistic QR code with styling
      const qrOptions = {
        errorCorrectionLevel: 'H' as const,
        type: 'image/png' as const,
        quality: 1,
        margin: 2,
        width: 400,
        color: {
          dark: '#F7931A', // Bitcoin orange
          light: '#000000', // Black background
        },
      };

      const qrUrl = await QRCode.toDataURL(fullUrl, qrOptions);
      setQrDataUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseInt(value) || 0;
    if (numValue > 0) {
      setAmount(numValue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-heading font-bold text-white">Support {recipientName}</h3>
            <p className="text-sm text-gray-400 mt-1">Send sats via Lightning Network</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Preset Amounts */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">Select Amount</label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setAmount(preset.value);
                    setCustomAmount('');
                  }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    amount === preset.value && !customAmount
                      ? 'bg-bitcoin-500 text-white shadow-lg shadow-bitcoin-500/25'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">Or Enter Custom Amount</label>
            <div className="relative">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="Enter amount in sats"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bitcoin-500/50 focus:border-bitcoin-500/50 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                sats
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Add a Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something nice..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bitcoin-500/50 focus:border-bitcoin-500/50 transition-all resize-none"
            />
          </div>

          {/* QR Code */}
          <div className="mb-6">
            <div className="bg-black border border-white/10 rounded-2xl p-6 flex flex-col items-center">
              {isGenerating ? (
                <div className="w-full aspect-square max-w-sm flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-bitcoin-500 animate-spin" />
                </div>
              ) : qrDataUrl ? (
                <>
                  <div className="relative w-full max-w-sm aspect-square mb-4">
                    <img
                      src={qrDataUrl}
                      alt="Payment QR Code"
                      className="w-full h-full rounded-xl shadow-2xl shadow-bitcoin-500/20"
                    />
                    {/* Decorative corners */}
                    <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-bitcoin-500 rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-bitcoin-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-bitcoin-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-bitcoin-500 rounded-br-lg"></div>
                  </div>
                  <p className="text-sm text-gray-400 text-center">
                    Scan with any Lightning wallet
                  </p>
                </>
              ) : null}
            </div>
          </div>

          {/* Lightning Address */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Lightning Address
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3">
                <code className="text-sm text-bitcoin-400 font-mono">{lightningAddress}</code>
              </div>
              <button
                onClick={() => handleCopy(lightningAddress)}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-bitcoin-500 to-orange-500 hover:from-bitcoin-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-bitcoin-500/25 hover:shadow-xl hover:shadow-bitcoin-500/30 transition-all"
            >
              <Zap className="w-5 h-5" />
              Pay with Lightning
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => handleCopy(invoiceUrl)}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 inline mr-2" />
                  Copied Link
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 inline mr-2" />
                  Copy Payment Link
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-xl">
            <p className="text-xs text-bitcoin-400 text-center">
              Powered by Blink. Fast, secure, and instant Lightning payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
