const fs = require("fs");
const csvParser = require("csv-parser");
const path = require("path");

async function updateTotalsInCsv(filePath) {
  const rows = [];
  let grandTotal = 0;

  // Leer el archivo CSV y calcular el total general
  await new Promise((resolve, reject) => {
    let rowIndex = 0;
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        if (rowIndex >= 1 && !row.total) { // Asumiendo que 'total' es el campo a verificar
          rows.push(row);
          grandTotal += parseFloat(row.factura) || 0;
          grandTotal += parseFloat(row.recibo) || 0;
        }
        rowIndex++;
      })
      .on("end", resolve)
      .on("error", reject);
  });

  grandTotal = parseFloat(grandTotal.toFixed(2)); // Redondear a dos decimales

  // Crear encabezados y una línea vacía
  const headerString = "fecha,nombreEstablecimiento,proyecto,descripcionCompra,factura,recibo,tecnico,semana,total\n\n";
  await fs.promises.writeFile(filePath, headerString); // Escribir encabezado y línea vacía

  // Convertir cada fila actualizada a string CSV y añadirlas al archivo
  rows.forEach(async (row) => {
    const csvLine = `${row.fecha},${row.nombreEstablecimiento},${row.proyecto},${row.descripcionCompra},${row.factura},${row.recibo},${row.tecnico},${row.semana},${grandTotal.toFixed(2)}\n`;
    await fs.promises.appendFile(filePath, csvLine);
  });
}

module.exports = { updateTotalsInCsv };
