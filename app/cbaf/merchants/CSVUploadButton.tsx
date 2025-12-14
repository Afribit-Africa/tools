'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

interface CSVUploadButtonProps {
  economyId: string;
  variant?: 'primary' | 'secondary';
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string; data: any }>;
}

export default function CSVUploadButton({ economyId, variant = 'primary' }: CSVUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setUploading(true);
    setShowModal(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('economyId', economyId);

      const response = await fetch('/api/cbaf/merchants/import-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import CSV');
      }

      setResult(data.result);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to import CSV');
      setShowModal(false);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `btcmap_url,merchant_name,local_name,lightning_address,payment_provider
https://btcmap.org/merchant/12345,Joe's Coffee Shop,Kahawa ya Joe,joe@blink.sv,blink
https://btcmap.org/merchant/67890,Tech Repair,Mama Tech,tech@blink.sv,blink`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merchants_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const buttonClass = variant === 'primary'
    ? 'px-3 py-2 text-sm font-medium bg-white text-bitcoin-600 rounded-lg hover:bg-bitcoin-50 transition-all inline-flex items-center gap-2'
    : 'px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2';

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={buttonClass}
      >
        <Upload className="w-4 h-4" />
        {uploading ? 'Importing...' : 'Import CSV'}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-heading font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-bitcoin-500" />
                CSV Import Results
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {uploading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-bitcoin-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Processing CSV file...</p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-1">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Successfully Imported</span>
                      </div>
                      <div className="text-3xl font-bold text-green-900">{result.success}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-red-700 mb-1">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Failed</span>
                      </div>
                      <div className="text-3xl font-bold text-red-900">{result.failed}</div>
                    </div>
                  </div>

                  {/* Errors */}
                  {result.errors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Import Errors:</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {result.errors.map((error, idx) => (
                          <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                            <div className="font-medium text-red-900 mb-1">
                              Row {error.row}: {error.error}
                            </div>
                            <div className="text-red-700 text-xs">
                              {JSON.stringify(error.data)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <p className="text-blue-900 font-medium mb-2">CSV Format Tips:</p>
                    <ul className="text-blue-800 space-y-1 list-disc list-inside">
                      <li>Required columns: btcmap_url, lightning_address</li>
                      <li>Optional columns: merchant_name, local_name, payment_provider</li>
                      <li>payment_provider values: blink, fedi, machankura, other</li>
                      <li>
                        <button
                          onClick={downloadTemplate}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Download template CSV
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {result && (
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    window.location.reload();
                  }}
                  className="w-full px-6 py-3 bg-bitcoin-500 text-white rounded-xl font-semibold hover:bg-bitcoin-600 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
