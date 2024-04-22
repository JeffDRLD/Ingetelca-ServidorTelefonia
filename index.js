const express = require("express");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const procesarDatosExcel = require("./ProcesosCartograficos/processData");
const { promisify } = require("util");
const { procesarCajaChica } = require("./ProcesosPrintWeek/ProcesoCentral");
const readFileAsync = promisify(fs.readFile);
const obtenerRecibos = require("./RecibosProcesos/ObtenerListaAplanada");
const CreacionPDFrecibo = require("./RecibosProcesos/ConvertPDF");
const getDatosColumnaName = require("./ProcesosPrintWeek/ObtenerNombres");
const generarYGuardarPDFCombinado = require("./ProcesosPrintWeek/PDFcombinar");
const { combineAndUploadPDFs } = require("./ImpresionDocs/U_pdf");
const { construirDocumentos } = require("./ImpresionDocs/CentroProceso");
const { readAndProcessDataNormal } = require("./ExtraerInfoNormal");
const { procesarNombres } = require("./ActualizarTot");
const { readAndProcessDataVersatec } = require("./ExtraerInfoVersatec");
const { obtenerPostePorId } = require("./BusquedaPostes/PeticionALaBaseD")
const { handleBottigoCore } = require('./ProcesosSimples/BotCore');
const { handleRecibirDatosCore } = require('./ProcesosSimples/DatosCore');
const { handleBottigo } = require('./ProcesosSimples/BotBuc');
const { handleRecibirDatos } = require('./ProcesosSimples/DatosBuc');
const { handleEjemploPDF } = require('./GeneracionCajaChica');
const app = express();
const port = 3000;
const multer = require("multer");
app.use(express.json({ limit: "150mb" }));
app.use(bodyParser.json());
app.use("/DiccionarioPDFs", express.static(path.join(__dirname, "/DiccionarioPDFs")),);
app.post("/recibirDatos", handleRecibirDatos);
app.post("/bottigo", handleBottigo);
app.post("/recibirDatoscore", handleRecibirDatosCore);
app.post("/bottigocore", handleBottigoCore);
app.get("/ejemploPDF/:tecnico/:semana", handleEjemploPDF);
app.post("/totales", (req, res) => {
  const datosRecibidos = req.body;

  // Aquí puedes procesar los datos como desees
  console.log("Datos recibidos:", datosRecibidos);

  res.status(200).json({ mensaje: "Datos recibidos con éxito" });
});

/// AQUI VA LA OPCION DE GENERAR PDF Y EXCEL EN .ZIP///
app.post("/ProcesoCajachica", async (req, res) => {
  const searchInput = parseInt(req.body.searchInput, 10);

  if (!isNaN(searchInput) && searchInput >= 1 && searchInput <= 52) {
    try {
      const zipBuffer = await procesarCajaChica(searchInput);
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Caja_Chica_Semana_${searchInput}.zip`,
      );
      res.send(zipBuffer);
    } catch (error) {
      console.error("Error al procesar la caja chica:", error);
      res.status(500).send("Error interno del servidor");
    }
  } else {
    res.status(400).send("Semana Incorrecta");
  }
});
app.get("/WiewPrint", (req, res) => {
  res.sendFile(path.join(__dirname, "ProcesosPrintWeek", "VistaDescarga.html"));
});
////FINNNNNNN

///// GENERACION DE KMZ Y EXCEL (REPORTES)
app.post("/ProcessKMZandEXCEL", async (req, res) => {
  procesarDatosExcel([req.body]);
  res.send("Datos procesados exitosamente");
});
/////FIN DEL PROCESO

////////////////Proceso caja chica 2 final
app.post("/ProcesoCajachicaFinal", async (req, res) => {
  const searchInput = parseInt(req.body.searchInput, 10);
  const datosColumnaName = await getDatosColumnaName("A", "TOTAL CAJA CHICA");
  const NombresPDF = datosColumnaName.map((nombre) =>
    nombre.toUpperCase().replace(/ /g, "_"),
  );

  const PDF = await generarYGuardarPDFCombinado(NombresPDF, searchInput);
  res.send(PDF);
});
app.get("/WiewPrintEnd", (req, res) => {
  res.sendFile(path.join(__dirname, "ProcesosPrintWeek", "VistaNuevaImpresion.html"));
});
///////////fin del 'proceso'

//////////////////Obtener nombres en post///////////////////////
app.post("/NameObtain", async (req, res) => {
  const datosColumnaName = await getDatosColumnaName("A", "TOTAL CAJA CHICA");
  res.send(datosColumnaName);
});
//////////////////END/////////////////////////////////

/////////////////HACER RECIBOS////////////////////////
app.post("/ProcesarRecibos", async (req, res) => {
  const searchInput = req.body;
  const nombre = searchInput.name.toUpperCase().replace(/ /g, "_");
  const semana = parseInt(searchInput.week, 10);

  try {
    const data = await readFileAsync(
      `./DiccionarioPDFs/SEMANA_${semana}/datos_${nombre}.csv`,
      "utf8",
    );
    const listasOrdenadas = await obtenerRecibos(data);
    console.log(listasOrdenadas);
    const PDFbuffer = await CreacionPDFrecibo(listasOrdenadas);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=gastosss_enero.pdf",
    );

    res.send(PDFbuffer);
  } catch (err) {
    console.error("Error al leer el archivo:", err);
    res.status(500).send("Error al generar el PDF"); // Enviar un mensaje de error al cliente
  }
});
app.get("/Recibos/obtener", (req, res) => {
  fs.readFile(
    path.join(__dirname, "RecibosProcesos/VistaRecibos.html"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error interno del servidor");
        return;
      }
      res.send(data);
    },
  );
});
///////////////////////END///////////////////////////

/* /////Procesamiento de documentacion completa///////////// */
const upload = multer({ dest: "uploads/" });
///////Este es el proceso de subida de documentacion///////////////
app.post("/Proceso/Guardado", upload.array("pdfFiles[]"), combineAndUploadPDFs);
app.post("/ConstructorDocs", async (req, res) => {
  await construirDocumentos(req.body, res);
});
//////////////Este es para subir facturas
app.get("/Vista/Subir/Facturas", (req, res) => {
  res.sendFile(
    path.join(__dirname, "ImpresionDocs", "ArchivosPrincipales.html"),
  );
});
/////////Este es el que va a apsheet
app.get("/Documentacion/Tecnicos", (req, res) => {
  res.sendFile(path.join(__dirname, "ImpresionDocs", "VistaDocsPDFs.html"));
});
/* //////////fin//////////////// */

///////////Aplicacion para busqueda de postes////////////////
/* proceso */
app.post('/SolicitudPoste', async (req, res) => {
    const { id } = req.body;
    const data = await obtenerPostePorId(id);
    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ message: 'Poste no encontrado' });
    }
});
/* vistahtml */
app.get("/Busqueda/poste", (req, res) => {
  res.sendFile(path.join(__dirname, 'BusquedaPostes', 'VistaPostes.html'));
});
////////////final de busqueda funcion/////////////////////

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  await readAndProcessDataNormal();
  await procesarNombres();
  await readAndProcessDataVersatec();
  cron.schedule(
     "0 0 * * *",  
    async () => {
      console.log(
        "Ejecutando tareas programadas a la medianoche hora de Guatemala",
      );
      await readAndProcessDataNormal();
       await procesarNombres();
      await readAndProcessDataVersatec();
    },
    {
      scheduled: true,
      timezone: "America/Guatemala",
    },
  );
});
