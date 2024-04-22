const axios = require('axios');
const fs = require('fs');
const { updateTotalsInCsv } = require('./Totales'); // Asegúrate de proporcionar la ruta correcta al módulo
const getDatosColumnaName = require("./ProcesosPrintWeek/ObtenerNombres");


async function procesarNombres() {
    try {
        // Solicitar la lista de nombres

        const listaNombres = await getDatosColumnaName("A", "TOTAL CAJA CHICA");
;

        // Procesar cada nombre
        listaNombres.forEach(nombre => {
            const nombreFormateado = nombre.toUpperCase().replace(/ /g, '_');
            for (let semana = 1; semana <= 52; semana++) {
                const filePath = `./DiccionarioPDFs/SEMANA_${semana}/datos_${nombreFormateado}.csv`;

                // Verificar si el archivo existe antes de intentar actualizarlo
                if (fs.existsSync(filePath)) {
                    updateTotalsInCsv(filePath)
                        .then(() => console.log(`Archivo actualizado`))
                        .catch(error => console.error(`Error al actualizar el archivo`, error));
                } else {
                    
                }
            }
        });
    } catch (error) {
        console.error('Error al procesar los nombres:', error);
    }
}

module.exports = { procesarNombres };
