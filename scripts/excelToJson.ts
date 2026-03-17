import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

async function convert() {
  const excelFilePath = path.join(process.cwd(), 'datos.xlsx');
  const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'registros.json');

  const dir = path.dirname(jsonFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelFilePath);
  const worksheet = workbook.worksheets[0];

  const jsonData: Record<string, any>[] = [];
  let headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // First row usually headers
      headers = (row.values as string[]).map(v => v ? String(v) : '');
    } else {
      const rowData: Record<string, any> = {};
      const values = row.values as any[];
      headers.forEach((header, index) => {
        if (header) {
          rowData[header] = values[index] || '';
        }
      });
      jsonData.push(rowData);
    }
  });

  fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`JSON file generated smoothly at ${jsonFilePath}`);
}

convert().catch(console.error);
