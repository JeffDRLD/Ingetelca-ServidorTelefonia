function sumarReintegrosPorProyecto(gastos) {
  const proyectos = {};

  gastos.forEach((gasto) => {
    const { proyecto, reintegro } = gasto;
    const monto = parseFloat(reintegro.replace("Q", "").replace(",", ""));

    if (!proyectos[proyecto]) {
      proyectos[proyecto] = 0;
    }

    proyectos[proyecto] += monto;
  });

  // Formatear los montos con dos ceros en los decimales
  for (const proyecto in proyectos) {
    proyectos[proyecto] = proyectos[proyecto].toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return proyectos;
}


module.exports = { sumarReintegrosPorProyecto };




