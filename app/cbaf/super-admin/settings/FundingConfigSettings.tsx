'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Award, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function FundingConfigSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [config, setConfig] = useState({
    baseAmount: 100000,
    rankBonusEnabled: true,
    rankBonusPool: 5000000,
    performanceBonusEnabled: true,
    performanceBonusPool: 4900000,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/cbaf/settings/funding-config');
      const data = await response.json();
      if (response.ok) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/cbaf/settings/funding-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Funding configuration saved successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  const totalPool = config.baseAmount +
    (config.rankBonusEnabled ? config.rankBonusPool : 0) +
    (config.performanceBonusEnabled ? config.performanceBonusPool : 0);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-bitcoin-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-gray-900">Funding Allocation Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure how funding is distributed to economies based on rankings
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Total Pool Preview */}
        <div className="p-4 bg-gradient-to-r from-bitcoin-50 to-bitcoin-100 rounded-lg border-2 border-bitcoin-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-bitcoin-600 font-medium">Total Default Pool</div>
              <div className="text-3xl font-bold text-bitcoin-700 mt-1">
                {(totalPool / 1000000).toFixed(2)}M sats
              </div>
              <div className="text-xs text-bitcoin-600 mt-1">
                ≈ ${((totalPool / 100000000) * 35000).toFixed(2)} USD @ $35k/BTC
              </div>
            </div>
            <DollarSign className="w-12 h-12 text-bitcoin-400" />
          </div>
        </div>

        {/* Base Amount */}
        <div>
          <label className="label flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Base Amount per Economy (sats)
          </label>
          <input
            type="number"
            value={config.baseAmount}
            onChange={(e) => setConfig({ ...config, baseAmount: parseInt(e.target.value) || 0 })}
            min="0"
            max="1000000"
            step="1000"
            className="input"
          />
          <p className="helper-text">
            Equal base allocation for all participating economies. Set to 0 to disable.
          </p>
        </div>

        {/* Rank Bonus */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label flex items-center gap-2 mb-0">
              <TrendingUp className="w-4 h-4" />
              Rank-Based Bonus
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.rankBonusEnabled}
                onChange={(e) => setConfig({ ...config, rankBonusEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-bitcoin-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bitcoin-500"></div>
            </label>
          </div>

          {config.rankBonusEnabled && (
            <div className="pl-6">
              <label className="label">Rank Bonus Pool (sats)</label>
              <input
                type="number"
                value={config.rankBonusPool}
                onChange={(e) => setConfig({ ...config, rankBonusPool: parseInt(e.target.value) || 0 })}
                min="0"
                max="100000000"
                step="100000"
                className="input"
              />
              <p className="helper-text">
                Distributed inversely by rank (rank 1 gets most, last rank gets least)
              </p>
            </div>
          )}
        </div>

        {/* Performance Bonus */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label flex items-center gap-2 mb-0">
              <Award className="w-4 h-4" />
              Performance-Based Bonus
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.performanceBonusEnabled}
                onChange={(e) => setConfig({ ...config, performanceBonusEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-bitcoin-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bitcoin-500"></div>
            </label>
          </div>

          {config.performanceBonusEnabled && (
            <div className="pl-6">
              <label className="label">Performance Bonus Pool (sats)</label>
              <input
                type="number"
                value={config.performanceBonusPool}
                onChange={(e) => setConfig({ ...config, performanceBonusPool: parseInt(e.target.value) || 0 })}
                min="0"
                max="100000000"
                step="100000"
                className="input"
              />
              <p className="helper-text">
                Distributed based on metrics: videos (40%), total merchants (30%), new merchants (30%)
              </p>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-start gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Configuration
              </>
            )}
          </button>
        </div>

        {/* Info Note */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> These settings define the default allocation structure.
            You can still override the total pool amount when calculating funding for each month.
          </p>
        </div>
      </div>
    </div>
  );
}
