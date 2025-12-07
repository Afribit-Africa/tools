import Papa from 'papaparse';

export interface ParsedCSV {
  data: string[][];
  headers: string[];
  addressColumn: number;
  addresses: string[];
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
          const addressColumnIndex = detectAddressColumn(headers);

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

function detectAddressColumn(headers: string[]): number {
  const addressKeywords = [
    'address',
    'lightning',
    'ln',
    'blink',
    'email',
    'recipient',
    'payee',
    'username',
  ];

  // Find column that matches address keywords
  const columnIndex = headers.findIndex(header =>
    addressKeywords.some(keyword =>
      header.toLowerCase().includes(keyword)
    )
  );

  // Default to first column if no match found
  return columnIndex >= 0 ? columnIndex : 0;
}

export function convertToCSV(data: string[][]): string {
  return Papa.unparse(data);
}
