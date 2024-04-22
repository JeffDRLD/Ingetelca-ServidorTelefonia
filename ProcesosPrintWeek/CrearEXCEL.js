const ExcelJS = require('exceljs');
const fs = require('fs');

async function createExcel(gastosEnero, searchInput, date, [totales], excelName) {
  // Agrupar datos por tipo de proyecto
  const proyectosAgrupados = {};
  gastosEnero.forEach((item) => {
    if (!proyectosAgrupados[item.proyecto]) {
      proyectosAgrupados[item.proyecto] = [];
    }
    proyectosAgrupados[item.proyecto].push(item);
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Your Name';
  workbook.created = new Date();

  for (const proyecto in proyectosAgrupados) {
    const proyectoData = proyectosAgrupados[proyecto];
    const sheet = workbook.addWorksheet(proyecto);

    // Add headers
    sheet.columns = [
      { header: 'No.', key: 'no', width: 10 },
      { header: 'Nombre de Tecnico', key: 'tecnico', width: 30 },
      { header: 'Monto a Reintegrar', key: 'monto', width: 20 },
      { header: 'Observación', key: 'observacion', width: 30 },
      { header: 'Proyecto', key: 'proyecto', width: 20 },
    ];

    // Add rows
    proyectoData.forEach((item, index) => {
      sheet.addRow({
        no: index + 1,
        tecnico: item.nombre,
        monto: item.monto,
        observacion: item.observacion,
        proyecto: item.proyecto,
      });
    });

    // Add total row
    sheet.addRow({
      tecnico: 'Total',
      monto: totales[proyecto],
    });
  }

  // Write to file
  await workbook.xlsx.writeFile(excelName);
}

module.exports = { createExcel };
