const XlsxPopulate = require("xlsx-populate");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const key = require("./key.json");
const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ["https://www.googleapis.com/auth/drive"],
  null,
);

jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  }
});

const drive = google.drive({ version: "v3", auth: jwtClient });

async function insertarDatosEnPlantilla_CAMBIOPOSTE(indiceLista, name3, link_id) {
  const datosAInsertar = indiceLista[0];

  if (!name3) {
    return;
  }
  if (!link_id) {
    return;
  }

  try {
    const workbook = await XlsxPopulate.fromFileAsync(
      "./ProcesosCartograficos/Plantillas/CAMBIO DE POSTES_plantilla.xlsx",
    );
    const sheet = workbook.sheet(0);

    if (!sheet) {
      throw new Error("La hoja en el índice 0 no se encontró en la plantilla.");
    }

    const coordenadas = {
      tkk_num: { row: 3, col: 3 },
      tkk_date_final: { row: 4, col: 3 },
      tkk_name: { row: 5, col: 3 },
      no_installation: { row: 6, col: 3 },
      area: { row: 7, col: 3 },
      tipo_rep: { row: 9, col: 3 },
      original_poste: { row: 14, col: 2 },
      original_reserva: { row: 14, col: 3 },
      original_lat: { row: 14, col: 5 },
      original_long: { row: 14, col: 6 },
      nuevo_poste: { row: 14, col: 8 },
      nuevo_reserva: { row: 14, col: 9 },
      nuevo_lat: { row: 14, col: 11 },
      nuevo_long: { row: 14, col: 12 },
    };

    for (const key in datosAInsertar) {
      const { row, col } = coordenadas[key];
      if (sheet.cell(row, col)) {
        const valor = datosAInsertar[key];
        if (typeof valor === "number") {
          sheet.cell(row, col).style({ numberFormat: "0.00" });
          sheet.cell(row, col).value(valor.toString());
        } else {
          sheet.cell(row, col).style({ numberFormat: "@" });
          sheet.cell(row, col).value(valor);
        }
      } else {
        console.warn(`La celda ${row},${col} no existe en la hoja.`);
      }
    }

    const filePath = `./ProcesosCartograficos/GuardarEXCEL/${name3}.xlsx`;

    await workbook.toFileAsync(filePath);

    const fileMetadata = {
      name: name3 + ".xlsx",
      parents: [link_id],
    };

    const media = {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      body: fs.createReadStream(filePath),
    };

    await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    console.log("Plantilla creada y guardada en Google Drive con éxito.");

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Error:", err);
  }
}

// Llamar a la función con el índice de la lista deseada
insertarDatosEnPlantilla_CAMBIOPOSTE(0); // Cambia el índice según la lista que desees utilizar

module.exports = insertarDatosEnPlantilla_CAMBIOPOSTE;
