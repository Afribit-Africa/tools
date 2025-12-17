import Papa from 'papaparse';

export interface ParsedCSV {
  data: string[][];
  headers: string[];
  addressColumn: number;
  addresses: string[];
  detectedColumns: ColumnDetection[];
}

export interface ColumnDetection {
  index: number;
  header: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  sampleValues: string[];
}

export async function parseCSVFile(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const data = results.data as string[][];

          if (data.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          // Try to detect the address column
          const headers = data[0];
          const detectedColumns = detectAllAddressColumns(headers, data);
          const addressColumnIndex = detectedColumns.length > 0
            ? detectedColumns[0].index
            : 0;

          // Extract addresses (skip header row)
          const addresses = data
            .slice(1)
            .map(row => row[addressColumnIndex])
            .filter(addr => addr && addr.trim().length > 0);

          resolve({
            data,
            headers,
            addressColumn: addressColumnIndex,
            addresses,
            detectedColumns,
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Detect all potential address columns with confidence levels
 */
function detectAllAddressColumns(headers: string[], data: string[][]): ColumnDetection[] {
  const detections: ColumnDetection[] = [];

  // Priority keywords - higher priority = lightning-specific terms
  const highPriorityKeywords = ['lightning', 'ln', 'blink', 'lnurl', 'lightning_address', 'ln_address'];
  const mediumPriorityKeywords = ['address', 'recipient', 'payee', 'wallet'];
  const lowPriorityKeywords = ['username', 'email', 'user', 'contact'];

  headers.forEach((header, index) => {
    const headerLower = String(header).toLowerCase().trim();
    const sampleValues = data.slice(1, 4).map(row => row[index] || '').filter(v => v);

    // Check high priority (lightning-specific)
    if (highPriorityKeywords.some(kw => headerLower.includes(kw))) {
      detections.push({
        index,
        header: header || `Column ${index + 1}`,
        confidence: 'high',
        reason: 'Lightning address column detected',
        sampleValues,
      });
      return;
    }

    // Check if values look like lightning addresses (contain @)
    const hasAtSymbol = sampleValues.some(v => v.includes('@'));
    const hasBlinkDomain = sampleValues.some(v => v.includes('@blink.sv') || v.includes('@blink'));

    if (hasBlinkDomain) {
      detections.push({
        index,
        header: header || `Column ${index + 1}`,
        confidence: 'high',
        reason: 'Contains Blink addresses',
        sampleValues,
      });
      return;
    }

    // Check medium priority
    if (mediumPriorityKeywords.some(kw => headerLower.includes(kw))) {
      detections.push({
        index,
        header: header || `Column ${index + 1}`,
        confidence: hasAtSymbol ? 'medium' : 'low',
        reason: hasAtSymbol ? 'Address column with @ values' : 'Generic address column',
        sampleValues,
      });
      return;
    }

    // Check low priority - be careful with "email" columns
    if (lowPriorityKeywords.some(kw => headerLower.includes(kw))) {
      // If it's explicitly an email column and values have common email domains, lower confidence
      const hasEmailDomains = sampleValues.some(v =>
        v.includes('@gmail.') || v.includes('@yahoo.') || v.includes('@outlook.') ||
        v.includes('@hotmail.') || v.includes('@proton.')
      );

      if (headerLower.includes('email') && hasEmailDomains) {
        // Skip - this is likely a regular email column, not lightning addresses
        return;
      }

      if (hasAtSymbol) {
        detections.push({
          index,
          header: header || `Column ${index + 1}`,
          confidence: 'low',
          reason: 'May contain addresses',
          sampleValues,
        });
      }
    }
  });

  // Sort by confidence (high > medium > low)
  const confidenceOrder = { high: 0, medium: 1, low: 2 };
  detections.sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence]);

  return detections;
}

function detectAddressColumn(headers: string[]): number {
  const addressKeywords = [
    'lightning',
    'ln',
    'blink',
    'address',
    'recipient',
    'payee',
    'username',
  ];

  // Find column that matches address keywords (excluding "email" to avoid confusion)
  const columnIndex = headers.findIndex(header => {
    const headerLower = header.toLowerCase();
    // Skip if it's explicitly an email column
    if (headerLower.includes('email') && !headerLower.includes('lightning')) {
      return false;
    }
    return addressKeywords.some(keyword => headerLower.includes(keyword));
  });

  // Default to first column if no match found
  return columnIndex >= 0 ? columnIndex : 0;
}

export function convertToCSV(data: string[][]): string {
  return Papa.unparse(data);
}
