const { idEmpleados } = require("./empleados");
const bot = require('./BotToken');


// Función para obtener el ID de Telegram a partir del número de teléfono
function obtenerChatIdPorNumTel(numtel) {
  const empleado = idEmpleados.find((emp) => emp.numtel === numtel);
  return empleado ? empleado.telegramId : null;
}


function handleBottigo(req, res) {
  const {
    jefegrupo,
    teljefedegrupo,
    scout,
    telscout,
    nivel1,
    ticket,
    nivel2,
    nivel3,
    nivel4,
    nivel5,
    nivel6,
    nivel7,
    nivel8,
    nivel9,
  } = req.body;
  console.log("Body:", req.body);

  console.log("Jefe de grupo:", jefegrupo || "No se asigno");
  console.log("Teléfono Jefe de Grupo:", teljefedegrupo || "Telefono no válido");
  console.log("Scout:", scout || "No se asigno");
  console.log("Telefono Scout:", telscout || "Telefono no válido");
  console.log("Nivel 1:", nivel1);
  console.log("Ticket:", ticket);
  console.log("Nivel 2:", nivel2);
  console.log("Nivel 3:", nivel3);
  console.log("Nivel 4:", nivel4);
  console.log("Nivel 5:", nivel5);
  console.log("Nivel 6:", nivel6);
  console.log("Nivel 7:", nivel7);
  console.log("Nivel 8:", nivel8);
  console.log("Nivel 9:", nivel9);

  const chatIdJefeGrupo = obtenerChatIdPorNumTel(teljefedegrupo);
  const chatIdScout = obtenerChatIdPorNumTel(telscout);

  const mensajes = [
    nivel1 || "--",
    ticket || "--",
    nivel2 || "--",
    nivel3 || "--",
    nivel4 || "--",
    nivel5 || "--",
    nivel6 || "--",
    nivel7 || "--",
    nivel8 || "--",
    nivel9 || "--",
  ];

  function enviarMensajesEnOrden(chatId, mensajes) {
    let index = 0;

    function enviarMensaje() {
      if (index < mensajes.length) {
        const mensaje = mensajes[index];
        bot.sendMessage(chatId, mensaje).then(() => {
          console.log(`Mensaje ${index + 1} enviado al chat con ID: ${chatId}`);
          index++;
          enviarMensaje(); // Envía el próximo mensaje
        }).catch((error) => {
          console.error(`Error al enviar mensaje ${index + 1} al chat ${chatId}:`, error);
          res.status(500).send("Ocurrió un error al enviar los mensajes.");
        });
      } else {
        res.status(200).send("Datos de AppSheet recibidos y procesados con éxito.");
      }
    }

    enviarMensaje(); // Comienza el proceso de envío de mensajes
  }

  // Aquí se realiza el envío de mensajes
  if (chatIdJefeGrupo && chatIdScout && chatIdJefeGrupo !== chatIdScout) {
    enviarMensajesEnOrden(chatIdJefeGrupo, mensajes);
    enviarMensajesEnOrden(chatIdScout, mensajes);
  } else if (chatIdJefeGrupo || chatIdScout) {
    const chatToSend = chatIdJefeGrupo || chatIdScout;
    enviarMensajesEnOrden(chatToSend, mensajes);
  }
}

module.exports = { handleBottigo };
