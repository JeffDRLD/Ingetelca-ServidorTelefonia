const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
const generatePDF = require("./GenerarPDF");

function handleEjemploPDF(req, res) {
  const tecnico = req.params.tecnico;
  const semana = req.params.semana;

  const caminoCSV = `./DiccionarioPDFs/SEMANA_${semana}/datos_${tecnico}.csv`;

  if (!fs.existsSync(path.join(__dirname, caminoCSV))) {
    console.log(`El archivo ${caminoCSV} no existe`);
    res.status(400).send();
    return;
  }

  const data = [];
  fs.createReadStream(path.join(__dirname, caminoCSV))
    .pipe(csv())
    .on("data", (row) => {
      data.push(row);
    })
    .on("end", () => {
      console.log(data);
      const nuevosDatos = data.map(row => ({ caminoCSV, ...row }));

      const baseURL = "https://servidor-telefonia-appsheet-juan-josejos418.replit.app";

      generatePDF(nuevosDatos)
        .then(caminoPDF => {
          console.log("PDF generado con éxito");
          const urlFinal = `${baseURL}${caminoPDF.slice(1, -1)}f`;
          axios.get(urlFinal, { responseType: "stream" })
            .then(response => {
              const nombreArchivoDescargado = `${tecnico}_Semana_${semana}.pdf`;
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader("Content-Disposition", `inline; filename="${nombreArchivoDescargado}"`);
              response.data.pipe(res);
            })
            .catch(err => {
              console.error("Error al descargar el archivo:", err);
              res.status(500).send("Error al descargar el archivo");
            });
        })
        .catch(err => {
          console.error("Error al generar el PDF:", err);
          res.status(500).send("Error al generar el PDF");
        });
    });
}

module.exports = { handleEjemploPDF };
