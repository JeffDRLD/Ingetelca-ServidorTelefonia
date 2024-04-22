const fs = require("fs");
const PDFDocument = require("pdfkit");
const request = require("request");

async function createPDF(gastosEnero, searchInput, date, [totales], pdfName) {
  // Agrupar datos por tipo de proyecto
  const proyectosAgrupados = {};
  gastosEnero.forEach((item) => {
    if (!proyectosAgrupados[item.proyecto]) {
      proyectosAgrupados[item.proyecto] = [];
    }
    proyectosAgrupados[item.proyecto].push(item);
  });

  const imagePath = "imagen.jpg";
  const imageUrl =
    "https://drive.google.com/uc?id=12UdkiE0cZVTqclu4GT_cNFAtmJuxkwAQ";
  await downloadImage(imageUrl, imagePath);

  const imageWidth = 220;
  const imageHeight = 80;
  const marginTop = 20; // Define marginTop here

  // Function to download the image
  function downloadImage(url, path) {
    return new Promise((resolve, reject) => {
      request(url)
        .pipe(fs.createWriteStream(path))
        .on("finish", resolve)
        .on("error", reject);
    });
  }

  const doc = new PDFDocument();
  doc.fontSize(9).fillColor("black");

  for (const proyecto in proyectosAgrupados) {
    const proyectoData = proyectosAgrupados[proyecto];
    const tableMarginTop = marginTop + imageHeight + 140; // Adjust this value for spacing

    // Add the image to the document in the top-left corner with some space below it
    doc.image(imagePath, {
      fit: [imageWidth, imageHeight],
      align: "left",
      valign: "top",
      margin: { top: marginTop, bottom: 20 },
    });

    const title = "REINTEGRO CAJA MENOR PERSONAL MANTENIMIENTO";
    let proyectoValue = proyecto;

    if (proyectoValue === "CORE") {
      proyectoValue = "METROPOLITANA (CORE)";
    } else if (proyectoValue.includes("BUC")) {
      proyectoValue = "CORPORATIVO (BUC)";
    } else if (proyectoValue === "FTTH") {
      proyectoValue = "PREVENTIVO (FTTH)";
    } else if (proyectoValue === "MOTORISTA") {
      proyectoValue = "SCOUT Y RESTAURADORES (CORE)";
    } else if (proyectoValue === "CORE NOR") {
      proyectoValue = "RURAL NOR-ORIENTE (CORE)";
    } else if (proyectoValue === "CORE SUR") {
      proyectoValue = "RURAL SUR-ORIENTE (CORE)";
    }

    const titleWithProyecto = `${title}   ${proyectoValue}`;

    doc
      .fontSize(14)
      .fillColor("red")
      .text(titleWithProyecto, {
        align: "center",
        margin: { top: tableMarginTop - 30, bottom: 60 }, // Adjust top margin as needed
      });

    let supervisor = proyecto;

    if (supervisor === "CORE") {
      supervisor = "Boris Morales";
    } else if (supervisor.includes("BUC")) {
      supervisor = "Erick Peralta";
    } else if (supervisor === "FTTH") {
      supervisor = "Carlos Jimenez";
    } else if (supervisor === "MOTORISTA") {
      supervisor = "Hugo Hanser";
    } else if (supervisor === "CORE NOR") {
      supervisor = "Juan Carlos Garcia";
    } else if (supervisor === "CORE SUR") {
      supervisor = "Deniz Herrera";
    }

    doc
      .fontSize(12)
      .fillColor("black")
      .text(" ", {
        align: "left",
        margin: { top: 70, bottom: 10 }, // Ajusta el margen superior e inferior según sea necesario
      });

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Supervisor: ${supervisor}`, {
        align: "left",
        margin: { top: 70, bottom: 10 }, // Ajusta el margen superior e inferior según sea necesario
      });

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Fecha: ${date}`, {
        align: "left",
        margin: { top: 70, bottom: 10 }, // Ajusta el margen superior e inferior según sea necesario
      });

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Semana: ${searchInput}`, {
        align: "left",
        margin: { top: 70, bottom: 10 }, // Ajusta el margen superior e inferior según sea necesario
      });

    // Calculate total
    let total = proyecto;
    let salto = 0;
    if (total === "CORE") {
      total = totales["CORE"];
      salto = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
    } else if (total.includes("BUC")) {
      total = totales["BUC"];
      salto = "\n\n\n\n\n\n\n\n\n\n";
    } else if (total === "FTTH") {
      total = totales["FTTH"];
      salto = "\n\n\n\n\n\n\n";
    } else if (total === "MOTORISTA") {
      total = totales["MOTORISTA"];
      salto = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
    } else if (total === "CORE NOR") {
      total = totales["CORE NOR"];
      salto = "\n\n\n\n\n\n\n\n\n\n\n";
    } else if (total === "CORE SUR") {
      total = totales["CORE SUR"];
      salto = "\n\n\n\n\n\n\n\n\n";
    }


    doc
      .fontSize(12)
      .fillColor("black")
      .text(salto, {
        align: "center",
        margin: { top: 70, bottom: 10 }, // Ajusta el margen superior e inferior según sea necesario
      });

    doc.text(`Total: Q.${total}`, {
      align: "center",
      lineGap: 10,
      margin: { top: 5, bottom: 10 },
    });

    // Define table headers
    doc.fontSize(10).fillColor("black");
    const tableHeaders = [
      "No.",
      "Nombre de Tecnico",
      "Monto a Reintegrar",
      "Observación",
      "Proyecto",
    ];
    const cellWidths = [40, 150, 110, 100, 60];
    const cellHeight = 15;

    // Calculate total table width
    const tableWidth = cellWidths.reduce((acc, width) => acc + width, 0);

    // Calculate left margin to center the table horizontally
    const marginLeft = (doc.page.width - tableWidth) / 2;

    // Function to draw a table cell with bold text
    const drawCellBold = (text, x, y, width, height) => {
      doc.rect(x, y, width, height).strokeColor("black").stroke();
      doc.text(text, x + 5, y + 5, {
        width: width - 10,
        align: "center",
        bold: true, // Make the text bold
      });
    };

    // Draw table headers with bold text
    let currentLeft = marginLeft;
    tableHeaders.forEach((header, index) => {
      drawCellBold(
        header,
        currentLeft,
        tableMarginTop,
        cellWidths[index],
        cellHeight,
      );
      currentLeft += cellWidths[index];
    });

    doc.fontSize(8).fillColor("black");

    // Function to draw a table cell with left justification
    const drawCellLeft = (text, x, y, width, height, fontSize = 8) => {
      doc.fontSize(fontSize).rect(x, y, width, height).strokeColor("black").stroke();
      doc.text(text, x + 5, y + 5, {
        width: width - 10,
        align: "left",
      });
    };


    // Iterate over the data and draw table rows with left justification

    
    proyectoData.forEach((rowData, rowIndex) => {
      currentLeft = marginLeft;
      const rowTop = tableMarginTop + 20 + rowIndex * cellHeight;

      rowData.No = rowIndex + 1; // Agregar el número de fila

      Object.values(rowData).forEach((cellData, cellIndex) => {
        const isObservationColumn = cellIndex === 3; // Verificar si es la columna de Observación
        const isFourthColumn = cellIndex === 4; // Verificar si es la cuarta columna
        let cellFontSize;

        if (isObservationColumn) {
          cellFontSize = 4.6;
        } else if (isFourthColumn) {
          cellFontSize = 7;
        } else {
          cellFontSize = 10;
        }

        drawCellLeft(
          cellData.toString(),
          currentLeft,
          rowTop,
          cellWidths[cellIndex],
          cellHeight,
          cellFontSize, // Pasar el tamaño de fuente
        );
        currentLeft += cellWidths[cellIndex];
      });
    });



    // Add a new page for the next proyecto type
    doc.addPage();
  }

  
  // Crear un buffer de memoria para almacenar el PDF
  const pdfBuffer = await new Promise((resolve, reject) => {
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.end();
  });

  return pdfBuffer;
}

module.exports = { createPDF };
