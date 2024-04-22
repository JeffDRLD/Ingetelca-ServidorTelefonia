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

async function insertarDatosEnPlantilla(indiceLista, name1, link_id) {
  const datosAInsertar = indiceLista;

  if (!name1) {
    return;
  }
  if (!link_id) {
    return;
  }

  return XlsxPopulate.fromFileAsync(
    "./ProcesosCartograficos/Plantillas/REPARACION DE FO_plantilla.xlsx",
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
        no_installation: { row: 6, col: 3 },
        area: { row: 7, col: 3 },
        site: { row: 8, col: 3 },
        reparacion: { row: 9, col: 3 },
        tipo_fibra: { row: 10, col: 3 },
        cant_mufa: { row: 13, col: 3 },
        no_mufa: { row: 17, col: 2 },
        cap_mufa: { row: 17, col: 3 },
        lat: { row: 17, col: 4 },
        long: { row: 17, col: 5 },
        poste: { row: 17, col: 6 },
        sec_fo_inicial: { row: 17, col: 7 },
        sec_fo_final: { row: 17, col: 8 },
        init_reserv_inicial: { row: 17, col: 9 },
        init_id_poste: { row: 17, col: 10 },
        end_reserv_final: { row: 17, col: 11 },
        end_id_poste: { row: 17, col: 12 },
        B_no_mufa: { row: 18, col: 2 },
        B_cap_mufa: { row: 18, col: 3 },
        B_lat: { row: 18, col: 4 },
        B_long: { row: 18, col: 5 },
        B_poste: { row: 18, col: 6 },
        B_sec_fo_inicial: { row: 18, col: 7 },
        B_sec_fo_final: { row: 18, col: 8 },
        B_init_reserv_inicial: { row: 18, col: 9 },
        B_init_id_poste: { row: 18, col: 10 },
        B_end_reserv_final: { row: 18, col: 11 },
        B_end_id_poste: { row: 18, col: 12 },
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

      const filePath = `./ProcesosCartograficos/GuardarEXCEL/${name1}.xlsx`;

      await workbook.toFileAsync(filePath);

      // Subir el archivo a Google Drive en la carpeta especificada
      const fileMetadata = {
        name: name1 + ".xlsx",
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

module.exports = insertarDatosEnPlantilla;
