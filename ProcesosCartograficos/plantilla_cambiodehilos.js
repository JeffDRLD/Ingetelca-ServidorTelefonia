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

async function insertarDatosEnPlantilla_CAMBIODEHILOS(indiceListaCambioHilos, name, link_id) {
  const datosAInsertar = indiceListaCambioHilos[0];

  if (!name) {
    return;
  }
  if (!link_id) {
    return;
  }

  return XlsxPopulate.fromFileAsync(
    "./ProcesosCartograficos/Plantillas/CAMBIO DE HILOS_plantilla.xlsx",
  )
    .then(async (workbook) => {
      const sheet = workbook.sheet(0);
      if (!sheet) {
        throw new Error(
          "La hoja en el índice 0 no se encontró en la plantilla.",
        );
      }

      const coordenadas = {
        tkk_num: { row: 3, col: 3 },
        tkk_date_final: { row: 4, col: 3 },
        tkk_name: { row: 5, col: 3 },
        area: { row: 7, col: 3 },
        cap_fibra: { row: 14, col: 2 },
        lat: { row: 14, col: 5 },
        long: { row: 14, col: 6 },
        poste: { row: 14, col: 7 },
        hilos_a: { row: 14, col: 8 },
        capacidad: { row: 14, col: 10 },
        hilos_b_1: { row: 14, col: 12 },
        hilos_b_2: { row: 19, col: 12 },
        hilos_ab_1: { row: 14, col: 9 },
        hilos_ab_2: { row: 19, col: 9 },
      };

      // Insertar los datos en la fila 14
      for (const key in datosAInsertar) {
        const { row, col } = coordenadas[key];
        if (sheet.cell(row, col)) {
          sheet.cell(row, col).value(datosAInsertar[key]);
        } else {
          console.warn(`La celda ${row},${col} no existe en la hoja.`);
        }
      }

      // Insertar los mismos datos en la fila 19
      for (const key in datosAInsertar) {
        const { col } = coordenadas[key];
        if (sheet.cell(19, col)) {
          // Si la celda es la fila 19 y columna 3, poner "XXX"
          if (col === 3) {
            sheet.cell(19, col).value("XXX");
          } else {
            sheet.cell(19, col).value(datosAInsertar[key]);
          }
        } else {
          console.warn(`La celda 19,${col} no existe en la hoja.`);
        }
      }

      const filePath = `./ProcesosCartograficos/GuardarEXCEL/${name}.xlsx`;

      await workbook.toFileAsync(filePath);

      // Subir el archivo a Google Drive en la carpeta especificada
      const fileMetadata = {
        name: name + ".xlsx",
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

      // Eliminar el archivo local
      fs.unlinkSync(filePath);
    })
    .catch((err) => {
      console.error("Error:", err);
    });
}

// Llamar a la función con el índice de la lista deseada
insertarDatosEnPlantilla_CAMBIODEHILOS(0); // Cambia el índice según la lista que desees utilizar
module.exports = insertarDatosEnPlantilla_CAMBIODEHILOS;
