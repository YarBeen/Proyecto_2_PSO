import {
  Estadistica,
  AtributosPaginaPosicion,
} from "../constants/Valores-Tabla.js";
export const coloresBaseHSL = [
  { h: 340, s: 100, l: 85 }, // rosado pastel
  { h: 160, s: 60, l: 85 }, // verde agua
  { h: 30, s: 100, l: 85 }, // durazno claro
  { h: 90, s: 40, l: 85 }, // verde suave
  { h: 240, s: 50, l: 85 }, // azul lavanda
  { h: 10, s: 80, l: 85 }, // coral suave
  { h: 280, s: 30, l: 85 }, // violeta suave
  { h: 210, s: 40, l: 85 }, // azul grisáceo
  { h: 50, s: 90, l: 85 }, // amarillo pastel
  { h: 190, s: 70, l: 85 }, // celeste pastel
];
export class Simulador {
  constructor(
    MMUOptimo,
    MMUOtro,
    instrucciones,
    contenedorPaginas,
    algoritmo1,
    algoritmo2
  ) {
    this.MMUOptimo = MMUOptimo;
    this.MMUOtro = MMUOtro;
    this.instrucciones = instrucciones;
    this.relojOptimo = 0;
    this.relojOtro = 0;
    this.paso = 0;
    this.enPausa = false;
    this.contenedorPaginas = contenedorPaginas;
    this.algoritmoOTRO = algoritmo1;
    this.algoritmoOptimo = algoritmo2; //OPTIMO
    this.trashingOptimo = 0;
    this.trashingOtro = 0;
    this.contenedorPaginasOptimo = document.getElementById(
      `wrapper-paginas-${algoritmo2}`
    );
    this.contenedorPaginasOtro = document.getElementById(
      `wrapper-paginas-${algoritmo1}`
    );
  }
  /**
   * Retorna un color en HSL ajustado segun el pid
   * El color es determinista.
   */
  obtenerColorPorPID(pid) {
    const base = coloresBaseHSL[pid % coloresBaseHSL.length];

    // Desplazamiento de hue determinista basado en el pid
    const hueOffset = (pid * 17) % 360;
    const newHue = (base.h + hueOffset) % 360;

    return `hsl(${newHue}, ${base.s}%, ${base.l}%)`;
  }
  //El atributo realmente es un numero, pero se llama desde un enum
  actualizarAtributosPagina(algoritmo, numeroPagina, atributo, valor) {
    const filaId = `pagina-${numeroPagina}-${algoritmo}`;
    const celdaInicio = document.getElementById(filaId);
    if (!celdaInicio) {
      console.warn(`No se encontró la fila de la página: ${filaId}`);
      return;
    }

    const fila = celdaInicio.parentElement;
    const celda = fila.cells[atributo]; //Si es 1 encontrara PID, referirse a valores-tabla.js
    if (celda) {
      celda.textContent = valor;
    } else {
      console.warn(`No se encontró la celda de atributo: ${atributo}`);
    }
  }

  actualizarPaginas(paginas, algoritmo, operacion) {
    if (!paginas) {
      console.warn("No se encontraron páginas para actualizar.");
      return;
    }
    console.log(paginas, algoritmo, operacion);
    paginas.forEach((pagina) => {
      const filaId = `pagina-${pagina.numeroPagina}-${algoritmo}`;
      const celdaInicio = document.getElementById(filaId);
      if (!celdaInicio) {
        console.warn(`No se encontró la fila de la página: ${filaId}`);
        return;
      }

      switch (operacion) {
        case "new":
          const fila = celdaInicio.parentElement;
          fila.cells[AtributosPaginaPosicion.PID].textContent = pagina.pid;
          fila.cells[AtributosPaginaPosicion.PUNTERO].textContent = pagina.ptr;
          fila.cells[AtributosPaginaPosicion.DIRECCION_DISCO].textContent =
            pagina.direccionEnDisco;

          break;
        case "delete":
          const celda = celdaInicio.parentElement;
          celda.cells[AtributosPaginaPosicion.PID].textContent = "Eliminado";
          celda.cells[AtributosPaginaPosicion.PID].style.backgroundColor =
            "red";
          celda.cells[AtributosPaginaPosicion.PUNTERO].textContent = "";
          celda.cells[AtributosPaginaPosicion.DIRECCION_DISCO].textContent = "";
          celda.cells[AtributosPaginaPosicion.DIRECCION_RAM].textContent = "";
          celda.cells[AtributosPaginaPosicion.EN_RAM].textContent = "";
          celda.cells[AtributosPaginaPosicion.TIMESTAMP_DE_CARGA].textContent =
            "";
          celda.cells[AtributosPaginaPosicion.MARCADO].textContent = "";
          break;
        case "kill":
          const celdaKill = celdaInicio.parentElement;
          celdaKill.cells[AtributosPaginaPosicion.PID].textContent = "MUERTO";
          celdaKill.cells[AtributosPaginaPosicion.PID].style.backgroundColor =
            "red";
          celdaKill.cells[AtributosPaginaPosicion.PUNTERO].textContent = "";
          celdaKill.cells[AtributosPaginaPosicion.DIRECCION_DISCO].textContent =
            "";
          celdaKill.cells[AtributosPaginaPosicion.DIRECCION_RAM].textContent =
            "";
          celdaKill.cells[AtributosPaginaPosicion.EN_RAM].textContent = "";
          celdaKill.cells[
            AtributosPaginaPosicion.TIMESTAMP_DE_CARGA
          ].textContent = "";
          celdaKill.cells[AtributosPaginaPosicion.MARCADO].textContent = "";
          break;
        case "use":
          const celdaUse = celdaInicio.parentElement;
          celdaUse.cells[AtributosPaginaPosicion.PID].textContent = pagina.pid;
          celdaUse.cells[AtributosPaginaPosicion.PID].style.backgroundColor =
            this.obtenerColorPorPID(pagina.pid);
          celdaUse.cells[AtributosPaginaPosicion.PUNTERO].textContent =
            pagina.ptr;
          celdaUse.cells[AtributosPaginaPosicion.DIRECCION_DISCO].textContent =
            pagina.direccionEnDisco;
          celdaUse.cells[AtributosPaginaPosicion.DIRECCION_RAM].textContent =
            pagina.direccionEnRam ? pagina.direccionEnRam : "";
          celdaUse.cells[AtributosPaginaPosicion.EN_RAM].textContent =
            pagina.estaEnRam ? "X" : "";
          celdaUse.cells[
            AtributosPaginaPosicion.TIMESTAMP_DE_CARGA
          ].textContent = pagina.timestampDeCarga;

          celdaUse.cells[AtributosPaginaPosicion.MARCADO].textContent =
            pagina.marcado ? pagina.marcado : "";

          break;
        default:
          console.warn(`Operación no válida: ${operacion}`);
          return;
      }
    });
  }
  actualizarColoresRam(algoritmo, mmu) {
    mmu.posicionesActualizar.forEach((pos) => {
      const celda = document.getElementById(`ram-${pos}-${algoritmo}`);
      if (!celda) {
        console.warn(`No se encontró la celda de RAM: ram-${pos}-${algoritmo}`);
        return;
      }

      const pagina = mmu.memoriaReal[pos];

      if (pagina === null) {
        celda.style.backgroundColor = "white";
        celda.textContent = "";
      } else {
        celda.style.backgroundColor = this.obtenerColorPorPID(pagina.pid);
        celda.textContent = `P${pagina.numeroPagina}`; // O el dato que prefieras mostrar
      }
    });

    mmu.posicionesActualizar = [];
  }
  actualizarStat(algoritmo, statPorActualizar, valor) {
    // Los stats validos estan STATS.js
    const idCampoStat = `${statPorActualizar.replace(
      /\s+/g,
      "-"
    )}-${algoritmo}`; //Ejemplo: "RAM-KB-FIFO" Se utilizo este formato para encontrar la celda de valor rapido
    const celda = document.getElementById(idCampoStat);
    if (celda) {
      celda.textContent = valor;
    } else {
      console.warn(`No se encontró el campo de estadística: ${idCampoStat}`);
    }
  }
  actualizarStats(algoritmo, mmu) {
    // Tiempo
    const idCampoTiempo = `${Estadistica.TIEMPO_SIMULACION.replace(
      /\s+/g,
      "-"
    )}-${algoritmo}`; //Ejemplo: "RAM-KB-FIFO" Se utilizo este formato para encontrar la celda de valor rapido
    const celdaTiempo = document.getElementById(idCampoTiempo);
    if (celdaTiempo) {
      if (algoritmo === this.algoritmoOptimo) {
        celdaTiempo.textContent = this.relojOptimo;
      } else {
        celdaTiempo.textContent = this.relojOtro;
      }
    } else {
      console.warn(`No se encontró el campo de estadística: ${idCampoTiempo}`);
    }

    // Procesos
    const idCampoProcesos = `${Estadistica.PROCESOS.replace(
      /\s+/g,
      "-"
    )}-${algoritmo}`;
    const celdaProcesos = document.getElementById(idCampoProcesos);
    if (celdaProcesos) {
      celdaProcesos.textContent = mmu.devolverProcesoVivos();
    } else {
      console.warn(
        `No se encontró el campo de estadística: ${idCampoProcesos}`
      );
    }

    //Thrashing
    const idCampoThrashing = `${Estadistica.THRASING.replace(
      /\s+/g,
      "-"
    )}-${algoritmo}`;
    const celdaThrashing = document.getElementById(idCampoThrashing);
    if (celdaThrashing) {
      if (algoritmo === this.algoritmoOptimo) {
        celdaThrashing.textContent = this.trashingOptimo;
      } else {
        celdaThrashing.textContent = this.trashingOtro;
      }
    } else {
      console.warn(
        `No se encontró el campo de estadística: ${idCampoThrashing}`
      );
    }

    //Thrashing %
    const idCampoThrashingPorcentaje = `${Estadistica.THRASING_PORCENTAJE.replace(
      /\s+/g,
      "-"
    )}-${algoritmo}`;
    const celdaThrashingPorcentaje = document.getElementById(
      idCampoThrashingPorcentaje
    );
    if (celdaThrashingPorcentaje) {
      if (algoritmo === this.algoritmoOptimo) {
        celdaThrashingPorcentaje.textContent =
          (this.trashingOptimo / this.relojOptimo) * 100 + "%";
      } else {
        celdaThrashingPorcentaje.textContent =
          (this.trashingOtro / this.relojOtro) * 100 + "%";
      }
    } else {
      console.warn(
        `No se encontró el campo de estadística: ${idCampoThrashing}`
      );
    }

    //Memoria Real KB
    const idCampoMemoriaRealKB = `${Estadistica.RAM_KB.replace(
      /\s+/g,
      "-"
    )}-${algoritmo}`;
    const celdaCampoMemoriaRealKB =
      document.getElementById(idCampoMemoriaRealKB);
    if (celdaCampoMemoriaRealKB) {
      celdaCampoMemoriaRealKB.textContent = mmu.memoriaRealKB;
    } else {
      console.warn(
        `No se encontró el campo de estadística: ${idCampoMemoriaRealKB}`
      );
    }

    //Memoria Real %

    const idCampoMemoriaRealKBPorcentaje = `${Estadistica.RAM_PORCENTAJE.replace(
      /\s+/g,
      "-"
    )}-${algoritmo}`;
    const celdaCampoMemoriaRealPorcentaje = document.getElementById(
      idCampoMemoriaRealKBPorcentaje
    );
    if (celdaCampoMemoriaRealPorcentaje) {
      celdaCampoMemoriaRealPorcentaje.textContent =
        (mmu.memoriaRealKB / mmu.memoriaVirtualKB) * 100 + "%";
    } else {
      console.warn(
        `No se encontró el campo de estadística: ${idCampoMemoriaRealKBPorcentaje}`
      );
    }

    //Memoria Virtual KB
    const idCampoMemoriaVirtualKB = `${Estadistica.V_RAM_KB.replace(
      /\s+/g,
      "-"
    )}-${algoritmo}`;
    const celdaCampoMemoriaVirtualKB = document.getElementById(
      idCampoMemoriaVirtualKB
    );
    if (celdaCampoMemoriaVirtualKB) {
      celdaCampoMemoriaVirtualKB.textContent = mmu.memoriaVirtualKB;
    } else {
      console.warn(
        `No se encontró el campo de estadística: ${idCampoMemoriaVirtualKB}`
      );
    }
    //Memoria Virtual %

    const idCampoMemoriaVirtualPorcentaje = `${Estadistica.V_RAM_PORCENTAJE.replace(
      /\s+/g,
      "-"
    )}-${algoritmo}`;
    const celdaCampoMemoriavIRTUALPorcentaje = document.getElementById(
      idCampoMemoriaVirtualPorcentaje
    );
    if (celdaCampoMemoriavIRTUALPorcentaje) {
      celdaCampoMemoriavIRTUALPorcentaje.textContent =
        (mmu.memoriaVirtualKB / mmu.memoriaRealKB) * 100 + "%";
    } else {
      console.warn(
        `No se encontró el campo de estadística: ${idCampoMemoriaVirtualPorcentaje}`
      );
    }

    //Fragmentacion
    const idCampoFragmentacion = `${Estadistica.FRAGMENTACION.replace(
      /\s+/g,
      "-"
    )}-${algoritmo}`;
    const celdaCampoFragmentacion =
      document.getElementById(idCampoFragmentacion);
    if (celdaCampoFragmentacion) {
      celdaCampoFragmentacion.textContent = mmu.fragmentacion + "KB";
    } else {
      console.warn(
        `No se encontró el campo de estadística: ${idCampoFragmentacion}`
      );
    }
  }
  iniciarSimulacion() {
    const btnPause = document.getElementById("btnRunSimulacion");

    if (btnPause) {
      btnPause.textContent = "Pausar simulación";
      btnPause.onclick = () => {
        this.enPausa = !this.enPausa;
        btnPause.textContent = this.enPausa
          ? "Continuar simulación"
          : "Pausar simulación";
      };
    }
    const delay = 500; // 1 paso cada 500ms, reales
    const intervalo = setInterval(() => {
      this.actualizarColoresRam(this.algoritmoOptimo, this.MMUOptimo);
      this.actualizarColoresRam(this.algoritmoOTRO, this.MMUOtro);
      this.actualizarStats(this.algoritmoOptimo, this.MMUOptimo);
      this.actualizarStats(this.algoritmoOTRO, this.MMUOtro);

      if (this.enPausa) return;
      if (this.paso >= this.instrucciones.length) {
        console.log("Simulación finalizada");
        clearInterval(intervalo);
        return;
      }

      const [tipo, args, linea] = this.instrucciones[this.paso];
      console.log(`Ejecutando paso ${this.paso}: ${tipo}(${args.join(", ")})`);

      if (tipo === "new") {
        const [pid, size] = args;
        const ptrPaginasOptimas = this.MMUOptimo.metodoNew(size, pid);
        const ptrPaginasOtras = this.MMUOtro.metodoNew(size, pid);

        this.actualizarPaginas(
          this.MMUOptimo.obtenerPaginasPorPtr(ptrPaginasOptimas),
          this.algoritmoOptimo,
          "new"
        );
        this.actualizarPaginas(
          this.MMUOtro.obtenerPaginasPorPtr(ptrPaginasOtras),
          this.algoritmoOTRO,
          "new"
        );
        this.relojOptimo += 1;
        this.relojOtro += 1;
      }
      if (tipo === "delete") {
        const [ptr] = args; // Puntero a eliminar
        const paginasEliminadasOptimas = this.MMUOptimo.metodoDelete(ptr);
        const paginasEliminadasOtras = this.MMUOtro.metodoDelete(ptr);
        this.actualizarPaginas(
          paginasEliminadasOptimas,
          this.algoritmoOptimo,
          "delete"
        );
        this.actualizarPaginas(
          paginasEliminadasOtras,
          this.algoritmoOTRO,
          "delete"
        );
        this.relojOptimo += 1;
        this.relojOtro += 1;
      }
      if (tipo === "use") {
        const [ptr] = args;
        const {
          paginasAgregadas: paginasAgregadasOptimo,
          paginasEliminadas: paginasEliminadasOptimo,
          paginasQuePermanecen: paginasQuePermanecenOptimo,
          delay: delayOptimo,
          thrashing: thrashingOptimo,
        } = this.MMUOptimo.metodoUse(
          ptr,
          this.relojOptimo,
          this.algoritmoOptimo
        );
        this.trashingOptimo += thrashingOptimo;
        const {
          paginasAgregadas: paginasAgregadasOtro,
          paginasEliminadas: paginasEliminadasOtro,
          paginasQuePermanecen: paginasQuePermanecenOtro,
          delay: delayOtro,
          thrashing: thrashingOtro,
        } = this.MMUOtro.metodoUse(ptr, this.relojOtro, this.algoritmoOTRO);
        this.actualizarPaginas(
          paginasAgregadasOptimo,
          this.algoritmoOptimo,
          "use"
        );
        this.trashingOtro += thrashingOtro;
        if (paginasEliminadasOptimo) {
          this.actualizarPaginas(
            paginasEliminadasOptimo,
            this.algoritmoOptimo,
            "use"
          );
        }
        if (paginasQuePermanecenOptimo) {
          this.actualizarPaginas(
            paginasQuePermanecenOptimo,
            this.algoritmoOptimo,
            "use"
          );
        }
        this.actualizarPaginas(paginasAgregadasOtro, this.algoritmoOTRO, "use");
        if (paginasEliminadasOtro) {
          this.actualizarPaginas(
            paginasEliminadasOtro,
            this.algoritmoOTRO,
            "use"
          );
        }
        if (paginasQuePermanecenOtro) {
          this.actualizarPaginas(
            paginasQuePermanecenOtro,
            this.algoritmoOTRO,
            "use"
          );
        }
        this.relojOptimo += delayOptimo;
        this.relojOtro += delayOtro;
      }
      if (tipo === "kill") {
        const [pid] = args;
        const paginasMuertasOptimo = this.MMUOptimo.metodoKill(pid);
        const paginasMuertasOtro = this.MMUOtro.metodoKill(pid);
        this.actualizarPaginas(
          paginasMuertasOptimo,
          this.algoritmoOptimo,
          "kill"
        );
        this.actualizarPaginas(paginasMuertasOtro, this.algoritmoOTRO, "kill");
        this.relojOptimo += 1;
        this.relojOtro += 1;
      }

      this.paso++;
    }, delay);
  }
}
