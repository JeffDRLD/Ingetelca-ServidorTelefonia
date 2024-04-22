const { google } = require("googleapis");
const fs = require("fs");
const { DOMImplementation, XMLSerializer } = require("xmldom");
const JSZip = require("jszip");
const BUC = "17_DIsbnpYnCMFShm-iAI4zhwBGPHvtaB";
const CORE = "14YsQCgyJAmZYkhUICc2BnJXFWyxFIywS";
const RED_ADQUIRIDA = "1L7nT9LxWos20rZ9YEULIC8BqSWZDiGEI";

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

function construirKMZ(data) {
  
  let link_id;

  switch (data.tecnologia) {
    case "BUC":
      link_id = BUC;
      break;
    case "CORE":
      link_id = CORE;
      break;
    case "RED ADQUIRIDA":
      link_id = RED_ADQUIRIDA;
      break;
  }

  const impl = new DOMImplementation();
  const doc = impl.createDocument(null, "kml", null);
  const kml = doc.documentElement;
  const document = doc.createElement("Document");
  kml.appendChild(document);
  // Crear una carpeta
  const folder = doc.createElement("Folder");
  const folderName = doc.createElement("name");
  folderName.textContent = `TTK_${data.tkk_num}_${data.tkk_name}_${data.tkk_date_final}`;
  folder.appendChild(folderName);
  document.appendChild(folder);

  let coordinatesArray = [];

  function invertColor(hex) {
    return hex.slice(4, 6) + hex.slice(2, 4) + hex.slice(0, 2);
  }

  let fibra = {
    144: { color: invertColor("aaaa00"), ancho: "4" },
    90: { color: invertColor("ffaaff"), ancho: "4" },
    48: { color: invertColor("00ff7f"), ancho: "4" },
    24: { color: invertColor("ffaa00"), ancho: "3" },
    12: { color: invertColor("0000ff"), ancho: "3" },
    8: { color: invertColor("aa00ff"), ancho: "3" },
    GPON: { color: invertColor("0055ff"), ancho: "3" },
  };

  // Ahora puedes acceder a las propiedades de color y ancho de esta manera:

  let tipo_fibra = data.tipo_fibra;
  let colors = "ff" + fibra[tipo_fibra].color;
  let ancho = fibra[tipo_fibra].ancho;

  data.data_kmz.data.forEach((data) => {
    const placemark = doc.createElement("Placemark");

    // Crear el elemento Style
    const style = doc.createElement("Style");
    const labelStyle = doc.createElement("LabelStyle");
    const iconStyle = doc.createElement("IconStyle");
    const color = doc.createElement("color");
    color.textContent = colors;
    labelStyle.appendChild(color);
    iconStyle.appendChild(color.cloneNode(true));
    style.appendChild(labelStyle);
    style.appendChild(iconStyle);
    placemark.appendChild(style);

    const description = doc.createElement("description");
    description.textContent = `POSTE: ${data.mufa_name}\nLATITUD: ${data.lat}\nLONGITUD: ${data.lng}`;
    placemark.appendChild(description);

    const name = doc.createElement("name");
    name.textContent = `${data.tkk_num}`;
    placemark.appendChild(name);

    const point = doc.createElement("Point");
    const coordinates = doc.createElement("coordinates");
    coordinates.textContent = `${data.lng},${data.lat}`;
    point.appendChild(coordinates);
    placemark.appendChild(point);

    folder.appendChild(placemark);

    // Agregar las coordenadas al array
    coordinatesArray.push(`${data.lng},${data.lat}`);
  });

  // Crear un Placemark para la línea
  const linePlacemark = doc.createElement("Placemark");

  // Crear el elemento Style para la línea
  const lineStyle = doc.createElement("Style");
  const lineStyleElement = doc.createElement("LineStyle");
  const color = doc.createElement("color");
  color.textContent = colors; // Este es el color rojo en formato ARGB
  const lineWidth = doc.createElement("width");
  lineWidth.textContent = ancho;
  lineStyleElement.appendChild(lineWidth);
  lineStyleElement.appendChild(color);
  lineStyle.appendChild(lineStyleElement);
  linePlacemark.appendChild(lineStyle);

  // Aquí agregamos la descripción a la línea
  const description = doc.createElement("description");
  description.textContent = `MATERIAL UTILIZADO:\n\n${data.materiales}`;
  linePlacemark.appendChild(description);

  const name = doc.createElement("name");
  name.textContent = `TTK_${data.tkk_num}_${data.tkk_name}_${data.tkk_date_final}`;
  linePlacemark.appendChild(name);

  const lineString = doc.createElement("LineString");
  const coordinates = doc.createElement("coordinates");
  coordinates.textContent = coordinatesArray.join(" ");
  lineString.appendChild(coordinates);
  linePlacemark.appendChild(lineString);
  folder.appendChild(linePlacemark);

  const serializer = new XMLSerializer();
  const kmlString = serializer.serializeToString(doc);

  const zip = new JSZip();
  zip.file("doc.kml", kmlString);
  zip.generateAsync({ type: "nodebuffer" }).then((content) => {
    const filePath = `./ProcesosCartograficos/GuardarKMZ/TTK_${data.tkk_num}_${data.tkk_name}_${data.tkk_date_final}.kmz`;
    fs.writeFileSync(filePath, content);

    function guardarEnDrive(filePath) {
      const fileMetadata = {
        name: filePath.split("/").pop(), // Obtiene el nombre del archivo sin la ruta
        parents: [link_id], // ID de la carpeta de destino en tu Google Drive
      };
      const media = {
        mimeType: "application/vnd.google-earth.kmz",
        body: fs.createReadStream(filePath),
      };
      drive.files.create(
        {
          resource: fileMetadata,
          media: media,
          fields: "id",
        },
        function (err, file) {
          if (err) {
            // Manejar el error
            console.error(err);
          } else {
            console.log("Archivo KMZ guardado en Google Drive con éxito.");
            fs.unlinkSync(filePath);
          }
        },
      );
    }

    guardarEnDrive(filePath);
  });
}
exports.construirKMZ = construirKMZ;
