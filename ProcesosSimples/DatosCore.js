const { idEmpleados } = require("./empleados");
const bot = require('./BotToken');

// Función para obtener el ID de Telegram a partir del nombre
function obtenerChatIdPorNombre(nombre) {
  const empleado = idEmpleados.find((emp) => emp.nombre === nombre);
  return empleado ? empleado.telegramId : null;
}



function handleRecibirDatosCore(req, res) {
  const { ticket, nombrejg, nombrest, asignacion, cliente, lugar, tipotkk } = req.body;

  console.log("No. de Tkk:", ticket || "");
  console.log("Nombre Jefe de grupo:", nombrejg || "No se asignó");
  console.log("Nombre Scout:", nombrest || "No se asignó");
  console.log("Hora Asignación:", asignacion || "No se asigno");
  console.log("Cliente:", cliente || "No se asignó");
  console.log("Lugar:", lugar || "No se asignó");
  console.log("Tipo de Tkk:", tipotkk || "No se asignó");

  const chatIdJefeGrupo = obtenerChatIdPorNombre(nombrejg);
  const chatIdScout = obtenerChatIdPorNombre(nombrest);

  const mensajeIngetelca =
    `*NOTIFICACIÓN DE TICKET CORE No:* ${ticket}\n\n` +
    `*JEFE DE GRUPO:* ${nombrejg || "No se asigno"}\n\n` +
    `*SCOUT:* ${nombrest || "No se asigno"}\n\n` +
    `*CLIENTE:* ${cliente || "--"}\n\n` +
    `*HORA ASIGNACION:* ${asignacion || "--"}\n\n` +
    `*LUGAR:* ${lugar || "--"}\n\n` +
    `*TIPO DE TKK:* ${tipotkk || "--"}\n\n`;

  if (chatIdJefeGrupo) {
    bot
      .sendMessage(chatIdJefeGrupo, mensajeIngetelca, { parse_mode: "Markdown" })
      .then(() => console.log(`Mensaje enviado al chat con ID: ${chatIdJefeGrupo}`))
      .catch(error => console.error("Error al enviar el mensaje:", error));
  }

  if (chatIdScout && chatIdScout !== chatIdJefeGrupo) {
    bot
      .sendMessage(chatIdScout, mensajeIngetelca, { parse_mode: "Markdown" })
      .then(() => console.log(`Mensaje enviado al chat con ID: ${chatIdScout}`))
      .catch(error => console.error("Error al enviar el mensaje:", error));
  }

  res.status(200).send("Datos recibidos con éxito.");
}

module.exports = { handleRecibirDatosCore };
