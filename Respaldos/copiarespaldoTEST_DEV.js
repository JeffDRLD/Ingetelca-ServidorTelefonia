const fs = require("fs");
const PDFDocument = require("pdfkit");
const request = require("request");

const gastosEnero = [
  {
    fecha: "07/02/2024",
    nombreEstablecimiento: "Gimnasio",
    proyecto: "CORE",
    descripcionCompra: "Pago de membresía mensual",
    factura: "",
    recibo: "Q200.00 ",
    semana: "2",
    tecnico: "Samuel Hernandez",
    total: "Q700.00",
  },
  {
    fecha: "07/02/2024",
    nombreEstablecimiento: "Limpieza",
    proyecto: "CORE",
    descripcionCompra:
      "Compra de productos de limpieza para despensa familiar en la Ciudad de Guatemala",
    factura: "Q500.00",
    recibo: " ",
    semana: "2",
    tecnico: "Samuel Hernandez",
    total: "Q700.00",
  },
];

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    request({ url, encoding: null }, (err, res, body) => {
      if (err) return reject(err);

      if (
        res.headers["content-type"] &&
        res.headers["content-type"].includes("image")
      ) {
        fs.writeFile(dest, body, "binary", (err) => {
          if (err) return reject(err);
          resolve(dest);
        });
      } else {
        reject(new Error("Formato de imagen no válido"));
      }
    });
  });
};

function constructorCellWidths() {
  const fechaWidth = 55;
  const establecimientoWidth = 135;
  const proyectoWidth = 55;
  const descripcionWidth = 310;
  const facturaWidth = 55;
  const reciboWidth = 55;

  return [
    fechaWidth,
    establecimientoWidth,
    proyectoWidth,
    descripcionWidth,
    facturaWidth,
    reciboWidth,
  ];
}

const generatePDF = async (data) => {
  const doc = new PDFDocument({
    size: [660, 790],
    layout: "landscape",
    margin: 0,
  });

  const nombrePDF = data[0].caminoCSV.slice(0, -4) + ".pdf";
  const cellWidths = constructorCellWidths();
  const cellHeight = 13;

  const tableWidth = cellWidths.reduce((acc, width) => acc + width, 0);
  const marginLeft = (doc.page.width - tableWidth) / 2;
  const marginTop = (doc.page.height - (data.length + 2) * cellHeight) / 2;

  doc.fontSize(9).fillColor("red");

  const tableHeaders = [
    "Fecha",
    "Nombre del Establecimiento",
    "Proyecto",
    "Descripción de la Compra",
    "Factura",
    "Recibo",
  ];

  let currentLeft = marginLeft;
  tableHeaders.forEach((header, index) => {
    doc
      .rect(currentLeft, marginTop, cellWidths[index], cellHeight)
      .strokeColor("steelblue")
      .stroke();
    doc.text(header, currentLeft + 5, marginTop + 5, {
      bold: true,
      width: cellWidths[index] - 10,
      align: "center",
    });
    currentLeft += cellWidths[index];
  });

  const fechaEntregaHeader = "FECHA DE ENTREGA:";
  const semanaData = "Semana " + data[2].semana;
  const tecnicoData = data[2].tecnico;

  const imagePath = "imagen.jpg";
  const imageUrl =
    "https://drive.google.com/uc?id=12UdkiE0cZVTqclu4GT_cNFAtmJuxkwAQ";
  await downloadImage(imageUrl, imagePath);

  const imageWidth = 220;
  const imageHeight = 80;
  const imageMarginTop = marginTop - 120;

  doc.fontSize(9).fillColor("black");

  const fechaEntregaTexto = `${fechaEntregaHeader} ${semanaData}`;
  const tecnicoTexto = `${tecnicoData}`;
  const totalData = `Q.${data[2].total}`;

  const tecnicoX = marginLeft + doc.widthOfString(fechaEntregaTexto) + 15;
  doc.text(fechaEntregaTexto, marginLeft, imageMarginTop + imageHeight + 5, {
    width: doc.page.width / 2,
    align: "left",
  });

  doc.fontSize(8).fillColor("black");
  doc.moveTo(tecnicoX, imageMarginTop + imageHeight + 20).text(tecnicoTexto);

  doc.fontSize(7).fillColor("black");

  doc.image(imagePath, marginLeft, imageMarginTop, { width: 80 });

  data.forEach((gasto, rowIndex) => {
    const rowData = [
      gasto.fecha,
      gasto.nombreEstablecimiento,
      gasto.proyecto,
      gasto.descripcionCompra,
      gasto.factura,
      gasto.recibo,
    ];
    currentLeft = marginLeft;
    rowData.forEach((cell, colIndex) => {
      const totalDataRectX = marginLeft; // Ajustar según sea necesario
      let totalDataRectY;

      if (
        gasto.descripcionCompra &&
        gasto.descripcionCompra.startsWith("VERSATEC")
      ) {
        totalDataRectY = marginTop + (rowIndex + 5) * cellHeight;
      } else {
        totalDataRectY = marginTop + (rowIndex + 2) * cellHeight;
      }

      const totalDataRectWidth = tableWidth;
      const totalDataRectHeight = cellHeight;
      const numVersatecLines =
        data.filter(
          (gasto) =>
            gasto.descripcionCompra &&
            gasto.descripcionCompra.startsWith("VERSATEC"),
        ).length + 1;

      doc
        .rect(
          totalDataRectX,
          totalDataRectY,
          totalDataRectWidth,
          totalDataRectHeight,
        )
        .stroke();
      doc.fontSize(7).fillColor("black"); ///TAMAÑO Y COLOR DE LAS LINEAS VERSATEC
      doc.text(cell, currentLeft + 5, totalDataRectY + 5, {
        width: cellWidths[colIndex] - 10,
        align: ["Fecha", "Proyecto", "Recibo", "Factura"].includes(
          tableHeaders[colIndex],
        )
          ? "center"
          : "left",
      });

      if (colIndex === 5 && rowIndex === data.length - numVersatecLines) {
        const reciboHeaderX = currentLeft;
        const reciboHeaderY = totalDataRectY + totalDataRectHeight + cellHeight;

        const reciboRectX = currentLeft;
        const reciboRectY = reciboHeaderY - 5;
        const reciboRectWidth = cellWidths[colIndex];
        const reciboRectHeight = cellHeight;
        doc
          .rect(reciboRectX, reciboRectY, reciboRectWidth, reciboRectHeight)
          .stroke();
        doc.fontSize(10).fillColor("red"); ///TAMAÑO Y COLOR DEL TOTAL
        doc.text(totalData, reciboHeaderX, reciboHeaderY, {
          align: "center",
          width: cellWidths[colIndex],
          lineGap: 2,
        });
      }

      currentLeft += cellWidths[colIndex];
    });
  });

  doc.pipe(fs.createWriteStream(nombrePDF));
  doc.end();

  return nombrePDF;
};

// generatePDF(gastosEnero);

module.exports = generatePDF;
