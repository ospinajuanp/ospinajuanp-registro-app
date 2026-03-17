import * as ExcelJS from 'exceljs';
import * as path from 'path';

async function create() {
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

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Datos');

  if (data.length > 0) {
    // Generate headers
    const columns = Object.keys(data[0]).map(key => ({
      header: key,
      key: key,
      width: 25
    }));
    worksheet.columns = columns;

    // Add rows
    data.forEach(item => {
      worksheet.addRow(item);
    });
  }

  const filePath = path.join(process.cwd(), 'datos.xlsx');
  await workbook.xlsx.writeFile(filePath);

  console.log(`Excel file created at ${filePath}`);
}

create().catch(console.error);
