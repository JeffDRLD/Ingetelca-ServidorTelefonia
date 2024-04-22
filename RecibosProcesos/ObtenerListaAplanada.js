
function fechaEnLetras(fecha) {
  // Diccionarios con las equivalencias
  const meses = {
      1: "enero", 2: "febrero", 3: "marzo", 4: "abril",
      5: "mayo", 6: "junio", 7: "julio", 8: "agosto",
      9: "septiembre", 10: "octubre", 11: "noviembre", 12: "diciembre"
  };
  const dias = {
      1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
      6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
      11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince",
      16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve",
      20: "veinte", 21: "veintiuno", 22: "veintidós", 23: "veintitrés",
      24: "veinticuatro", 25: "veinticinco", 26: "veintiséis",
      27: "veintisiete", 28: "veintiocho", 29: "veintinueve", 30: "treinta", 31: "treinta y uno"
  };

  // Separar la fecha en día, mes y año
  const [mes, dia, año] = fecha.split("/");
  const diaNum = parseInt(dia);
  const mesNum = parseInt(mes);
  const añoNum = parseInt(año);

  // Construir la fecha en letras
  const fechaLetras = `${dias[diaNum]} de ${meses[mesNum]} de ${añoNum}`;

  return fechaLetras;
}
const NumeroALetras = require("./CovertNum");


async function obtenerRecibos(csvData) {
  const lineas = csvData.split('\n');
  const recibosEncontrados = [];
  const listasOrdenadas = [];

  for (let i = 1; i < lineas.length; i++) {
    const linea = lineas[i];
    const valores = linea.split(',');

    // Verifica si valores[5] está definido antes de llamar a trim()
    if (valores[5] !== undefined) {
      const recibo = valores[5].trim();
      if (recibo) {
        recibosEncontrados.push(linea);
        FechaenNombreNormal = fechaEnLetras(valores[0]);
        FechaenNombre = FechaenNombreNormal.toUpperCase();
        Cantidad = NumeroALetras(recibo);

        // Añade una lista ordenada con fecha, descripción de compra, recibo y técnico
        
        const listaOrdenada = [];
        let tecnicoIndex = 1;

        switch (true) {
          case valores[3].startsWith("Viaticos"):
            listaOrdenada.push({
              Fecha: valores[0],
              FechaenLetras: FechaenNombre,
              DescripcionCompra: valores[3],
              Recibo: recibo,
              CantidadenLetras: Cantidad,
              Tecnico: valores[1]
            });
            break;
          default:
            tecnicoIndex = 6; // Cambia el índice si la descripción no empieza con "Viaticos"
            listaOrdenada.push({
              Fecha: valores[0],
              FechaenLetras: FechaenNombre,
              DescripcionCompra: valores[3],
              Recibo: recibo,
              CantidadenLetras: Cantidad,
              Tecnico: valores[tecnicoIndex]
            });
            break;
        }

        
        listasOrdenadas.push(listaOrdenada);
      }
    }
  }

  // Ordena las listas por fecha
  listasOrdenadas.sort((a, b) => new Date(a[0].Valor) - new Date(b[0].Valor));

  let listaAplanada = listasOrdenadas.flat();

  return listaAplanada;
}

module.exports = obtenerRecibos;
