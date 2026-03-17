import xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const excelFilePath = path.join(process.cwd(), 'datos.xlsx');
const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'registros.json');

// Ensure output directory exists
const dir = path.dirname(jsonFilePath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Read Excel file
const workbook = xlsx.readFile(excelFilePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON dynamically using first row as headers
// defval ensures that empty cells are read as empty strings
const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

// Write to JSON file
fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');

console.log(`JSON file generated smoothly at ${jsonFilePath}`);
