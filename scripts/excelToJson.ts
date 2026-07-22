import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { formatTime } from '../src/lib/utils/formatTime';

const OUTPUT_DIR = path.join(process.cwd(), 'out');

/**
 * Format-time logic moved to src/lib/utils/formatTime.ts so it can be unit tested.
 * This script imports the same helper to keep behavior identical.
 */

async function convert() {
  const excelFilePath = path.join(process.cwd(), 'datos.xlsx');
  const jsonFilePath = path.join(OUTPUT_DIR, 'registros.json');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelFilePath);
  const worksheet = workbook.worksheets[0];

  const jsonData: Record<string, unknown>[] = [];
  let headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      headers = (row.values as unknown[]).map(v => v ? String(v) : '');
    } else {
      const rowData: Record<string, unknown> = {};
      const values = row.values as unknown[];
      
      headers.forEach((header, index) => {
        if (header) {
          let value = values[index];

          // Lógica específica para columnas de hora
          // Puedes filtrar por nombre de header si solo quieres aplicar esto a ciertas columnas
          // Ejemplo: if (header.toLowerCase().includes('hora')) { ... }
          if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
              value = formatTime(value);
          }

          rowData[header] = value || '';
        }
      });
      jsonData.push(rowData);
    }
  });

  fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`JSON file generated smoothly at ${jsonFilePath}`);
}

convert().catch(console.error);