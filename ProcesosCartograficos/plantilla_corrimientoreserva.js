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

async function insertarDatosEnPlantilla_CORRIMIENTORESERVA(
  indiceLista,
  name2,
  link_id,
) {
  const datosAInsertar = indiceLista[0];
 
  if (!name2) {
    return;
  }
  if (!link_id) {
    return;
  }

  return XlsxPopulate.fromFileAsync(
    "./ProcesosCartograficos/Plantillas/CORRIMIENTO DE RESERVA_plantilla.xlsx",
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
        area: { row: 6, col: 3 },
        sitio: { row: 7, col: 3 },
        tipo_rep: { row: 9, col: 3 },
        original_reserva: { row: 14, col: 2 },
        original_poste: { row: 14, col: 3 },
        original_lat: { row: 14, col: 5 },
        original_long: { row: 14, col: 6 },
        original_capfibra: { row: 14, col: 7 },
        nuevo_reserva: { row: 14, col: 8 },
        nuevo_poste: { row: 14, col: 9 },
        nuevo_lat: { row: 14, col: 11 },
        nuevo_long: { row: 14, col: 12 },
        nuevo_capfibra: { row: 14, col: 13 },
        secuenciafo_inicial: { row: 14, col: 14 },
        secuenciafo_final: { row: 14, col: 15 },
      };

      for (const key in datosAInsertar) {
        const { row, col } = coordenadas[key];
        if (sheet.cell(row, col)) {
          // Verificar si el valor es numérico
          const valor = datosAInsertar[key];
          if (typeof valor === "number") {
            // Convertir a cadena y establecer formato de número
            sheet.cell(row, col).style({ numberFormat: "0.00" });
            sheet.cell(row, col).value(valor.toString());
          } else {
            // Establecer formato de texto
            sheet.cell(row, col).style({ numberFormat: "@" });
            sheet.cell(row, col).value(valor);
          }
        } else {
          console.warn(`La celda ${row},${col} no existe en la hoja.`);
        }
      }

      const filePath = `./ProcesosCartograficos/GuardarEXCEL/${name2}.xlsx`;

      await workbook.toFileAsync(`./ProcesosCartograficos/GuardarEXCEL/${name2}.xlsx`);

      // Subir el archivo a Google Drive en la carpeta especificada
      const fileMetadata = {
        name: name2 + ".xlsx",
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
insertarDatosEnPlantilla_CORRIMIENTORESERVA(0); // Cambia el índice según la lista que desees utilizar

module.exports = insertarDatosEnPlantilla_CORRIMIENTORESERVA;
