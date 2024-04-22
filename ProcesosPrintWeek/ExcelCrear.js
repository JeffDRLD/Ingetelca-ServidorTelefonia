const ExcelJS = require('exceljs');
const fs = require('fs');
const request = require('request');

async function downloadImage(url, path) {
  return new Promise((resolve, reject) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('finish', resolve)
      .on('error', reject);
  });
}

async function createExcel(gastosEnero, searchInput, date, [totales], excelName) {
  // Agrupar datos por tipo de proyecto
  const proyectosAgrupados = {};
  gastosEnero.forEach((item) => {
    if (!proyectosAgrupados[item.proyecto]) {
      proyectosAgrupados[item.proyecto] = [];
    }
    proyectosAgrupados[item.proyecto].push(item);
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Your Name';
  workbook.created = new Date();

  // Crear dos hojas: una para proyectos CORE NOR y CORE SUR, y otra para el resto
  const sheetOtros = workbook.addWorksheet('CENTRAL');
  const sheetCore = workbook.addWorksheet('RURAL');


  // Configurar estilos comunes
  const borderStyle = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  const headerFillStyle = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFCCCCCC' }
  };

  // Descargar imagen
  const imageUrl = "https://drive.google.com/uc?id=12UdkiE0cZVTqclu4GT_cNFAtmJuxkwAQ";
  const imagePath = "imagen.jpg";
  await downloadImage(imageUrl, imagePath);

  // Función para agregar proyectos a una hoja específica
  const agregarProyectosAHoja = (hoja, proyectos) => {
    let currentRow = 1;
    for (const proyecto in proyectos) {
      const proyectoData = proyectos[proyecto];

      // Agregar imagen
      const imageId = workbook.addImage({
        filename: imagePath,
        extension: 'jpeg',
      });
      hoja.addImage(imageId, {
        tl: { col: 4.0, row: currentRow },
        ext: { width: 170, height: 100 }
      });
      currentRow += 2;

      // Agregar encabezados
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
      } else if (proyectoValue === "CORE NOR") {
        proyectoValue = "RURAL NOR-ORIENTE (CORE)";
      } else if (proyectoValue === "CORE SUR") {
        proyectoValue = "RURAL SUR-ORIENTE (CORE)";
      }

      const titleWithProyecto = `${title}   ${proyectoValue}`;
      hoja.getRow(currentRow).values = [titleWithProyecto];
      hoja.getRow(currentRow).getCell(1).font = {
        size: 13,
        color: { argb: 'FFFF0000' } // Red color
      };
      currentRow++;

      let supervisor = proyecto;

      if (supervisor === "CORE") {
        supervisor = "Boris Morales";
      } else if (supervisor.includes("BUC")) {
        supervisor = "Erick Peralta";
      } else if (supervisor === "FTTH") {
        supervisor = "Carlos Jimenez";
      } else if (supervisor === "MOTORISTA") {
        supervisor = "Hugo Hanser";
      } else if (supervisor === "CORE NOR") {
        supervisor = "Juan Carlos Garcia";
      } else if (supervisor === "CORE SUR") {
        supervisor = "Deniz Herrera";
      }

      hoja.getRow(currentRow).values = [`Supervisor: ${supervisor}`];
      currentRow++;
      hoja.getRow(currentRow).values = [`Fecha: ${date}`];
      currentRow++;
      hoja.getRow(currentRow).values = [`Semana: ${searchInput}`];
      currentRow += 2;

      // Agregar filas de datos
      hoja.getRow(currentRow).values = ['No.', 'Nombre de Tecnico', 'Monto a Reintegrar', 'Observación', 'Proyecto'];
      hoja.getRow(currentRow).eachCell({ includeEmpty: true }, (cell) => {
        cell.border = borderStyle;
        cell.fill = headerFillStyle;
      });
      currentRow++;

      proyectoData.forEach((item, index) => {
        hoja.getRow(currentRow).values = [
          index + 1,
          item.tecnico,
          item.reintegro,
          item.observacion,
          item.proyecto,
        ];
        hoja.getRow(currentRow).eachCell({ includeEmpty: true }, (cell) => {
          cell.border = borderStyle;
        });
        currentRow++;
      });

      // Agregar fila total
      hoja.getRow(currentRow).values = ['', 'Total:', totales[proyecto], '', ''];
      hoja.getRow(currentRow).eachCell({ includeEmpty: true }, (cell) => {
        cell.border = borderStyle;
        // Aplicar tamaño de fuente y negrita
        cell.font = {
          size: 12,
          bold: true
        };
      });
      currentRow += 4;


      // Configurar anchos de columnas
      hoja.columns = [
        { key: 'no', width: 10 },
        { key: 'tecnico', width: 30 },
        { key: 'monto', width: 20 },
        { key: 'observacion', width: 30 },
        { key: 'proyecto', width: 20 },
      ];
    }
  };

  // Separar proyectos en dos grupos
  const proyectosCore = {};
  const otrosProyectos = {};
  for (const proyecto in proyectosAgrupados) {
    if (proyecto === 'CORE NOR' || proyecto === 'CORE SUR') {
      proyectosCore[proyecto] = proyectosAgrupados[proyecto];
    } else {
      otrosProyectos[proyecto] = proyectosAgrupados[proyecto];
    }
  }

  // Agregar proyectos a las hojas correspondientes
  agregarProyectosAHoja(sheetOtros, otrosProyectos);
  agregarProyectosAHoja(sheetCore, proyectosCore);


  await workbook.xlsx.writeFile(excelName);


  // Crear un buffer de memoria para almacenar el Excel
  const excelBuffer = await workbook.xlsx.writeBuffer();

  return excelBuffer;
}

module.exports = { createExcel };
