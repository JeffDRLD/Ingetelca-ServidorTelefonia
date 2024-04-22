const { google } = require('googleapis');
const archiver = require('archiver'); // Añade esta línea para usar archiver
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const upload = multer({ dest: 'uploads/' });
const path = require("path");
const fs = require("fs");

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, './key.json'), // Ruta al archivo JSON de la cuenta de servicio
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function combineAndUploadPDFs(req, res) {
    const mergedPdf = await PDFDocument.create();
    const name = req.body.name;
    const week = req.body.week;
    const fileName = `${name.toUpperCase().replace(/ /g, '_')}_${week}.pdf`;

    for (const file of req.files) {
        const pdfBytes = fs.readFileSync(file.path);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
        fs.unlinkSync(file.path); // Elimina el archivo cargado después de procesarlo
    }

    const mergedPdfBytes = await mergedPdf.save();
    const localFilePath = path.join(__dirname, fileName);
    fs.writeFileSync(localFilePath, mergedPdfBytes); // Guarda el archivo localmente

    // Buscar si el archivo ya existe en Google Drive
    const existingFiles = await drive.files.list({
        q: `name = '${fileName}' and trashed = false and parents in '1Eat7dZKYCEsSOzA2TQRZxztXEJdqjSPD'`,
        fields: 'files(id, name)',
    });

    const fileMetadata = {
        name: fileName,
        parents: ['1Eat7dZKYCEsSOzA2TQRZxztXEJdqjSPD'], // ID de la carpeta en Drive
    };
    const media = {
        mimeType: 'application/pdf',
        body: fs.createReadStream(localFilePath),
    };

    try {
        let response;
        if (existingFiles.data.files.length > 0) {
            // Actualizar el archivo existente
            const fileId = existingFiles.data.files[0].id;
            response = await drive.files.update({
                fileId: fileId,
                media: media,
            });
            console.log(`Archivo existente actualizado, ID: ${fileId}`);
        } else {
            // Crear un nuevo archivo
            response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });
            console.log(`Archivo subido con éxito, ID: ${response.data.id}`);
        }
        fs.unlinkSync(localFilePath); // Elimina el archivo local después de subirlo
        res.send(`PDFs combinados y guardados con éxito en Google Drive como ${fileName}`);
    } catch (error) {
        console.error('Error al subir el archivo a Google Drive:', error);
        fs.unlinkSync(localFilePath); // Elimina el archivo local en caso de error
        res.status(500).send('Error al guardar el archivo en Google Drive');
    }
}

module.exports = { combineAndUploadPDFs };
