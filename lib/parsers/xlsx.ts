import * as XLSX from 'xlsx';
import type { ColumnDetection } from './csv';

export interface ParsedXLSX {
  data: string[][];
  headers: string[];
  addressColumn: number;
  addresses: string[];
  sheetName: string;
  detectedColumns: ColumnDetection[];
}

export async function parseXLSXFile(file: File): Promise<ParsedXLSX> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });

        // Use first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to 2D array
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as string[][];

        if (jsonData.length === 0) {
          reject(new Error('XLSX file is empty'));
          return;
        }

        const headers = jsonData[0].map(h => String(h));
        const detectedColumns = detectAllAddressColumns(headers, jsonData);
        const addressColumnIndex = detectedColumns.length > 0 
          ? detectedColumns[0].index 
          : 0;

        // Extract addresses (skip header row)
        const addresses = jsonData
          .slice(1)
          .map(row => row[addressColumnIndex])
          .filter(addr => addr && String(addr).trim().length > 0)
          .map(addr => String(addr));

        resolve({
          data: jsonData,
          headers,
          addressColumn: addressColumnIndex,
          addresses,
          sheetName,
          detectedColumns,
        });
      } catch (error) {
        reject(new Error(`XLSX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
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
    const sampleValues = data.slice(1, 4).map(row => String(row[index] || '')).filter(v => v);
    
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
      const hasEmailDomains = sampleValues.some(v => 
        v.includes('@gmail.') || v.includes('@yahoo.') || v.includes('@outlook.') || 
        v.includes('@hotmail.') || v.includes('@proton.')
      );
      
      if (headerLower.includes('email') && hasEmailDomains) {
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

  const columnIndex = headers.findIndex(header => {
    const headerLower = String(header).toLowerCase();
    if (headerLower.includes('email') && !headerLower.includes('lightning')) {
      return false;
    }
    return addressKeywords.some(keyword => headerLower.includes(keyword));
  });

  return columnIndex >= 0 ? columnIndex : 0;
}

export function convertToXLSX(data: string[][], fileName: string): Blob {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Validation Results');

  const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([xlsxData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
