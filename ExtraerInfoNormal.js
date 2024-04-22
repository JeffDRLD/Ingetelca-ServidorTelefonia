const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "./key.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

async function readAndProcessDataNormal() {
  try {
    const spreadsheetId = "10l8EX2B3Q1whb8-IhREK0NnLi7Md0rjGl4fEYXjVSkc";
    const range = "CAJA CHICA FINAL!A:T";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = response.data.values;

    const processedRows = rows.filter(row => row[17] === "AUTORIZADO✅").map((row) => {
      const [
        ,
        ,
        ,
        semana,
        ,
        tecnico,
        fecha,
        nombredelestablecimiento,
        proyecto,
        descripcionCompra,
        ,
        factura,
        recibo,
      ] = row;
      return {
        fecha,
        nombredelestablecimiento,
        proyecto,
        descripcionCompra,
        factura,
        recibo,
        tecnico,
        semana,
        total: "",
        isVersatec: row[19] === "VERSATEC Gasolina",
      };
    });

    const uniqueRows = removeDuplicateRows(processedRows);
    const normalRows = uniqueRows.filter((row) => !row.isVersatec);
    const versatecRows = uniqueRows.filter((row) => row.isVersatec);

    // Procesar primero todas las filas normales
    for (let row of normalRows) {
      await processRowData(row);
    }
  } catch (error) {
    console.error("Error al leer datos de Google Sheets:", error);
  }
}

function removeDuplicateRows(rows) {
  const uniqueRows = [];
  const rowStrings = new Set();

  rows.forEach((row) => {
    const rowString = JSON.stringify(row);
    if (!rowStrings.has(rowString)) {
      uniqueRows.push(row);
      rowStrings.add(rowString);
    }
  });

  return uniqueRows;
}

function processRowData(row) {
  const csvString = `${row.fecha || ""},${(row.nombredelestablecimiento || "").replace(/,/g, "")},${row.proyecto || ""},${(row.descripcionCompra || "").replace(/,/g, "")},${(row.factura || "").replace(/,/g, "")},${(row.recibo || "").replace(/,/g, "")},${row.tecnico || ""},${row.semana || ""},${row.total || ""}\n`;

  const nombreTecnico = (row.tecnico || "").split(" ").join("_").toUpperCase();
  const carpetaSemana = `./DiccionarioPDFs/SEMANA_${row.semana}`;
  const caminoCSV = `${carpetaSemana}/datos_${nombreTecnico}.csv`;

  if (!fs.existsSync(path.join(__dirname, carpetaSemana))) {
    fs.mkdirSync(path.join(__dirname, carpetaSemana));
  }

  // Eliminar el archivo CSV existente
  if (fs.existsSync(path.join(__dirname, caminoCSV))) {
    fs.unlinkSync(path.join(__dirname, caminoCSV));
  }

  // Crear un nuevo archivo CSV con encabezados
  const headers = [
    { id: "fecha", title: "fecha" },
    { id: "nombreEstablecimiento", title: "nombreEstablecimiento" },
    { id: "proyecto", title: "proyecto" },
    { id: "descripcionCompra", title: "descripcionCompra" },
    { id: "factura", title: "factura" },
    { id: "recibo", title: "recibo" },
    { id: "tecnico", title: "tecnico" },
    { id: "semana", title: "semana" },
    { id: "total", title: "total" },
  ];

  const csvWriter = createCsvWriter({
    path: path.join(__dirname, caminoCSV),
    header: headers,
  });

  csvWriter
    .writeRecords([])
    .then(() => {
      // Escribir la fila actual en el archivo CSV
      fs.appendFile(path.join(__dirname, caminoCSV), csvString, (err) => {
        if (err) throw err;
        console.log(
          `Datos escritos en el archivo CSV para ${row.tecnico}, semana ${row.semana}`,
        );
      });
    })
    .catch((err) => console.error(err));
}

module.exports = { readAndProcessDataNormal };
