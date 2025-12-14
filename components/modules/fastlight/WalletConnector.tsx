'use client';

import { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import type { BlinkAccount } from '@/types';
import { useSecureStorage, maskApiKey } from '@/lib/utils/secure-storage';

interface WalletConnectorProps {
  onConnect: (apiKey: string, account: BlinkAccount) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  account?: BlinkAccount;
}

export function WalletConnector({ onConnect, onDisconnect, isConnected, account }: WalletConnectorProps) {
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const secureStorage = useSecureStorage();

  // Update remaining time every second
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const remaining = secureStorage.getRemainingTime('blink_api_key');
      setTimeRemaining(remaining);

      if (remaining <= 0 && isConnected) {
        handleDisconnect();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const response = await fetch('/api/fastlight/connect-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your credentials.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status >= 500) {
          throw new Error('Blink API service unavailable. Please try again later.');
        }
        throw new Error(`Connection failed (${response.status})`);
      }

      const data = await response.json();

      if (data.success) {
        // Store API key securely with 30-minute timeout
        secureStorage.set('blink_api_key', apiKey, {
          timeout: 30 * 60 * 1000, // 30 minutes
          onExpire: () => {
            handleDisconnect();
            alert('Session expired. Please reconnect your wallet.');
          },
        });

        setTimeRemaining(30 * 60 * 1000);
        onConnect(apiKey, data.account);
        setApiKey(''); // Clear input after successful connection
      } else {
        setError(data.error || 'Failed to connect wallet');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network.');
      } else {
        setError('Connection failed. Please check your API key and try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    secureStorage.remove('blink_api_key');
    setTimeRemaining(0);
    onDisconnect();
  };

  const handleExtendSession = () => {
    const extended = secureStorage.extend('blink_api_key', 30 * 60 * 1000); // Extend by 30 minutes
    if (extended) {
      setTimeRemaining(30 * 60 * 1000);
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isConnected && account) {
    const storedKey = secureStorage.get('blink_api_key');
    const isExpiringSoon = timeRemaining < 5 * 60 * 1000; // Less than 5 minutes

    return (
      <div className={`bg-white/5 backdrop-blur-xl border rounded-xl p-4 ${isExpiringSoon ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isExpiringSoon ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
            <CheckCircle2 className={`w-6 h-6 ${isExpiringSoon ? 'text-yellow-400' : 'text-green-400'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white">Wallet Connected</h4>
              <button
                onClick={handleDisconnect}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Disconnect
              </button>
            </div>

            {/* API Key Display */}
            <div className="mb-3 flex items-center gap-2 text-xs">
              <span className="text-gray-500">API Key:</span>
              <code className="font-mono text-gray-400">{maskApiKey(storedKey || '')}</code>
            </div>

            {/* Session Timer */}
            <div className="mb-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isExpiringSoon ? 'text-yellow-400' : 'text-gray-500'}`} />
                <span className={isExpiringSoon ? 'text-yellow-400 font-semibold' : 'text-gray-500'}>
                  Session expires in: {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
              {isExpiringSoon && (
                <button
                  onClick={handleExtendSession}
                  className="flex items-center gap-1 text-bitcoin-400 hover:text-bitcoin-300 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Extend
                </button>
              )}
            </div>

            {/* Wallet Balances */}
            <div className="space-y-2">
              {account.wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {wallet.walletCurrency} Wallet:
                  </span>
                  <span className="font-mono font-bold text-bitcoin-400">
                    {wallet.walletCurrency === 'BTC'
                      ? `${wallet.balance.toLocaleString()} sats`
                      : `$${(wallet.balance / 100).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-bitcoin-500/20 rounded-lg flex items-center justify-center">
          <Wallet className="w-6 h-6 text-bitcoin-400" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="font-semibold mb-1 text-white">Connect Blink Wallet</h4>
            <p className="text-sm text-gray-400">
              Enter your Blink API key to enable batch payments.{' '}
              <a
                href="https://dashboard.blink.sv/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bitcoin-400 hover:text-bitcoin-300 underline"
              >
                Get API key
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="blink_..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-bitcoin-500/50 focus:outline-none focus:ring-1 focus:ring-bitcoin-500/50 font-mono"
              disabled={isConnecting}
            />
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting || !apiKey.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-bitcoin-500 to-orange-500 hover:from-bitcoin-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Wallet'
            )}
          </button>

          <div className="bg-bitcoin-500/10 border border-bitcoin-500/20 rounded-lg p-3">
            <p className="text-xs text-gray-400">
              <strong className="text-yellow-400">Security Note:</strong> Your API key is only
              used for this session and is not stored anywhere. Make sure to use an API key with
              <strong> Write</strong> scope to send payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
