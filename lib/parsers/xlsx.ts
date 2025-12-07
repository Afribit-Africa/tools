import * as XLSX from 'xlsx';

export interface ParsedXLSX {
  data: string[][];
  headers: string[];
  addressColumn: number;
  addresses: string[];
  sheetName: string;
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

        const headers = jsonData[0];
        const addressColumnIndex = detectAddressColumn(headers);

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

  const columnIndex = headers.findIndex(header =>
    addressKeywords.some(keyword =>
      String(header).toLowerCase().includes(keyword)
    )
  );

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
