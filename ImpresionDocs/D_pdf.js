const { google } = require('googleapis');
const path = require('path');
const { PDFDocument, degrees } = require('pdf-lib');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, './key.json'), // Ruta al archivo JSON de la cuenta de servicio
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function downloadFileByName(fileName) {
    try {
        // Buscar el archivo por nombre en la carpeta específica
        const response = await drive.files.list({
            q: `name = '${fileName}' and '1Eat7dZKYCEsSOzA2TQRZxztXEJdqjSPD' in parents`,
            fields: 'files(id, name)',
        });

        if (response.data.files.length === 0) {
            console.log('No se encontró el archivo.');
            return null;
        }

        const fileId = response.data.files[0].id;
        const buffer = await new Promise((resolve, reject) => {
            drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                const chunks = [];
                res.data
                    .on('data', chunk => chunks.push(chunk))
                    .on('end', () => resolve(Buffer.concat(chunks)))
                    .on('error', reject);
            });
        });

        console.log('Archivo descargado con éxito');
        const pdfDoc = await PDFDocument.load(buffer);
        const pages = pdfDoc.getPages();

        pages.forEach(page => {
            const { width, height } = page.getSize();
/*             // Cambia la orientación de la página a horizontal
            page.setSize(height, width);
 */
            // Gira el contenido de la página 90 grados hacia la derecha
            page.setRotation(degrees(90));
            // Traslada el contenido para ajustarlo a la nueva orientación
            page.translateContent(0, 20);
        });

        const adjustedPdfBuffer = await pdfDoc.save();
        const filePath = path.join(__dirname, `adjusted_${fileName}`);
        fs.writeFileSync(filePath, adjustedPdfBuffer);
        console.log(`PDF con contenido ajustado guardado en: ${filePath}`);
      
        const pdfBuffer = buffer.from(adjustedPdfBuffer);
        return pdfBuffer;
    } catch (error) {
        console.error('Error al descargar el archivo:', error);
        return null;
    }
}

module.exports = { downloadFileByName };
