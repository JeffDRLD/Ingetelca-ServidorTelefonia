const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const { idEmpleados } = require("./empleados");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const generatePDF = require("./test_dev");

var contador = 0;

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(
  "/DiccionarioPDFs",
  express.static(path.join(__dirname, "/DiccionarioPDFs")),
);

const tokenE = "6751240359:AAGBZDYaQrqDBbzwmXak8qlvagoIGq6JpTg";
const tokenJ = "6654183029:AAGBz72wJ1n8xtGFDIq00UVGtT0j57Bgagw";

const juan = false;
const token = juan ? tokenJ : tokenE;

const bot = new TelegramBot(token, { polling: true });

// Endpoint GET para probar el envío de mensajes
app.get("/test", (req, res) => {});

app.get("/enviarMensaje", (req, res) => {
  const chatId1 = juan ? "6319697475" : "6319697475";
  const mensaje = `hola que hace`;

  bot
    .sendMessage(chatId1, mensaje, { parse_mode: "Markdown" })
    .then(() => {
      res
        .status(200)
        .send(`Mensaje enviado con éxito a ${chatId1}: ${mensaje}`);
    })
    .catch(() => {
      res.status(400).send("Error al enviar el mensaje.");
    });
});

app.get("/enviarLocalidad", (req, res) => {
  const chatId1 = juan ? "6319697475" : "6677785937";
  //14.607186, -90.521942
  const latitude = 14.607186;
  const longitude = -90.521942;

  bot
    .sendLocation(chatId1, latitude, longitude)
    .then(() => {
      res
        .status(200)
        .send(
          `Location sent successfully to ${chatId1}: Latitude ${latitude}, Longitude ${longitude}`,
        );
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("Error sending location.");
    });
});

// Función para obtener el ID de Telegram a partir del número de teléfono
function obtenerChatIdPorNumTel(numtel) {
  const empleado = idEmpleados.find((emp) => emp.numtel === numtel);
  return empleado ? empleado.telegramId : null;
}

// Endpoint POST para recibir datos y enviar mensajes
app.post("/recibirDatos", (req, res) => {
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
  // Imprime los datos recibidos
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

  // Envío de mensajes a los chats correspondientes
  if (chatIdJefeGrupo) {
    bot
      .sendMessage(chatIdJefeGrupo, mensajeIngetelca, {
        parse_mode: "Markdown",
      })
      .then(() => {
        console.log(`Mensaje enviado al chat con ID: ${chatIdJefeGrupo}`);
      })
      .catch((error) => {
        console.error("Error al enviar el mensaje:", error);
      });
  }

  if (chatIdScout && chatIdScout !== chatIdJefeGrupo) {
    bot
      .sendMessage(chatIdScout, mensajeIngetelca, { parse_mode: "Markdown" })
      .then(() => {
        console.log(`Mensaje enviado al chat con ID: ${chatIdScout}`);
      })
      .catch((error) => {
        console.error("Error al enviar el mensaje:", error);
      });
  }

  res.status(200).send("Datos recibidos con éxito.");
});

// Función para obtener el ID de Telegram a partir del nombre
function obtenerChatIdPorNombre(nombre) {
  const empleado = idEmpleados.find((emp) => emp.nombre === nombre);
  return empleado ? empleado.telegramId : null;
}

app.post("/bottigo", (req, res) => {
  console.log("Body:", req.body); // Imprimir el cuerpo completo de la solicitud
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
  console.log(req.body);

  console.log("Jefe de grupo:", jefegrupo || "No se asigno");
  console.log(
    "Teléfono Jefe de Grupo:",
    teljefedegrupo || "Telefono no válido",
  );
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

  // Crear mensajes para cada columna
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
        bot
          .sendMessage(chatId, mensaje)
          .then(() => {
            console.log(
              `Mensaje ${index + 1} enviado al chat con ID: ${chatId}`,
            );
            index++;
            enviarMensaje(); // Envía el próximo mensaje
          })
          .catch((error) => {
            console.error(
              `Error al enviar mensaje ${index + 1} al chat ${chatId}:`,
              error,
            );
            res.status(500).send("Ocurrió un error al enviar los mensajes.");
          });
      } else {
        res
          .status(200)
          .send("Datos de AppSheet recibidos y procesados con éxito.");
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
});
app.post("/recibirDatoscore", (req, res) => {
  const { ticket, nombrejg, nombrest, asignacion, cliente, lugar, tipotkk } =
    req.body;

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
      .sendMessage(chatIdJefeGrupo, mensajeIngetelca, {
        parse_mode: "Markdown",
      })
      .then(() => {
        console.log(`Mensaje enviado al chat con ID: ${chatIdJefeGrupo}`);
      })
      .catch((error) => {
        console.error("Error al enviar el mensaje:", error);
      });
  }

  if (chatIdScout && chatIdScout !== chatIdJefeGrupo) {
    bot
      .sendMessage(chatIdScout, mensajeIngetelca, { parse_mode: "Markdown" })
      .then(() => {
        console.log(`Mensaje enviado al chat con ID: ${chatIdScout}`);
      })
      .catch((error) => {
        console.error("Error al enviar el mensaje:", error);
      });
  }

  res.status(200).send("Datos recibidos con éxito.");
});
app.post("/bottigocore", (req, res) => {
  console.log("Body:", req.body); // Imprimir el cuerpo completo de la solicitud
  const {
    jefegrupo,
    telejefedegrupo,
    scout,
    telescout,
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
  console.log(req.body);

  console.log("Jefe de grupo:", jefegrupo || "No se asigno");
  console.log(
    "Teléfono Jefe de Grupo:",
    telejefedegrupo || "Telefono no valido",
  );
  console.log("Scout:", scout || "No se asigno");
  console.log("Telefono Scout:", telescout || "Telefono no valido");
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

  const chatIdJefeGrupo = obtenerChatIdPorNumTel(telejefedegrupo);
  const chatIdScout = obtenerChatIdPorNumTel(telescout);

  // Crear mensajes para cada columna
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
        bot
          .sendMessage(chatId, mensaje)
          .then(() => {
            console.log(
              `Mensaje ${index + 1} enviado al chat con ID: ${chatId}`,
            );
            index++;
            enviarMensaje(); // Envía el próximo mensaje
          })
          .catch((error) => {
            console.error(
              `Error al enviar mensaje ${index + 1} al chat ${chatId}:`,
              error,
            );
            res.status(500).send("Ocurrió un error al enviar los mensajes.");
          });
      } else {
        res
          .status(200)
          .send("Datos de AppSheet recibidos y procesados con éxito.");
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
});

app.post("/recibirpdf", (req, res) => {
  // ----------------- *
  // "/recibirGastosAppsheet"
  // Recibe viaticos y gastos de AppSheet y lo convierte en CSV
  // como segundo paso tambien lo convierte a PDF
  // ARGUMENTOS:

  // {gastoIngetelca: fecha,nombreEstablecimiento,proyecto,
  // descripcionCompra,factura,recibo,tecnico,semana}

  // ----------------- *

  const {
    fecha,
    nombredelestablecimiento,
    proyecto,
    descripcionCompra,
    factura,
    recibo,
    tecnico,
    semana,
    total,
  } = req.body;

  // Print received data
  console.log("Fecha:", fecha || "No se asignó");

  const csvString = `${fecha},${nombredelestablecimiento.replace(
    /,/g,
    "",
  )},${proyecto},${descripcionCompra.replace(/,/g, "")},${factura.replace(
    /,/g,
    "",
  )},${recibo.replace(/,/g, "")},${tecnico},${semana},${total.replace(
    /,/g,
    "",
  )}\n`;

  // const nombreArchivo = `gastos_${fecha}.csv`
  // Escribe en el archivo CSV
  const nombreTecnico = tecnico.split(" ").join("_").toUpperCase();
  const carpetaSemana = `./DiccionarioPDFs/SEMANA_${semana}`;
  const caminoCSV = `${carpetaSemana}/datos_${nombreTecnico}.csv`;
  if (!fs.existsSync(path.join(__dirname, carpetaSemana))) {
    fs.mkdirSync(path.join(__dirname, carpetaSemana));
  }

  if (!fs.existsSync(path.join(__dirname, caminoCSV))) {
    // Encabezados personalizados
    const headers = [
      { id: "fecha", title: "fecha" },
      { id: "nombreEstablecimiento", title: "nombreEstablecimiento" },
      { id: "proyecto", title: "proyecto" },
      { id: "descripcionCompra", title: "descripcionCompra" },
      { id: "factura", title: "factura" },
      { id: "recibo", title: "recibo" },
      { id: "tecnico", title: "tecnico" },
      { id: "semana", title: "semana" },
      { id: "total", title: "total" },
      // Agrega más encabezados según tus necesidades
    ];

    // Crear el escritor CSV con los encabezados
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, caminoCSV),
      header: headers,
    });

    // Escribir encabezados al archivo CSV
    csvWriter
      .writeRecords([]) // No es necesario agregar un objeto vacío aquí
      .then(() => {
        console.log("Encabezados escritos en la fila 1 del archivo CSV");
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    console.log(
      "El archivo CSV ya existe. No se escribieron encabezados adicionales.",
    );
  }

  fs.appendFile(
    `./DiccionarioPDFs/SEMANA_${semana}/datos_${nombreTecnico}.csv`,
    csvString,
    (err) => {
      if (err) throw err;
      console.log("Datos escritos en la fila 2 del archivo CSV");
    },
  );

  contador += 1;

  console.log("Contador:", contador);

  res.status(200).send("Data received successfully"); // Respond with a success message
});

app.get("/ejemploPDF/:tecnico/:semana", (req, res) => {
  // ----------------- *
  // "/extraerPDF"
  // Extrae el PDF con base al tecnico y semana.
  // Al recibir el tecnico y semana, busca el archivo CSV correspondiente en el directorio local de replit.

  // ARGUMENTOS: tecnico , semana
  // ----------------- *

  const tecnico = req.params.tecnico;
  const semana = req.params.semana;
  // /ejemploPDF/SENOVIO_REYES/8
  const listaPrueba = [{}, { nombre: "Juan" }];
  const caminoCSV = `./DiccionarioPDFs/SEMANA_${semana}/datos_${tecnico}.csv`;
  const data = [];
  fs.createReadStream(path.join(__dirname, caminoCSV))
    .pipe(csv())
    .on("data", (row) => {
      // Add each row to the data array
      data.push(row);
    })

    .on("end", () => {
      // Log the data to the console
      console.log(data);
      const nuevosDatos = data.map((row) => {
        const nuevaFila = { caminoCSV, ...row };
        console.log(nuevaFila);
        return nuevaFila;
      });
      // Generate the PDF

      // res.download(rutaArchivo, (err) => {
      //   if (err) {
      //     console.error('Error al descargar el archivo:', err);
      //     res.status(500).send('Error al descargar el archivo');
      //   }
      // });
      generatePDF(nuevosDatos)
        .then((caminoPDF) => {
          console.log("PDF generado con éxito");
          const caminoFinal =
            "https://3080b1c7-95ae-4db0-b50d-720b71672700-00-1m1py3zjcqn45.spock.replit.dev" +
            caminoPDF.slice(1, -1) +
            "f";
          res.send(caminoFinal);
        })
        .catch((err) => {
          console.error("Error al descargar el archivo:", err);
          res.status(500).send("Error al descargar el archivo");
        });

      // Optionally, you can still send a response to the client if needed
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
