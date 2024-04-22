const { idEmpleados } = require("./empleados");
const bot = require('./BotToken');

function obtenerChatIdPorNumTel(numtel) {
  const empleado = idEmpleados.find((emp) => emp.numtel === numtel);
  return empleado ? empleado.telegramId : null;
}
// Función para obtener el ID de Telegram a partir del número de teléfono
function obtenerChatIdPorNumTel(numtel) {
  const empleado = idEmpleados.find((emp) => emp.numtel === numtel);
  return empleado ? empleado.telegramId : null;
}


function handleRecibirDatos(req, res) {
  const {
    ticket,
    telefonojg,
    nombrejg,
    telefonost,
    nombrest,
    asignacion,
    cliente,
    lugar,
    tipotkk,
  } = req.body;

  console.log("No. de Tkk:", ticket || "");
  console.log("Teléfono Jefe de grupo:", telefonojg || "Teléfono no válido");
  console.log("Nombre Jefe de grupo:", nombrejg || "No se asigno");
  console.log("Teléfono Scout:", telefonost || "Teléfono no válido");
  console.log("Nombre Scout:", nombrest || "No se asigno");
  console.log("Hora Asignación:", asignacion || "No se asigno");
  console.log("Cliente:", cliente || "No se asigno");
  console.log("Lugar:", lugar || "No se asigno");
  console.log("Tipo de Tkk:", tipotkk || "No se asigno");

  const chatIdJefeGrupo = obtenerChatIdPorNumTel(telefonojg);
  const chatIdScout = obtenerChatIdPorNumTel(telefonost);

  const mensajeIngetelca =
    `*NOTIFICACIÓN DE TICKET BUC No:* ${ticket}\n\n` +
    `*JEFE DE GRUPO:* ${nombrejg || "No se asigno"}\n\n` +
    `*SCOUT:* ${nombrest || "No se asigno"}\n\n` +
    `*CLIENTE:* ${cliente || "--"}\n\n` +
    `*HORA ASIGNACION:* ${asignacion || "--"}\n\n` +
    `*LUGAR:* ${lugar || "--"}\n\n` +
    `*TIPO DE TKK:* ${tipotkk || "--"}\n\n`;

  if (chatIdJefeGrupo) {
    bot.sendMessage(chatIdJefeGrupo, mensajeIngetelca, { parse_mode: "Markdown" })
      .then(() => console.log(`Mensaje enviado al chat con ID: ${chatIdJefeGrupo}`))
      .catch(error => console.error("Error al enviar el mensaje:", error));
  }

  if (chatIdScout && chatIdScout !== chatIdJefeGrupo) {
    bot.sendMessage(chatIdScout, mensajeIngetelca, { parse_mode: "Markdown" })
      .then(() => console.log(`Mensaje enviado al chat con ID: ${chatIdScout}`))
      .catch(error => console.error("Error al enviar el mensaje:", error));
  }

  res.status(200).send("Datos recibidos con éxito.");
}

module.exports = { handleRecibirDatos };
