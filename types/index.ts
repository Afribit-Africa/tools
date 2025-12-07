export interface ValidationRecord {
  id: string;
  original: string;
  cleaned: string;
  status: 'valid' | 'invalid' | 'fixed' | 'pending';
  error?: string;
  issues: string[];
  amount?: number;
  paymentStatus?: 'pending' | 'processing' | 'success' | 'failed';
  paymentError?: string;
  paymentId?: string;
}

export interface ValidationStats {
  total: number;
  valid: number;
  invalid: number;
  fixed: number;
  pending: number;
  progress: number;
}

export interface ValidationSession {
  id: string;
  fileName: string;
  stats: ValidationStats;
  records: ValidationRecord[];
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export type FileType = 'csv' | 'xlsx' | 'xls';

export interface UploadedFile {
  file: File;
  type: FileType;
}

export interface BlinkWallet {
  id: string;
  walletCurrency: 'BTC' | 'USD';
  balance: number;
}

export interface BlinkAccount {
  wallets: BlinkWallet[];
  defaultWalletId: string;
}

export interface PaymentRequest {
  address: string;
  amount: number;
  walletId: string;
}

export interface PaymentResult {
  success: boolean;
  address: string;
  amount: number;
  status: string;
  error?: string;
  paymentId?: string;
}

export interface BatchPaymentStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  totalAmount: number;
  progress: number;
}
