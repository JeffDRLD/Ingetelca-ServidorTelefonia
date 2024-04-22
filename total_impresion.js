const fs = require("fs");
const PDFDocument = require("pdfkit");
const request = require("request");

async function createPDF() {
  const gastosEnero = [
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "BUC",
    },
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "CORE",
    },
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "FTTH",
    },
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "BUC",
    },
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "CORE",
    },
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "FTTH",
    },
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "BUC",
    },
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "CORE",
    },
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "FTTH",
    },
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "MOTORISTA",
    },
    {
      No: "",  
      tecnico: "Eduardo Cutzal",
      reintegro: "5000",
      observacion: " ",
      proyecto: "MOTORISTA",
    },
  ];

  // Agrupar datos por tipo de proyecto
  const proyectosAgrupados = {};
  gastosEnero.forEach((item) => {
    if (!proyectosAgrupados[item.proyecto]) {
      proyectosAgrupados[item.proyecto] = [];
    }
    proyectosAgrupados[item.proyecto].push(item);
  });

  const imagePath = "imagen.jpg";
  const imageUrl = "https://drive.google.com/uc?id=12UdkiE0cZVTqclu4GT_cNFAtmJuxkwAQ";
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
  doc.pipe(fs.createWriteStream("gastos_enero.pdf"));
  doc.fontSize(9).fillColor("black");

  for (const proyecto in proyectosAgrupados) {
    const proyectoData = proyectosAgrupados[proyecto];
    const tableMarginTop = marginTop + imageHeight + 90; // Adjust this value for spacing

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
    }

    const titleWithProyecto = `${title}   ${proyectoValue}`;

    doc.fontSize(14).fillColor("red").text(titleWithProyecto, {
      align: "center",
      margin: { top: tableMarginTop - 30, bottom: 10 }, // Adjust top margin as needed
    });

    // Define table headers
    doc.fontSize(10).fillColor("black");
    const tableHeaders = ["No.", "Nombre de Tecnico", "Monto a Reintegrar", "Observación", "Proyecto"];
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
      drawCellBold(header, currentLeft, tableMarginTop, cellWidths[index], cellHeight);
      currentLeft += cellWidths[index];
    });

    doc.fontSize(8).fillColor("black");

    // Function to draw a table cell with left justification
    const drawCellLeft = (text, x, y, width, height) => {
      doc.rect(x, y, width, height).strokeColor("black").stroke();
      doc.text(text, x + 5, y + 5, {
        width: width - 10,
        align: "left", // Justify text to the left
      });
    };

    // Iterate over the data and draw table rows with left justification
    proyectoData.forEach((rowData, rowIndex) => {
      currentLeft = marginLeft;
      const rowTop = tableMarginTop + 20 + rowIndex * cellHeight;

      // Add a new property "No" with the automatic row number
      rowData.No = rowIndex + 1;

      Object.values(rowData).forEach((cellData, cellIndex) => {
        drawCellLeft(cellData.toString(), currentLeft, rowTop, cellWidths[cellIndex], cellHeight);
        currentLeft += cellWidths[cellIndex];
      });
    });

    // Add a new page for the next proyecto type
    doc.addPage();
  }

  // Finalize and close the document
  doc.end();

  console.log("PDF creado con éxito.");
}

// Call the asynchronous function
createPDF();
