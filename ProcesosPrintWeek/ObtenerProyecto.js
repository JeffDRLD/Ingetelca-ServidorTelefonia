const { google } = require("googleapis");
const fs = require("fs");

async function getDatosColumnaProyect(nombreColumna, hoja) {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./key.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = "10l8EX2B3Q1whb8-IhREK0NnLi7Md0rjGl4fEYXjVSkc";

  try {
    const range = `${hoja}!${nombreColumna}2:${nombreColumna}`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values;

    // Filtrar valores vacíos y los que se deben excluir
    const filteredValues = values.filter(value => {
      const dato = value[0];
      return dato && !["PROYECTO"].includes(dato);
    });

    // Mapear los valores filtrados a un array
    const columnValues = filteredValues.map(value => value[0]);
    return columnValues;
  } catch (error) {
    console.error("Error al leer los datos:", error);
    return [];
  }
}
getDatosColumnaProyect("B", "TOTAL CAJA CHICA");

module.exports = getDatosColumnaProyect;
