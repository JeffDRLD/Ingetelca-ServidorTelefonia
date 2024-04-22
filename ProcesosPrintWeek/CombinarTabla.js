function combinarTablas(datos, notas, datosColumnaProyect, datosColumnaName) {
  const gastosEnero = [];

  // Obtener la longitud máxima de las tres tablas
  const maxLength = Math.max(
    datos.length,
    notas.length,
    datosColumnaProyect.length,
    datosColumnaName.length
  );

  for (let i = 0; i < maxLength; i++) {
    // Obtener los valores de cada tabla o cadena vacía si no existen
    const tecnico = datosColumnaName[i] || '';
    const proyecto = datosColumnaProyect[i] || '';
    const reintegro = datos[i] || '';
    const observacion = notas[i] || '';

    // Agregar el objeto a la tabla combinada
    gastosEnero.push({
      No: '',
      tecnico,
      reintegro,
      observacion,
      proyecto,
    });
  }

  return gastosEnero;
}

module.exports = { combinarTablas };
