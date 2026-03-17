import xlsx from 'xlsx';
import * as path from 'path';

const data = [
  {
    "Tipo de documento del niño": "Rc",
    "Número de documento del niño": "1001",
    "Nombre completo del niño": "Joseph David Ri Os",
    "Sede": "Sede CDs pradito",
    "Tipo de paquete": "NM-365",
    "Recibe paquete": "si",
    "fecha": "25 de marzo",
    "hora": "8:10am"
  },
  {
    "Tipo de documento del niño": "Ti",
    "Número de documento del niño": "1002",
    "Nombre completo del niño": "Sofia Lopez",
    "Sede": "Sede CDs Belen",
    "Tipo de paquete": "",
    "Recibe paquete": "no",
    "fecha": "",
    "hora": ""
  }
];

const ws = xlsx.utils.json_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Datos');

const filePath = path.join(process.cwd(), 'datos.xlsx');
xlsx.writeFile(wb, filePath);

console.log(`Excel file created at ${filePath}`);
