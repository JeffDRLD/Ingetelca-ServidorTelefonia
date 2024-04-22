const XLSX = require("xlsx");
const fs = require("fs");
const { construirKMZ } = require("./construirKMZ");
const insertarDatosEnPlantilla = require("./plantilla_reparacionfo");
const insertarDatosEnPlantilla_CORRIMIENTORESERVA = require("./plantilla_corrimientoreserva");
const insertarDatosEnPlantilla_CAMBIOPOSTE = require("./plantilla_cambioposte");
const insertarDatosEnPlantilla_CAMBIODEHILOS = require("./plantilla_cambiodehilos");
const BUC = "17_DIsbnpYnCMFShm-iAI4zhwBGPHvtaB";
const CORE = "14YsQCgyJAmZYkhUICc2BnJXFWyxFIywS";
const RED_ADQUIRIDA = "1L7nT9LxWos20rZ9YEULIC8BqSWZDiGEI";


async function procesarDatosExcel(lista) {

  for (const excel of lista) {
    try {


  function splitLatLong(latLongString) {
      const [B_lat, B_long] = latLongString.split(',').map(coord => parseFloat(coord.trim()));
      return { B_lat, B_long };
  }

  function splitLatLong1(latLongString1) {
      const [lat, long] = latLongString1.split(',').map(coord => parseFloat(coord.trim()));
      return { lat, long };
  }

  function splitDateAndTime(datetimeString) {
      const [datePart, timePart] = datetimeString.split(' ');
      const date = datePart.split('/').join('-');
      const time = timePart.split(':').map(part => parseInt(part));
      return { date, time };
  }


  
  lista.forEach(async (excel) => {


    const { lat, long } = splitLatLong1(excel.coordenada1);
    const { B_lat, B_long } = splitLatLong(excel.coordenada2);
    const { date, time } = splitDateAndTime(excel.tkk_date_final);
    const tkk_date_final = date;


    
    let link_id;

    switch (excel.tecnologia) {
      case "BUC":
        link_id = BUC;
        break;
      case "CORE":
        link_id = CORE;
        break;
      case "RED ADQUIRIDA":
        link_id = RED_ADQUIRIDA;
        break;
    }
    const data = {
      tkk_num: excel.tkk_num,
      area: excel.area,
      tecnologia: excel.tecnologia,
      tkk_date_final: tkk_date_final,
      tkk_name: excel.tkk_name,
      tipo_fibra: excel.tipo_fibra,
      materiales: excel.materiales,
      data_kmz: {
        data: [
          {
            mufa_name: excel.poste,
            lat: lat,
            lng: long,
            tkk_num: excel.tkk_num,
            tkk_date_final: tkk_date_final,
          },
          {
            mufa_name: excel.B_poste,
            lat: B_lat,
            lng: B_long,
            tkk_num: excel.tkk_num,
            tkk_date_final: tkk_date_final,
          },
        ],
      },
    };

        switch (excel.cartografia) {
          case "Reparacion de fo":
            construirKMZ(data);

            let validacion;
            if (excel.valid_reserva === "SI") {
              validacion = {
                poste: " ", 
                sec_fo_inicial: " ", 
                sec_fo_final: " ", 
                reserva_inicial: excel.reserva_inicial, 
                init_id_poste: excel.poste,
                end_reserv_final: " ", 
                end_id_poste: " ", 
                B_no_mufa: excel.B_no_mufa, 
                B_cap_mufa: excel.B_cap_mufa, 
                B_lat: B_lat, 
                B_long: B_long, 
                B_poste: " ", 
                B_sec_fo_inicial: " ", 
                B_sec_fo_final: " ", 
                B_init_reserv_inicial: " ", 
                B_init_id_poste: " ", 
                B_end_reserv_final: excel.reserva_final,
                B_end_id_poste: excel.B_poste, 
              };
            } else if (excel.valid_reserva === "NO") {
              validacion = {
                poste: excel.poste, 
                sec_fo_inicial: excel.sec_fo_inicial, 
                sec_fo_final: " ", 
                init_reserv_inicial: " ", 
                init_id_poste: " ", 
                end_reserv_final: " ", 
                end_id_poste: " ", 
                B_no_mufa: excel.B_no_mufa, 
                B_cap_mufa: excel.B_cap_mufa, 
                B_lat: B_lat, 
                B_long: B_long, 
                B_poste: excel.B_poste, 
                B_sec_fo_inicial: " ", 
                B_sec_fo_final: excel.sec_fo_final, 
                B_init_reserv_inicial: " ", 
                B_init_id_poste: " ", 
                B_end_reserv_final: " ",
                B_end_id_poste: " ", 
              };
            }

            const indiceListaReparacion = {
              tkk_num: excel.tkk_num, 
              tkk_date_final: tkk_date_final, 
              tkk_name: excel.tkk_name, 
              no_installation: excel.no_installation, 
              area: excel.area, 
              site: excel.site, 
              reparacion: excel.reparacion, 
              tipo_fibra: excel.tipo_fibra, 
              cant_mufa: excel.cant_mufa, 
              no_mufa: excel.no_mufa, 
              cap_mufa: excel.cap_mufa, 
              lat: lat, 
              long: long, 
              poste: validacion.poste, 
              sec_fo_inicial: validacion.sec_fo_inicial, 
              sec_fo_final: validacion.sec_fo_final, 
              init_reserv_inicial: validacion.reserva_inicial, 
              init_id_poste: validacion.init_id_poste, 
              end_reserv_final: validacion.end_reserv_final, 
              end_id_poste: validacion.end_id_poste, 
              B_no_mufa: excel.B_no_mufa, 
              B_cap_mufa: excel.B_cap_mufa, 
              B_lat: B_lat, 
              B_long: B_long, 
              B_poste: validacion.B_poste, 
              B_sec_fo_inicial: validacion.B_sec_fo_inicial, 
              B_sec_fo_final: validacion.B_sec_fo_final, 
              B_init_reserv_inicial: validacion.B_init_reserv_inicial, 
              B_init_id_poste: validacion.B_init_id_poste, 
              B_end_reserv_final: validacion.B_end_reserv_final,
              B_end_id_poste: validacion.B_end_id_poste, 
            };

            const name1 = `TTK_${excel.tkk_num}_${excel.tkk_name}_${tkk_date_final}`;

            insertarDatosEnPlantilla(indiceListaReparacion, name1, link_id);
            break;

      case "Corrimiento reserva":
        construirKMZ(data);

        const indiceListaCorrimiento = [
          {
            tkk_num: excel.tkk_num, 
            tkk_date_final: tkk_date_final, 
            tkk_name: excel.tkk_name, 
            area: excel.area, 
            sitio: excel.site, 
            tipo_rep: excel.reparacion, 
            original_reserva: excel.reserva_inicial, 
            original_poste: excel.poste, 
            original_lat: lat, 
            original_long: long, 
            original_capfibra: excel.original_capfibra, 
            nuevo_reserva: excel.reserva_final, 
            nuevo_poste: excel.B_poste, 
            nuevo_lat: B_lat, 
            nuevo_long: B_long, 
            nuevo_capfibra: excel.nuevocap_fibra, 
            secuenciafo_inicial: excel.sec_fo_inicial, 
            secuenciafo_final: excel.sec_fo_final, 
          },
        ];

        const name2 = `TTK_${excel.tkk_num}_${excel.tkk_name}_${tkk_date_final}`;

        insertarDatosEnPlantilla_CORRIMIENTORESERVA(
          indiceListaCorrimiento,
          name2,
          link_id,
        );
        break;

      case "Cambio de postes":
        construirKMZ(data);

        const indiceListaCambioPostes = [
          {
            tkk_num: excel.tkk_num, 
            tkk_date_final: tkk_date_final, 
            tkk_name: excel.tkk_name, 
            no_installation: excel.no_installation, 
            area: excel.area, 
            tipo_rep: excel.reparacion, 
            original_poste: excel.poste,
            original_reserva: excel.reserva_inicial, 
            original_lat: lat, 
            original_long: long, 
            nuevo_poste: excel.B_poste, 
            nuevo_reserva: excel.reserva_final,
            nuevo_lat: B_lat, 
            nuevo_long: B_long, 
          },
        ];

        const name3 = `TTK_${excel.tkk_num}_${excel.tkk_name}_${tkk_date_final}`;

        insertarDatosEnPlantilla_CAMBIOPOSTE(
          indiceListaCambioPostes,
          name3,
          link_id,
        );
        break;

      case "Cambio de hilos":
        const indiceListaCambioHilos = [
          {
            tkk_num: excel.tkk_num, 
            tkk_date_final: tkk_date_final, 
            tkk_name: excel.tkk_name, 
            area: excel.area, 
            cap_fibra: excel.original_capfibra,
            lat: lat, 
            long: long, 
            poste: excel.poste, 
            hilos_a: excel.hilos_a,
            capacidad: excel.nuevocap_fibra, 
            hilos_b_1: excel.hilos_b_1,
            hilos_b_2: excel.hilos_b_2,
            hilos_ab_1: excel.hilos_ab_1, 
            hilos_ab_2: excel.hilos_ab_2, 
          },
        ];

        const name = `TTK_${excel.tkk_num}_${excel.tkk_name}_${tkk_date_final}`;

        insertarDatosEnPlantilla_CAMBIODEHILOS(
          indiceListaCambioHilos,
          name,
          link_id,
        );
        break;

      default:
        console.log(`Tipo de cartografía desconocido: ${excel.cartografia}`);
    }
  });
      } catch (error) {
            console.error("Error al procesar los datos:", error);
          }
        }
      }
module.exports = procesarDatosExcel;

