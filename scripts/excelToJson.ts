import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT_DIR = path.join(process.cwd(), 'out');

/**
 * Normaliza el formato de hora a "h:mm a.m./p.m."
 */
function formatTime(value: any): string {
  if (!value) return '';

  let date: Date;

  if (value instanceof Date) {
    // Si ExcelJS ya lo detectó como objeto Date
    date = value;
  } else {
    // Si es un string tipo ISO (1899-12-30T...) o texto directo
    const dateParsed = new Date(value);
    // Verificamos si la fecha es válida
    if (!isNaN(dateParsed.getTime())) {
      date = dateParsed;
    } else {
      // Si llega como "8:00 a.m." y no se puede parsear, lo devolvemos tal cual
      return String(value).toLowerCase();
    }
  }

  // Extraemos horas y minutos
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';

  hours = hours % 12;
  hours = hours ? hours : 12; // la hora '0' debería ser '12'
  
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
}

async function convert() {
  const excelFilePath = path.join(process.cwd(), 'datos.xlsx');
  const jsonFilePath = path.join(OUTPUT_DIR, 'registros.json');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelFilePath);
  const worksheet = workbook.worksheets[0];

  const jsonData: Record<string, any>[] = [];
  let headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      headers = (row.values as any[]).map(v => v ? String(v) : '');
    } else {
      const rowData: Record<string, any> = {};
      const values = row.values as any[];
      
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