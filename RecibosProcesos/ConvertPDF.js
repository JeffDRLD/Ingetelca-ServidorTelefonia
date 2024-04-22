const { PDFDocument } = require("pdf-lib");
const fs = require("fs").promises;
const path = require("path");
const crearPDFConCuatroEnUno = require("./ProcesarPDF");

async function CreacionPDFrecibo(listaAplanada) {
  const pdfFinal = await PDFDocument.create();
  const font = await pdfFinal.embedFont('Helvetica');

  const backgroundImageBytes = await fs.readFile('./RecibosProcesos/ReciboPL.PNG');
  const backgroundImage = await pdfFinal.embedPng(backgroundImageBytes);

  const fontSize = 21; // Tamaño de la fuente

  for (const objeto of listaAplanada) {
    const pagina = pdfFinal.addPage([841.89, 595.28]); // Tamaño de la página horizontal

    // Agrega la imagen de fondo
    pagina.drawImage(backgroundImage, {
      x: 0,
      y: 0,
      width: 831.89,
      height: 585.28,
      opacity: 1, // Opacidad de la imagen
    });

    // Ingresa los datos en la página con el tamaño de la fuente variable
    const { width, height } = pagina.getSize();
    const textWidth = font.widthOfTextAtSize(objeto.FechaenLetras, fontSize);
    const center = (width - textWidth - 90) / 2;

    // Ingresa los datos en la página con el tamaño de la fuente variable
    pagina.drawText(objeto.Fecha, { x: 345, y: height - 177, font, size: fontSize });
    pagina.drawText(objeto.Recibo, { x: 605, y: height - 177, font, size: fontSize });
    pagina.drawText(objeto.FechaenLetras, { x: center, y: height - 442, font, size: fontSize });
    pagina.drawText(objeto.DescripcionCompra, { x: 210, y: height - 337, font, size: fontSize });
    pagina.drawText(objeto.CantidadenLetras, { x: 210, y: height - 302, font, size: fontSize });
    pagina.drawText(objeto.Tecnico, { x: 510, y: height - 498, font, size: 16 });
  }

  // Guardar el archivo localmente
  const outputPath = path.join(__dirname, 'pdfFinal.pdf');
  await fs.writeFile(outputPath, await pdfFinal.save());
  const outputPathProcess = path.join(__dirname, 'pdfFinalProcesado.pdf');
  await crearPDFConCuatroEnUno(outputPath, outputPathProcess);
  // Leer el archivo guardado y transformarlo a buffer
  const pdfBuffer = await fs.readFile(outputPathProcess);

  return pdfBuffer;
}



module.exports = CreacionPDFrecibo;
