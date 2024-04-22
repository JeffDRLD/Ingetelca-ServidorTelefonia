const { PDFDocument } = require("pdf-lib");
const axios = require("axios");
const fs = require("fs");

// Función para descargar un archivo PDF dado un nombre y una semana
const descargarPDF = async (nombre, semana) => {
  try {
    const url = `https://servidor-telefonia-appsheet-Juan-JoseJos418.replit.app/ejemploPDF/${nombre}/${semana}`;
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return { pdf: response.data, error: null }; // Devolver el PDF y un error nulo
  } catch (error) {
    return { pdf: null, error: error.message }; // Devolver null para el PDF y el mensaje de error
  }
};

// Función para combinar varios archivos PDF en uno solo
const combinarPDFs = async (pdfs) => {
  const pdfDoc = await PDFDocument.create();
  for (const pdfBytes of pdfs) {
    try {
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => pdfDoc.addPage(page));
    } catch (error) {
    }
  }
  return pdfDoc.save();
};


// Función para generar y guardar el PDF combinado
const generarYGuardarPDFCombinado = async (nombres, semana) => {
  const pdfs = [];
  const errores = [];
  for (const nombre of nombres) {
    if (nombre !== "") {
      const { pdf, error } = await descargarPDF(nombre, semana);
      if (pdf) {
        pdfs.push(pdf);
      } else {
        errores.push(error);
      }
    }
  }

  if (pdfs.length > 0) {
    const pdfFinal = await combinarPDFs(pdfs);
    const nombreArchivo = `pdf-final-semana-${semana}.pdf`;
    fs.writeFileSync(nombreArchivo, pdfFinal);
    console.log(`Archivos PDF combinados y guardados en ${nombreArchivo}`);

    // Leer el PDF combinado y guardarlo en un buffer de memoria
    const pdfBuffer = Buffer.from(pdfFinal);

    // Devolver el buffer de memoria como respuesta
    return pdfBuffer;
  }

  if (errores.length > 0) {
  }

  // Si no se combinaron PDFs, devolver null
  return null;
};



module.exports = generarYGuardarPDFCombinado;
