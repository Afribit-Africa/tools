'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Send, Clock } from 'lucide-react';
import { FileUploader } from '@/components/modules/fastlight/FileUploader';
import { ValidationTable } from '@/components/modules/fastlight/ValidationTable';
import { StatsCards } from '@/components/modules/fastlight/StatsCards';
import { ProgressBar } from '@/components/modules/fastlight/ProgressBar';
import { ExportButton } from '@/components/modules/fastlight/ExportButton';
import { WalletConnector } from '@/components/modules/fastlight/WalletConnector';
import { BatchPaymentPanel } from '@/components/modules/fastlight/BatchPaymentPanel';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { parseCSVFile, parseXLSXFile } from '@/lib/parsers';
import { sanitizeAddress, parseBlinkAddress, extractUsername } from '@/lib/blink';
import type { ValidationRecord, ValidationStats, BlinkAccount } from '@/types';
import { ValidationBatchProcessor, OptimizedBatchProcessor } from '@/lib/utils/batch-processor';
import { useSecureStorage } from '@/lib/utils/secure-storage';

function detectAmountColumn(headers: string[]): number | undefined {
  const amountKeywords = ['amount', 'sats', 'satoshis', 'payment', 'value', 'total', 'sum'];
  const index = headers.findIndex(header =>
    amountKeywords.some(keyword => String(header).toLowerCase().includes(keyword))
  );
  return index >= 0 ? index : undefined;
}

export default function FastlightPage() {
  const [fileName, setFileName] = useState<string>('');
  const [records, setRecords] = useState<ValidationRecord[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [loadingState, setLoadingState] = useState<string>('');
  const [detectedHeaders, setDetectedHeaders] = useState<{headers: string[], addressColumn: number, amountColumn?: number} | null>(null);
  const [stats, setStats] = useState<ValidationStats>({
    total: 0,
    valid: 0,
    invalid: 0,
    fixed: 0,
    pending: 0,
    progress: 0,
  });
  const [walletConnected, setWalletConnected] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [account, setAccount] = useState<BlinkAccount | undefined>();
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [error, setError] = useState<string>('');
  const secureStorage = useSecureStorage();

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setIsValidating(true);
    setLoadingState('Reading file...');
    setError('');

    try {
      // Parse file based on type
      const extension = file.name.split('.').pop()?.toLowerCase();
      let addresses: string[] = [];
      let amounts: number[] = [];
      let headers: string[] = [];
      let addressColumn = 0;
      let amountColumn: number | undefined;
      let data: string[][] = [];

      if (extension === 'csv') {
        setLoadingState('Parsing CSV file...');
        const parsed = await parseCSVFile(file);
        addresses = parsed.addresses;
        headers = parsed.headers;
        addressColumn = parsed.addressColumn;
        data = parsed.data;
      } else if (extension === 'xlsx' || extension === 'xls') {
        setLoadingState('Parsing XLSX file...');
        const parsed = await parseXLSXFile(file);
        addresses = parsed.addresses;
        headers = parsed.headers;
        addressColumn = parsed.addressColumn;
        data = parsed.data;
      }

      // Detect amount column
      amountColumn = detectAmountColumn(headers);
      if (amountColumn !== undefined) {
        amounts = data.slice(1).map(row => {
          const amountStr = row[amountColumn!];
          const amount = parseFloat(String(amountStr).replace(/[^0-9.]/g, ''));
          return isNaN(amount) ? 0 : Math.floor(amount);
        });
      }

      // Store detected headers info
      setDetectedHeaders({ headers, addressColumn, amountColumn });
      setLoadingState(`Found ${addresses.length} addresses in column "${headers[addressColumn]}"${amountColumn !== undefined ? ` and amounts in "${headers[amountColumn]}"` : ''}`);

      // Small delay to show the detection
      await new Promise(resolve => setTimeout(resolve, 800));

      // Initialize records as pending
      const initialRecords: ValidationRecord[] = addresses.map((addr, index) => ({
        id: `record-${index}`,
        original: addr,
        cleaned: '',
        status: 'pending',
        issues: [],
        amount: amounts[index] || undefined,
        paymentStatus: undefined,
      }));

      setRecords(initialRecords);
      setStats({
        total: addresses.length,
        valid: 0,
        invalid: 0,
        fixed: 0,
        pending: addresses.length,
        progress: 0,
      });

      setLoadingState('Starting validation...');

      // Calculate estimated time
      const estimated = ValidationBatchProcessor.calculateEstimatedTime(addresses.length);
      setEstimatedTime(estimated.formattedTime);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Start validation
      await validateAddresses(initialRecords);
    } catch (error) {
      console.error('File processing error:', error);
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error: Please check your internet connection';
        } else if (error.message.includes('parse') || error.message.includes('format')) {
          errorMessage = 'Invalid file format: Please ensure your CSV/XLSX file is properly formatted';
        } else if (error.message.includes('empty')) {
          errorMessage = 'Empty file: No addresses found in the uploaded file';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setIsValidating(false);
      setLoadingState('');
    }
  };

  const validateAddresses = async (initialRecords: ValidationRecord[]) => {
    const updatedRecords = [...initialRecords];
    let validCount = 0;
    let invalidCount = 0;
    let fixedCount = 0;

    // Create batch processor
    const processor = new ValidationBatchProcessor();

    // Convert records to batch items
    const batchItems = updatedRecords.map((record, index) => ({
      id: `record-${index}`,
      data: record,
    }));

    // Process validation function
    const processRecord = async (item: { id: string; data: ValidationRecord }): Promise<void> => {
      const record = item.data;

      // Sanitize address
      const sanitized = sanitizeAddress(record.original);
      record.cleaned = sanitized.cleaned;
      record.issues = sanitized.issues;

      // Parse and validate Blink address format
      const parsed = parseBlinkAddress(sanitized.cleaned);

      if (!parsed.isValid) {
        record.status = 'invalid';
        record.error = parsed.error;
        invalidCount++;
        return;
      }

      // Call Blink API to verify
      try {
        const username = extractUsername(sanitized.cleaned);
        if (!username) {
          record.status = 'invalid';
          record.error = 'Could not extract username';
          invalidCount++;
          return;
        }

        const response = await fetch('/api/fastlight/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.valid) {
          if (sanitized.wasModified) {
            record.status = 'fixed';
            fixedCount++;
          } else {
            record.status = 'valid';
            validCount++;
          }
        } else {
          record.status = 'invalid';
          record.error = result.error || 'Address not found';
          invalidCount++;
        }
      } catch (error) {
        record.status = 'invalid';
        if (error instanceof Error) {
          if (error.message.includes('network') || error.message.includes('fetch')) {
            record.error = 'Network error - please retry';
          } else if (error.message.includes('timeout')) {
            record.error = 'Request timeout';
          } else {
            record.error = 'Verification failed';
          }
        } else {
          record.error = 'Verification failed';
        }
        invalidCount++;
      }
    };

    // Set progress callback
    processor.setProgressCallback((processed: number, total: number, item?: any) => {
      if (item?.data) {
        setLoadingState(`Validating address ${processed}/${total}: ${item.data.original || ''}`);
      }

      setRecords([...updatedRecords]);
      setStats({
        total: updatedRecords.length,
        valid: validCount,
        invalid: invalidCount,
        fixed: fixedCount,
        pending: updatedRecords.length - (validCount + invalidCount + fixedCount),
        progress: (processed / total) * 100,
      });
    });

    // Process all records with batch processor
    await processor.process(batchItems, processRecord);

    setLoadingState('Validation complete!');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsValidating(false);
    setLoadingState('');
  };

  const handleWalletConnect = (key: string, acc: BlinkAccount) => {
    setApiKey(key);
    setAccount(acc);
    setWalletConnected(true);
  };

  const handlePaymentComplete = (results: any[]) => {
    const updatedRecords = [...records];
    results.forEach((result, index) => {
      const record = updatedRecords.find(r => r.cleaned === result.address);
      if (record) {
        record.paymentStatus = result.success ? 'success' : 'failed';
        record.paymentError = result.error;
        record.paymentId = result.paymentId;
      }
    });
    setRecords(updatedRecords);
  };

  const handleWalletDisconnect = () => {
    secureStorage.remove('blink_api_key');
    setApiKey('');
    setAccount(undefined);
    setWalletConnected(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="btn-ghost px-3 py-2">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-bitcoin/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-bitcoin" />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-bold">Fastlight</h1>
                  <p className="text-xs text-text-secondary">
                    Bulk Blink Address Validator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {records.length === 0 ? (
          /* Upload View */
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-heading font-bold mb-4">
                Verify Lightning Addresses
              </h2>
              <p className="text-text-secondary text-lg">
                Upload your file with Blink addresses and we'll verify each one
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <ErrorAlert
                title="Error"
                message={error}
                onClose={() => setError('')}
                type="error"
              />
            )}

            <FileUploader onFileUpload={handleFileUpload} />

            {/* How it Works */}
            <div className="mt-12 card">
              <h3 className="text-xl font-heading font-bold mb-4">How it works</h3>
              <ol className="space-y-3 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-bitcoin/20 rounded-full flex items-center justify-center text-bitcoin text-sm font-bold">
                    1
                  </span>
                  <span>Upload a CSV or XLSX file containing Blink lightning addresses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-bitcoin/20 rounded-full flex items-center justify-center text-bitcoin text-sm font-bold">
                    2
                  </span>
                  <span>
                    We automatically trim whitespace and verify each address against the Blink
                    API
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-bitcoin/20 rounded-full flex items-center justify-center text-bitcoin text-sm font-bold">
                    3
                  </span>
                  <span>
                    Download cleaned addresses or a full report with validation status
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-bitcoin/20 rounded-full flex items-center justify-center text-bitcoin text-sm font-bold">
                    4
                  </span>
                  <span>
                    <strong className="text-bitcoin">New!</strong> Connect your Blink wallet to send batch payments directly
                  </span>
                </li>
              </ol>
            </div>
          </div>
        ) : (
          /* Validation View */
          <div className="space-y-6">
            {/* Header Detection Info */}
            {detectedHeaders && (
              <div className="card bg-bitcoin/5 border-bitcoin/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-bitcoin/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-bitcoin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Headers Detected</h4>
                    <p className="text-sm text-text-secondary mb-2">
                      Found {detectedHeaders.headers.length} columns. Using <span className="font-mono text-bitcoin font-semibold">"{detectedHeaders.headers[detectedHeaders.addressColumn]}"</span> for addresses.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detectedHeaders.headers.map((header, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded text-xs ${
                            idx === detectedHeaders.addressColumn
                              ? 'bg-bitcoin/20 text-bitcoin font-semibold'
                              : 'bg-bg-tertiary text-text-muted'
                          }`}
                        >
                          {header || `Column ${idx + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <StatsCards stats={stats} />

            {/* Progress */}
            {isValidating && (
              <div className="space-y-4">
                {estimatedTime && (
                  <div className="card bg-bitcoin/5 border-bitcoin/20">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-bitcoin" />
                      <div>
                        <p className="text-sm font-semibold">Estimated Time</p>
                        <p className="text-xs text-text-secondary">{estimatedTime} for {stats.total} addresses</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="card">
                  <ProgressBar
                    current={stats.total - stats.pending}
                    total={stats.total}
                    currentAction={loadingState}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold">
                Validation Results
                {fileName && <span className="text-text-secondary ml-2">• {fileName}</span>}
              </h3>
              <ExportButton
                records={records}
                fileName={fileName.replace(/\.[^/.]+$/, '')}
                disabled={isValidating}
              />
            </div>

            {/* Table */}
            <ValidationTable records={records} isValidating={isValidating} />

            {/* Wallet Connection & Batch Payments */}
            {!isValidating && (
              <div className="space-y-6">
                {/* Wallet Connector */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Send className="w-5 h-5 text-bitcoin" />
                    <h3 className="text-xl font-heading font-bold">Batch Payments</h3>
                    <span className="badge-success text-xs">NEW</span>
                  </div>
                  <WalletConnector
                    onConnect={handleWalletConnect}
                    onDisconnect={handleWalletDisconnect}
                    isConnected={walletConnected}
                    account={account}
                  />
                </div>

                {/* Batch Payment Panel */}
                {walletConnected && account && apiKey && (
                  <BatchPaymentPanel
                    records={records}
                    account={account}
                    apiKey={apiKey}
                    onPaymentComplete={handlePaymentComplete}
                  />
                )}
              </div>
            )}

            {/* Start Over */}
            {!isValidating && (
              <div className="text-center">
                <button
                  onClick={() => {
                    setRecords([]);
                    setFileName('');
                    setDetectedHeaders(null);
                    setLoadingState('');
                    setWalletConnected(false);
                    setApiKey('');
                    setAccount(undefined);
                    setShowPaymentPanel(false);
                    setStats({
                      total: 0,
                      valid: 0,
                      invalid: 0,
                      fixed: 0,
                      pending: 0,
                      progress: 0,
                    });
                  }}
                  className="btn-secondary"
                >
                  Validate Another File
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-secondary py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-text-muted text-sm">
          <p>
            Powered by{' '}
            <a href="https://blink.sv" target="_blank" rel="noopener noreferrer" className="text-bitcoin hover:text-bitcoin-light">
              Blink API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
