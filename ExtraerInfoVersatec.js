const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "./key.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

async function readAndProcessDataVersatec() {
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

    for (let row of versatecRows) {
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
  const caminoCSV = path.join(__dirname, `${carpetaSemana}/datos_${nombreTecnico}.csv`);

  if (!fs.existsSync(path.join(__dirname, carpetaSemana))) {
    fs.mkdirSync(path.join(__dirname, carpetaSemana), { recursive: true });
  }

  // Añadir los datos al archivo CSV existente, o crear uno nuevo si no existe
  if (fs.existsSync(caminoCSV)) {
    fs.appendFile(caminoCSV, csvString, (err) => {
      if (err) throw err;
      console.log(`Datos añadidos al archivo CSV para ${row.tecnico}, semana ${row.semana}`);
    });
  } else {
    // Crear un nuevo archivo CSV con encabezados
    const headers = [
      { id: "fecha", title: "Fecha" },
      { id: "nombreEstablecimiento", title: "Nombre del Establecimiento" },
      { id: "proyecto", title: "Proyecto" },
      { id: "descripcionCompra", title: "Descripción de Compra" },
      { id: "factura", title: "Factura" },
      { id: "recibo", title: "Recibo" },
      { id: "tecnico", title: "Técnico" },
      { id: "semana", title: "Semana" },
      { id: "total", title: "Total" },
    ];
    const csvWriter = createCsvWriter({
      path: caminoCSV,
      header: headers
    });

    csvWriter.writeRecords([row]).then(() => {
      console.log(`Archivo CSV creado y datos escritos para ${row.tecnico}, semana ${row.semana}`);
    }).catch(err => console.error(err));
  }
}

module.exports = { readAndProcessDataVersatec };
