'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap, CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationSystem';
import { useConfirmation } from '@/components/ui/ConfirmationModal';

interface WalletSettings {
  apiKey: string;
  isConnected: boolean;
  lastTested: string | null;
  walletBalance: number | null;
}

export default function BlinkWalletSettings() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [settings, setSettings] = useState<WalletSettings | null>(null);

  const { showSuccess, showError, showInfo } = useNotification();
  const { confirm, ConfirmationDialog } = useConfirmation();

  // Load existing settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cbaf/settings/blink');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        if (data.apiKey) {
          // Show masked API key
          setApiKey('••••••••••••••••••••••••••••••••');
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!apiKey || apiKey.startsWith('••')) {
      showError('Invalid API Key', 'Please enter a valid Blink API key');
      return;
    }

    confirm({
      title: 'Save Blink API Key?',
      message: 'This will securely encrypt and store your API key in the database. You can update or remove it at any time.',
      confirmText: 'Save API Key',
      type: 'warning',
      onConfirm: performSave,
    });
  };

  const performSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/cbaf/settings/blink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save API key');
      }

      showSuccess('API Key Saved', 'Your Blink wallet API key has been securely stored');
      await loadSettings();
    } catch (error) {
      showError('Save Failed', error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!settings?.apiKey && (!apiKey || apiKey.startsWith('••'))) {
      showError('No API Key', 'Please save your API key before testing the connection');
      return;
    }

    setIsTesting(true);
    showInfo('Testing Connection', 'Verifying your Blink wallet connection...');

    try {
      const response = await fetch('/api/cbaf/settings/blink/test', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Connection test failed');
      }

      showSuccess(
        'Connection Successful',
        `Wallet connected! Balance: ${data.balance} sats`
      );
      await loadSettings();
    } catch (error) {
      showError(
        'Connection Failed',
        error instanceof Error ? error.message : 'Failed to connect to Blink wallet'
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemove = () => {
    confirm({
      title: 'Remove Blink API Key?',
      message: 'This will permanently delete your API key from the database. You will need to re-enter it to enable payments.',
      confirmText: 'Remove API Key',
      type: 'danger',
      onConfirm: performRemove,
    });
  };

  const performRemove = async () => {
    try {
      const response = await fetch('/api/cbaf/settings/blink', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove API key');
      }

      showSuccess('API Key Removed', 'Your Blink wallet has been disconnected');
      setApiKey('');
      setSettings(null);
    } catch (error) {
      showError('Remove Failed', error instanceof Error ? error.message : 'Failed to remove API key');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-bitcoin-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {ConfirmationDialog}
      <div className="space-y-6">
        {/* Connection Status */}
        {settings?.isConnected && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-green-900 mb-1">Wallet Connected</h4>
              <p className="text-sm text-green-700">
                Your Blink wallet is connected and ready to send payments
              </p>
              {settings.walletBalance !== null && (
                <p className="text-sm text-green-600 mt-2">
                  <strong>Balance:</strong> {settings.walletBalance.toLocaleString()} sats
                </p>
              )}
              {settings.lastTested && (
                <p className="text-xs text-green-600 mt-1">
                  Last tested: {new Date(settings.lastTested).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* API Key Input */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Blink API Key
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Blink API key"
            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-bitcoin-300 focus:outline-none focus:ring-2 focus:ring-bitcoin-100 transition-all font-mono text-sm"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            {showApiKey ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Your API key will be encrypted before storage and never displayed in plain text
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving || !apiKey || apiKey.startsWith('••')}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-bitcoin-500 text-white font-bold rounded-xl hover:bg-bitcoin-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save API Key
            </>
          )}
        </button>

        <button
          onClick={handleTest}
          disabled={isTesting || (!settings?.apiKey && !apiKey)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {isTesting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Test Connection
            </>
          )}
        </button>

        {settings?.apiKey && (
          <button
            onClick={handleRemove}
            className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
          >
            Remove
          </button>
        )}
      </div>

      {/* Warning */}
      {!settings?.isConnected && settings?.apiKey && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-yellow-900 mb-1">Connection Not Verified</h4>
              <p className="text-sm text-yellow-700">
                Your API key is saved but hasn't been tested yet. Click "Test Connection" to verify it works.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
