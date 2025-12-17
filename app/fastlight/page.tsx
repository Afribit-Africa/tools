'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Send, Clock, Filter, Download, ChevronDown, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { FileUploader } from '@/components/modules/fastlight/FileUploader';
import { ValidationTable } from '@/components/modules/fastlight/ValidationTable';
import { StatsCards } from '@/components/modules/fastlight/StatsCards';
import { ProgressBar } from '@/components/modules/fastlight/ProgressBar';
import { WalletConnector } from '@/components/modules/fastlight/WalletConnector';
import { BatchPaymentPanel } from '@/components/modules/fastlight/BatchPaymentPanel';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { parseCSVFile, parseXLSXFile, convertToCSV } from '@/lib/parsers';
import type { ColumnDetection } from '@/lib/parsers';
import { sanitizeAddress, parseBlinkAddress, extractUsername } from '@/lib/blink';
import { downloadFile } from '@/lib/utils';
import type { ValidationRecord, ValidationStats, BlinkAccount } from '@/types';
import { ValidationBatchProcessor } from '@/lib/utils/batch-processor';
import { useSecureStorage } from '@/lib/utils/secure-storage';

type FilterType = 'all' | 'valid' | 'invalid' | 'fixed' | 'pending';
type ProviderType = 'blink' | 'machankura' | 'lnurl';

interface ParsedFileData {
  data: string[][];
  headers: string[];
  addressColumn: number;
  amountColumn?: number;
  detectedColumns: ColumnDetection[];
  addresses: string[];
  amounts: number[];
}

const PROVIDERS = [
  { id: 'blink', name: 'Blink', description: 'Verify @blink.sv addresses' },
  { id: 'machankura', name: 'Machankura', description: 'Coming soon' },
  { id: 'lnurl', name: 'LNURL', description: 'Coming soon' },
] as const;

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
  
  // Column selection state
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [parsedFileData, setParsedFileData] = useState<ParsedFileData | null>(null);
  const [selectedAddressColumn, setSelectedAddressColumn] = useState<number>(0);
  
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
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [provider, setProvider] = useState<ProviderType>('blink');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const secureStorage = useSecureStorage();

  // Filter records based on current filter
  const filteredRecords = useMemo(() => {
    if (filter === 'all') return records;
    return records.filter(r => r.status === filter);
  }, [records, filter]);

  // Get valid records for auto-pick
  const validRecords = useMemo(() => {
    return records.filter(r => r.status === 'valid' || r.status === 'fixed');
  }, [records]);

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setLoadingState('Reading file...');
    setError('');

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let headers: string[] = [];
      let addressColumn = 0;
      let amountColumn: number | undefined;
      let data: string[][] = [];
      let detectedColumns: ColumnDetection[] = [];
      let addresses: string[] = [];

      if (extension === 'csv') {
        setLoadingState('Parsing CSV file...');
        const parsed = await parseCSVFile(file);
        headers = parsed.headers;
        addressColumn = parsed.addressColumn;
        data = parsed.data;
        detectedColumns = parsed.detectedColumns;
        addresses = parsed.addresses;
      } else if (extension === 'xlsx' || extension === 'xls') {
        setLoadingState('Parsing XLSX file...');
        const parsed = await parseXLSXFile(file);
        headers = parsed.headers;
        addressColumn = parsed.addressColumn;
        data = parsed.data;
        detectedColumns = parsed.detectedColumns;
        addresses = parsed.addresses;
      }

      amountColumn = detectAmountColumn(headers);
      
      // Extract amounts if column detected
      let amounts: number[] = [];
      if (amountColumn !== undefined) {
        amounts = data.slice(1).map(row => {
          const amountStr = row[amountColumn!];
          const amount = parseFloat(String(amountStr).replace(/[^0-9.]/g, ''));
          return isNaN(amount) ? 0 : Math.floor(amount);
        });
      }

      // Store parsed file data for column selection
      setParsedFileData({
        data,
        headers,
        addressColumn,
        amountColumn,
        detectedColumns,
        addresses,
        amounts,
      });
      setSelectedAddressColumn(addressColumn);
      
      // Show column selector if there are multiple potential columns or low confidence
      const hasMultipleOptions = detectedColumns.length > 1;
      const hasLowConfidence = detectedColumns.length > 0 && detectedColumns[0].confidence !== 'high';
      const hasNoDetection = detectedColumns.length === 0;
      
      if (hasMultipleOptions || hasLowConfidence || hasNoDetection) {
        setShowColumnSelector(true);
        setLoadingState('');
      } else {
        // High confidence single detection - proceed directly
        await proceedWithValidation(addressColumn, data, headers, amountColumn, amounts);
      }
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
  
  const handleColumnConfirm = async () => {
    if (!parsedFileData) return;
    
    setShowColumnSelector(false);
    
    // Re-extract addresses from the selected column
    const addresses = parsedFileData.data
      .slice(1)
      .map(row => row[selectedAddressColumn])
      .filter(addr => addr && String(addr).trim().length > 0)
      .map(addr => String(addr));
    
    await proceedWithValidation(
      selectedAddressColumn, 
      parsedFileData.data, 
      parsedFileData.headers, 
      parsedFileData.amountColumn, 
      parsedFileData.amounts
    );
  };
  
  const proceedWithValidation = async (
    addressColumn: number, 
    data: string[][], 
    headers: string[], 
    amountColumn: number | undefined, 
    amounts: number[]
  ) => {
    setIsValidating(true);
    
    // Extract addresses from the selected column
    const addresses = data
      .slice(1)
      .map(row => row[addressColumn])
      .filter(addr => addr && String(addr).trim().length > 0)
      .map(addr => String(addr));

    setDetectedHeaders({ headers, addressColumn, amountColumn });
    setLoadingState(`Found ${addresses.length} addresses in column "${headers[addressColumn]}"${amountColumn !== undefined ? ` and amounts in "${headers[amountColumn]}"` : ''}`);

    await new Promise(resolve => setTimeout(resolve, 800));

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

    const estimated = ValidationBatchProcessor.calculateEstimatedTime(addresses.length);
    setEstimatedTime(estimated.formattedTime);
    await new Promise(resolve => setTimeout(resolve, 500));

    await validateAddresses(initialRecords);
  };

  const validateAddresses = async (initialRecords: ValidationRecord[]) => {
    const updatedRecords = [...initialRecords];
    let validCount = 0;
    let invalidCount = 0;
    let fixedCount = 0;

    const processor = new ValidationBatchProcessor();

    const batchItems = updatedRecords.map((record, index) => ({
      id: `record-${index}`,
      data: record,
    }));

    const processRecord = async (item: { id: string; data: ValidationRecord }): Promise<void> => {
      const record = item.data;

      const sanitized = sanitizeAddress(record.original);
      record.cleaned = sanitized.cleaned;
      record.issues = sanitized.issues;

      const parsed = parseBlinkAddress(sanitized.cleaned);

      if (!parsed.isValid) {
        record.status = 'invalid';
        record.error = parsed.error;
        invalidCount++;
        return;
      }

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
    results.forEach((result) => {
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

  // Export functions
  const handleExportValid = useCallback(() => {
    const validRecs = records.filter(r => r.status === 'valid' || r.status === 'fixed');
    const data = [
      ['Address', 'Amount'],
      ...validRecs.map(r => [r.cleaned || r.original, r.amount?.toString() || '']),
    ];
    const csv = convertToCSV(data);
    downloadFile(csv, `${fileName.replace(/\.[^/.]+$/, '')}_valid.csv`, 'text/csv');
  }, [records, fileName]);

  const handleExportInvalid = useCallback(() => {
    const invalidRecs = records.filter(r => r.status === 'invalid');
    const data = [
      ['Original Address', 'Error'],
      ...invalidRecs.map(r => [r.original, r.error || '']),
    ];
    const csv = convertToCSV(data);
    downloadFile(csv, `${fileName.replace(/\.[^/.]+$/, '')}_invalid.csv`, 'text/csv');
  }, [records, fileName]);

  const handleExportAll = useCallback(() => {
    const data = [
      ['Original Address', 'Cleaned Address', 'Status', 'Issues', 'Error', 'Amount'],
      ...records.map(r => [
        r.original,
        r.cleaned || '',
        r.status,
        r.issues.join('; '),
        r.error || '',
        r.amount?.toString() || '',
      ]),
    ];
    const csv = convertToCSV(data);
    downloadFile(csv, `${fileName.replace(/\.[^/.]+$/, '')}_report.csv`, 'text/csv');
  }, [records, fileName]);

  const resetState = () => {
    setRecords([]);
    setFileName('');
    setDetectedHeaders(null);
    setLoadingState('');
    setWalletConnected(false);
    setApiKey('');
    setAccount(undefined);
    setFilter('all');
    setShowColumnSelector(false);
    setParsedFileData(null);
    setSelectedAddressColumn(0);
    setStats({
      total: 0,
      valid: 0,
      invalid: 0,
      fixed: 0,
      pending: 0,
      progress: 0,
    });
  };

  // Get sample values for selected column
  const getColumnSamples = (columnIndex: number): string[] => {
    if (!parsedFileData) return [];
    return parsedFileData.data
      .slice(1, 4)
      .map(row => String(row[columnIndex] || ''))
      .filter(v => v.length > 0);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bitcoin-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-bold text-white">Fastlight</h1>
                  <p className="text-xs text-gray-400">
                    Bulk Lightning Address Validator
                  </p>
                </div>
              </div>
            </div>

            {/* Provider Selector */}
            <div className="relative">
              <button
                onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
              >
                <span className="text-sm">Provider: {PROVIDERS.find(p => p.id === provider)?.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showProviderDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProvider(p.id as ProviderType);
                        setShowProviderDropdown(false);
                      }}
                      disabled={p.id !== 'blink'}
                      className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                        provider === p.id ? 'bg-bitcoin-500/20 text-bitcoin-400' : 'text-white'
                      } ${p.id !== 'blink' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Column Selector Modal */}
        {showColumnSelector && parsedFileData && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-bitcoin-500/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-bitcoin-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white">Select Address Column</h3>
                    <p className="text-sm text-gray-400">Choose which column contains the Lightning addresses</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* Auto-detected suggestions */}
                {parsedFileData.detectedColumns.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Suggested Columns</h4>
                    <div className="space-y-2">
                      {parsedFileData.detectedColumns.map((col) => (
                        <button
                          key={col.index}
                          onClick={() => setSelectedAddressColumn(col.index)}
                          className={`w-full p-4 rounded-xl border text-left transition-all ${
                            selectedAddressColumn === col.index
                              ? 'bg-bitcoin-500/20 border-bitcoin-500/50'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white">{col.header}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              col.confidence === 'high' 
                                ? 'bg-green-500/20 text-green-400' 
                                : col.confidence === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {col.confidence} confidence
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{col.reason}</p>
                          <div className="flex flex-wrap gap-1">
                            {col.sampleValues.slice(0, 3).map((val, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 font-mono truncate max-w-[200px]">
                                {val}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* All columns */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">All Columns</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {parsedFileData.headers.map((header, idx) => {
                      const samples = getColumnSamples(idx);
                      const isSelected = selectedAddressColumn === idx;
                      const isSuggested = parsedFileData.detectedColumns.some(c => c.index === idx);
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedAddressColumn(idx)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-bitcoin-500/20 border-bitcoin-500/50'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {isSelected && <Check className="w-4 h-4 text-bitcoin-400" />}
                            <span className={`font-medium text-sm ${isSelected ? 'text-bitcoin-400' : 'text-white'}`}>
                              {header || `Column ${idx + 1}`}
                            </span>
                            {isSuggested && !isSelected && (
                              <span className="px-1.5 py-0.5 bg-bitcoin-500/10 text-bitcoin-400 text-xs rounded">
                                suggested
                              </span>
                            )}
                          </div>
                          {samples.length > 0 && (
                            <p className="text-xs text-gray-500 font-mono truncate">
                              {samples[0]}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={resetState}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleColumnConfirm}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-bitcoin-500 to-orange-500 hover:from-bitcoin-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  <Check className="w-4 h-4" />
                  Use Column: {parsedFileData.headers[selectedAddressColumn] || `Column ${selectedAddressColumn + 1}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {records.length === 0 && !showColumnSelector ? (
          /* Upload View */
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-heading font-bold mb-4 text-white">
                Verify Lightning Addresses
              </h2>
              <p className="text-gray-400 text-lg">
                Upload your file with lightning addresses and we will verify each one
              </p>
            </div>

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
            <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-heading font-bold mb-6 text-white">How it works</h3>
              <ol className="space-y-4 text-gray-300">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-bitcoin-500/20 rounded-full flex items-center justify-center text-bitcoin-400 text-sm font-bold">
                    1
                  </span>
                  <span>Upload a CSV or XLSX file containing lightning addresses</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-bitcoin-500/20 rounded-full flex items-center justify-center text-bitcoin-400 text-sm font-bold">
                    2
                  </span>
                  <span>
                    We automatically detect the address column, or you can select it manually
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-bitcoin-500/20 rounded-full flex items-center justify-center text-bitcoin-400 text-sm font-bold">
                    3
                  </span>
                  <span>
                    Filter results, export valid or invalid addresses separately
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-bitcoin-500/20 rounded-full flex items-center justify-center text-bitcoin-400 text-sm font-bold">
                    4
                  </span>
                  <span>
                    Connect your Blink wallet and auto-pick valid addresses for batch payments
                  </span>
                </li>
              </ol>
            </div>
          </div>
        ) : records.length > 0 ? (
          /* Validation View */
          <div className="space-y-6">
            {/* Header Detection Info */}
            {detectedHeaders && (
              <div className="bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-bitcoin-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-bitcoin-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-white mb-1">Headers Detected</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      Found {detectedHeaders.headers.length} columns. Using <span className="font-mono text-bitcoin-400 font-semibold">&quot;{detectedHeaders.headers[detectedHeaders.addressColumn]}&quot;</span> for addresses.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detectedHeaders.headers.map((header, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded text-xs ${
                            idx === detectedHeaders.addressColumn
                              ? 'bg-bitcoin-500/20 text-bitcoin-400 font-semibold'
                              : 'bg-white/5 text-gray-500'
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
                  <div className="bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-bitcoin-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">Estimated Time</p>
                        <p className="text-xs text-gray-400">{estimatedTime} for {stats.total} addresses</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                  <ProgressBar
                    current={stats.total - stats.pending}
                    total={stats.total}
                    currentAction={loadingState}
                  />
                </div>
              </div>
            )}

            {/* Filter & Export Controls */}
            {!isValidating && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                {/* Filter Tabs */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <div className="flex bg-white/5 rounded-lg p-1">
                    {(['all', 'valid', 'fixed', 'invalid', 'pending'] as FilterType[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                          filter === f
                            ? 'bg-bitcoin-500 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f !== 'all' && (
                          <span className="ml-1 text-xs opacity-70">
                            ({f === 'valid' ? stats.valid : f === 'fixed' ? stats.fixed : f === 'invalid' ? stats.invalid : stats.pending})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportValid}
                    disabled={validRecords.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Valid ({validRecords.length})
                  </button>
                  <button
                    onClick={handleExportInvalid}
                    disabled={stats.invalid === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Invalid ({stats.invalid})
                  </button>
                  <button
                    onClick={handleExportAll}
                    disabled={records.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Full Report
                  </button>
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold text-white">
                Validation Results
                {fileName && <span className="text-gray-400 ml-2 text-base font-normal">- {fileName}</span>}
              </h3>
              <span className="text-sm text-gray-400">
                Showing {filteredRecords.length} of {records.length} records
              </span>
            </div>

            {/* Table with scroll */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <ValidationTable records={filteredRecords} isValidating={isValidating} />
              </div>
            </div>

            {/* Wallet Connection & Batch Payments */}
            {!isValidating && (
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Send className="w-5 h-5 text-bitcoin-400" />
                    <h3 className="text-xl font-heading font-bold text-white">Batch Payments</h3>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">Auto-Pick</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Connect your Blink wallet to send payments. Valid addresses ({validRecords.length}) will be automatically selected.
                  </p>
                  <WalletConnector
                    onConnect={handleWalletConnect}
                    onDisconnect={handleWalletDisconnect}
                    isConnected={walletConnected}
                    account={account}
                  />
                </div>

                {walletConnected && account && apiKey && (
                  <BatchPaymentPanel
                    records={validRecords}
                    account={account}
                    apiKey={apiKey}
                    onPaymentComplete={handlePaymentComplete}
                  />
                )}
              </div>
            )}

            {/* Start Over */}
            {!isValidating && (
              <div className="text-center pt-4">
                <button
                  onClick={resetState}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all"
                >
                  Validate Another File
                </button>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>
            Powered by{' '}
            <a href="https://blink.sv" target="_blank" rel="noopener noreferrer" className="text-bitcoin-400 hover:text-bitcoin-300">
              Blink API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
