const { google } = require("googleapis");
const fs = require("fs");

async function getDatosColumnaWeek(numeroColumna, hoja) {
  // Convertir número de columna a letra
  const letraColumna = String.fromCharCode(64 + parseInt(numeroColumna, 10));

  const auth = new google.auth.GoogleAuth({
    keyFile: "./key.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = "10l8EX2B3Q1whb8-IhREK0NnLi7Md0rjGl4fEYXjVSkc";

  try {
    const range = `${hoja}!${letraColumna}2:${letraColumna}`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values;

    // Filtrar valores vacíos y los que se deben excluir
    const filteredValues = values.filter(value => {
      const dato = value[0];
      return dato && !["NOMBRE DEL TECNICO", "TOTAL POR SEMANA", "NOR-ORIENTE", "SUR-ORIENTE", "METROPOLITANA MOTORISTAS", "METROPOLITANA CORE", "METROPOLITANA BUC"].includes(dato);
    });

    // Obtener los comentarios
    const responseComentarios = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: [range],
      includeGridData: true,
    });

    const gridData = responseComentarios.data.sheets[0].data[0].rowData;

    let datos = [];
    let comentarios = [];
    let emptyCount = 0; // Contador de campos vacíos consecutivos

    for (let i = 2; i < filteredValues.length; i++) {
      const dato = filteredValues[i][0];
      const comentario = gridData[i].values[0].note || "";

      if (dato) {
        datos.push(dato);
        comentarios.push(comentario);
        emptyCount = 0; // Reiniciar el contador si se encuentra un dato
      } else {
        emptyCount++;
        if (emptyCount >= 2) { // Detener la iteración si se detectan dos campos vacíos consecutivos
          break;
        }
      }
    }

    // Eliminar el último valor obtenido
    datos = datos.slice(0, -1);
    comentarios = comentarios.slice(0, -1);

    return { datos, comentarios };
  } catch (error) {
    console.error("Error al leer los datos y comentarios:", error);
    return { datos: [], comentarios: [] };
  }
}



module.exports = getDatosColumnaWeek;
