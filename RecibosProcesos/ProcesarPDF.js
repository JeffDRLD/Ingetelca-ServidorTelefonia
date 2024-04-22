const { PDFDocument } = require("pdf-lib");
const fs = require("fs").promises;
const path = require("path");

async function crearPDFConCuatroEnUno(inputPath, outputPath) {
  const pdfOriginalBytes = await fs.readFile(inputPath);
  const pdfOriginal = await PDFDocument.load(pdfOriginalBytes);

  const pdfNuevo = await PDFDocument.create();
  const [pageWidth, pageHeight] = [841.89, 595.28]; // A4 en horizontal

  const numPages = pdfOriginal.getPageCount();
  for (let i = 0; i < numPages; i += 4) {
    const pagina = pdfNuevo.addPage([pageWidth, pageHeight]); // Tamaño correcto para A4 horizontal

    for (let j = 0; j < 4 && (i + j) < numPages; j++) {
      const [paginaImportada] = await pdfNuevo.embedPdf(pdfOriginalBytes, [i + j]);

      const quarterWidth = pageWidth / 2;
      const quarterHeight = pageHeight / 2;
      const xPosition = quarterWidth * (j % 2);
      const yPosition = (j < 2) ? quarterHeight : 0; // Asegura que las páginas se coloquen en la mitad superior e inferior correctamente

      pagina.drawPage(paginaImportada, {
        width: quarterWidth,
        height: quarterHeight,
        x: xPosition,
        y: yPosition,
      });
    }
  }

  const pdfBytes = await pdfNuevo.save();
  await fs.writeFile(outputPath, pdfBytes);
}


module.exports = crearPDFConCuatroEnUno;
