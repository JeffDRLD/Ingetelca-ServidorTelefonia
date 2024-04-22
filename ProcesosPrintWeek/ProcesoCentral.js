const archiver = require('archiver');
const getDatosColumnaWeek = require("./ObtainWeek");
const getDatosColumnaProyect = require("./ObtenerProyecto");
const getDatosColumnaName = require("./ObtenerNombres");
const { combinarTablas } = require("./CombinarTabla");
const { createPDF } = require("./CrearPDF");
const obtenerFechaPorSemana = require("./DateObtain");
const {
  sumarReintegrosPorProyecto,
} = require("./SumaReintegro");
const { promisify } = require('util');
const { createExcel } = require("./ExcelCrear");

async function procesarCajaChica(searchInput) {
  const date = obtenerFechaPorSemana(searchInput, 2024);
  const { datos, comentarios } = await getDatosColumnaWeek(searchInput + 2, "TOTAL CAJA CHICA");
  const datosColumnaProyect = await getDatosColumnaProyect("B", "TOTAL CAJA CHICA");
  const datosColumnaName = await getDatosColumnaName("A", "TOTAL CAJA CHICA");

  const gastosEnero = combinarTablas(datos, comentarios, datosColumnaProyect, datosColumnaName);
  const totales = sumarReintegrosPorProyecto(gastosEnero);
  const excelBuffer = await createExcel(gastosEnero, searchInput, date, [totales], "Excel.xlsx");
  const pdfBuffer = await createPDF(gastosEnero, searchInput, date, [totales]);

  const zipBuffer = await new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const buffers = [];
    archive.on('data', data => buffers.push(data));
    archive.on('end', () => resolve(Buffer.concat(buffers)));
    archive.on('error', reject);

    archive.append(excelBuffer, { name: `CAJA_CHICA_SEMANA_${searchInput}.xlsx` });
    archive.append(pdfBuffer, { name: `CAJA_CHICA_SEMANA_${searchInput}.pdf` });
    archive.finalize();
  });

  return zipBuffer;
}
module.exports = { procesarCajaChica };