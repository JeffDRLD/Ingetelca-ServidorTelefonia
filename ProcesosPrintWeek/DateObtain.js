function obtenerFechaPorSemana(numeroSemana, anio) {
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const fecha = new Date(anio, 0, (numeroSemana - 1) * 7 + 1); // Se resta 1 al número de semana para ajustar el índice
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const anioString = fecha.getFullYear();

  const nombreDia = diasSemana[fecha.getDay()]; // Se obtiene el nombre del día de la semana

  return `${nombreDia} ${dia} de ${mes} de ${anioString}`;
}

module.exports = obtenerFechaPorSemana;
