const { PDFDocument } = require('pdf-lib');
const { downloadFileByName } = require("./D_pdf");
const axios = require('axios');
const fs = require("fs");

async function sendRequest(nombre, semana) {
  const url = 'https://servidor-telefonia-appsheet-Juan-JoseJos418.replit.app/ProcesarRecibos';
  const data = { name: nombre, week: semana };

  try {
    const response = await axios.post(url, data, { responseType: 'arraybuffer' });
    console.log('PDF recibido con éxito.');
    return response.data; 
  } catch (error) {
    console.error('Error al enviar la petición:', error);
    return null; 
  }
}

async function descargarPDF(nombre, semana){
  try {
    const url = `https://servidor-telefonia-appsheet-Juan-JoseJos418.replit.app/ejemploPDF/${nombre}/${semana}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return { pdf: response.data, error: null }; 
  } catch (error) {
    console.error('Error al descargar PDF:', error.message);
    return { pdf: null, error: error.message }; 
  }
}

async function construirDocumentos(searchInput, res) {
  const nombre = searchInput.name.toUpperCase().replace(/ /g, '_');
  const semana = parseInt(searchInput.week, 10);
  const fileName = `${nombre}_${semana}.pdf`;

  try {
    const cajachicaResult = await descargarPDF(nombre, semana);
    const cajachicaBuffer = cajachicaResult.pdf;
    const facturasBuffer = await downloadFileByName(fileName);
    let recibosBuffer = await sendRequest(nombre, semana);

    if (recibosBuffer) {
      recibosBuffer = Buffer.from(recibosBuffer);
    }

    console.log('Tipo de cajachicaBuffer:', typeof cajachicaBuffer, 'Longitud:', cajachicaBuffer?.length);
    console.log('Tipo de facturasBuffer:', typeof facturasBuffer, 'Longitud:', facturasBuffer?.length);
    console.log('Tipo de recibosBuffer:', typeof recibosBuffer, 'Longitud:', recibosBuffer?.length);

    const mergedPdf = await PDFDocument.create();

    async function addPdfToMergedPdf(pdfBuffer) {
      if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
    }

    await addPdfToMergedPdf(cajachicaBuffer);
    await addPdfToMergedPdf(facturasBuffer);
    await addPdfToMergedPdf(recibosBuffer);

    const combinedPdfBuffer = await mergedPdf.save();
    fs.writeFileSync(fileName, combinedPdfBuffer);

    const bufferFinal = Buffer.from(combinedPdfBuffer);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(bufferFinal);

  } catch (error) {
    console.error('Error al combinar los PDFs:', error);
    res.status(500).send('Error al combinar los PDFs');
  }
}

module.exports = { construirDocumentos };
