import * as COMPUTER_SPECS from "../constants/computerSpecs.js";
import { Pagina } from "./Pagina.js";

import { Proceso } from "./Proceso.js";
export class MMU {
  constructor() {
    this.procesos = {}; // {pid: Proceso}
    this.memoriaVirtual = [];
    this.memoriaReal = [];
    this.tamanioPagina = COMPUTER_SPECS.TAMANNO_PAGINA_EN_KB;
    this.RAM = COMPUTER_SPECS.RAM_EN_KB;
    this.espacioDiscoDuro = COMPUTER_SPECS.ESPACIO_DISCO_DURO; //en KB
    this.MAXIMAS_PAGINAS = this.RAM / this.tamanioPagina; //Cuantas paginas caben en la RAM
    this.paginasPunteros = {}; // {ptr: Lista paginas}
    this.cantidadProcesor = 0;
    this.contadorPaginas = 0; //cuantas paginas se han creado
    //se utiliza para generar pid
    this.contadorPunteros = 0; //cuantos punteros se han creado
    this.memoriaRealKB = 0; //Cuanta memoria real se ha utilizado
    this.memoriaVirtualKB = 0; //Cuanta memoria virtual se ha utilizado
    this.fragmentacion = 0;
    this.fragmentacionPorPagina = {}; //que paginas tienen fragmentacion

    //techs segun el algoritmo
    this.FIFOQUEUE = []; //FIFO
    this.SECONDCHANCEQUEUE = []; //Second chance
    this.OPTIMOPAGES = {}; //Optimo

    // Color
    this.posicionesActualizar = []; //Lleva control de que paginas se han actualizado
  }

  /**
   * Prepara un diccionario interno con los indices de los usos de cada página
   * @param {Array} instrucciones - La lista de instrucciones a preparar.
   * @returns {void}
   */

  devolverProcesoVivos() {
    return Object.values(this.procesos).filter((p) => p.estado !== "MUERTO")
      .length;
  }
  prepararListaOptimo(instrucciones) {
    console.log(instrucciones);
    instrucciones.forEach(([tipo, args], index) => {
      if (tipo === "use") {
        const ptr = args[0]; //Obtener el puntero
        if (!this.OPTIMOPAGES[ptr]) {
          this.OPTIMOPAGES[ptr] = []; //Si no existe, annadir al diccionario
        }
        this.OPTIMOPAGES[ptr].push(index); //Empujar el indice de la instruccion al diccionario
      }
    });
  }

  /**
   * Obtiene todas las páginas asociadas a un puntero.
   * @param {string} ptr - El puntero del que se quieren obtener las páginas.
   * @returns {Array} Un array con las páginas asociadas al puntero.
   * */
  obtenerPaginasPorPtr(ptr) {
    if (!this.paginasPunteros.hasOwnProperty(ptr)) {
      console.warn(`El puntero ${ptr} no existe en la MMU.`);
      return [];
    }
    return this.paginasPunteros[ptr];
  }
  /**
   * Crea un nuevo proceso y lo añade a la lista de procesos.
   * @param {number} pid - El identificador del proceso.
   * @returns {object} El nuevo proceso creado.
   */
  crearProceso(pid) {
    if (!this.procesos[pid]) {
      const nuevoProceso = new Proceso(pid);
      this.procesos[pid] = nuevoProceso;
      return 0;
    } else {
      console.log(
        "No se puede crear un nuevo proceso, ya existe uno con ese PID."
      );
      return -1;
    }
  }
  /**
   * Limpia los procesos, y genera N cantidad de procesos
   * @param {number} cantidadProceso - Cuantos procesos se van a crear.
   * @returns {void}
   */

  generarProcesosDesdeLista(pids) {
    this.procesos = {}; // Reinicia la lista de procesos
    this.cantidadProcesor = 0;

    for (const pid of pids) {
      this.crearProceso(pid);
      this.cantidadProcesor++;
    }
    console.log("Se han creado los procesos:", this.procesos);
  }
  /*
  
    * Crea una nueva página y la añade a la memoria virtual.
    * @param {number} tamannoKB - El tamaño de la página en KB.
    * @param {number} pid - El identificador del proceso.
    * @returns {number} El puntero a la página creada o -1 si no hay suficiente RAM.
    */
  metodoNew(tamannoKB, pid) {
    if (tamannoKB > this.RAM) {
      console.log("No se puede crear la página, no hay suficiente RAM.");
      return -1;
    }
    const proceso = this.procesos[pid];
    if (!proceso) {
      console.log("No se puede crear la página, el proceso no existe.");
      return -1;
    }
    if (proceso.estado === "MUERTO") {
      console.log("No se puede crear la página, el proceso está muerto.");
      return -1;
    }
    const paginasNecesarias = Math.ceil(tamannoKB / this.tamanioPagina);
    //Asociar ptr a las paginas

    //const idPtr = `ptr${this.contadorPaginas}${pid}`;
    this.contadorPunteros++;
    const idPtr = `${this.contadorPunteros}`;

    const paginasCreadas = [];

    for (let i = 0; i < paginasNecesarias; i++) {
      const pagina = new Pagina(pid, idPtr, this.contadorPaginas);
      let direccionEnDiscoAsignar = this.memoriaVirtual.indexOf(null);
      //Si hay algun espacio vacio en memoria virtual usarlo
      if (direccionEnDiscoAsignar === -1) {
        //Si no hay espacio vacio, asignar la siguiente direccion
        pagina.setDireccionEnDisco(this.memoriaVirtual.length);
        this.memoriaVirtual.push(pagina);
      } else {
        this.memoriaVirtual[direccionEnDiscoAsignar] = pagina;
        pagina.setDireccionEnDisco(direccionEnDiscoAsignar);
        //Si no hay espacio vacio, asignar la siguiente direccion
      }
      //calcular fragmentacion
      if (i === paginasNecesarias - 1) {
        const totalKB = tamannoKB;
        const residuo = totalKB % this.tamanioPagina;

        if (residuo !== 0) {
          const desperdicio = this.tamanioPagina - residuo;
          this.fragmentacionPorPagina[pagina.numeroPagina] = desperdicio;
          this.fragmentacion += desperdicio;
        }
      }

      this.contadorPaginas++;

      paginasCreadas.push(pagina);
    }
    this.memoriaVirtualKB +=
      paginasNecesarias * COMPUTER_SPECS.TAMANNO_PAGINA_EN_KB;
    this.paginasPunteros[idPtr] = paginasCreadas;
    return idPtr;
  }
  /**
   * Carga una página en RAM.
   * @param {string} ptr - El puntero de la página a cargar.
   * @param {number} reloj - El timestamp actual.
   * @returns {void}
   
   */
  metodoUse(ptr, reloj, algoritmo) {
    const paginas = this.paginasPunteros[ptr];
    //Esta condicion se deberia validar antes
    //Dado que el algoritmo optimo ve el futuro
    //No deberia de ocurrir esta condicion, dado que se valido
    //que el lenguaje fuera correcto antes
    let timestampDeCarga = reloj;
    let delay = 0;
    let thrashing = 0;
    if (!paginas) {
      console.log("No se puede usar la página, el puntero no existe.");
      return -1;
    }
    const paginasAgregadas = [];
    const paginasEliminadas = [];
    const paginasQuePermanecen = [];
    for (let pagina of paginas) {
      if (!pagina.estaEnRam) {
        //Cargar pagina devolveria la pagina actualizada y la que elimino
        const { paginaAgregada, paginaEliminada, posicion } =
          this.cargarPaginaEnRam(pagina, algoritmo);

        timestampDeCarga += 5;
        delay += 5;
        thrashing += 5;
        if (algoritmo === "MRU" || algoritmo === "LRU") {
          paginaAgregada.marcado = timestampDeCarga;
          paginaAgregada.timestampDeCarga = timestampDeCarga;
          pagina.marcado = timestampDeCarga;
        }
        paginaAgregada.timestampDeCarga = timestampDeCarga;
        paginasAgregadas.push(paginaAgregada);
        if (paginaEliminada) {
          paginasEliminadas.push(paginaEliminada);
        }
        pagina.timestampDeCarga = timestampDeCarga;
      } else {
        console.log(`Pagina ya esta en ram ${pagina.id}`);
        timestampDeCarga += 1;
        if (algoritmo === "MRU" || algoritmo === "LRU") {
          pagina.marcado = timestampDeCarga;
        }

        delay += 1;

        //Implementa logica de colorear o algo
        //actualizar timestamp

        paginasQuePermanecen.push(pagina);
      }
    }
    return {
      paginasAgregadas,
      paginasEliminadas,
      paginasQuePermanecen,
      delay,
      thrashing,
    };
  }
  cargarPaginaEnRam(pagina, algoritmo) {
    const paginasMax = this.MAXIMAS_PAGINAS;
    let paginaAsignada = null;
    let paginaEliminada = null;
    let posicionAsignada = null;

    // Si hay espacio en RAM, asignar la página directamente
    const posicionEnRamVacia = this.memoriaReal.indexOf(null);
    if (posicionEnRamVacia !== -1) {
      this.memoriaReal[posicionEnRamVacia] = pagina;
      pagina.estaEnRam = true;
      pagina.direccionEnRam = posicionEnRamVacia + 1; //+1 para que no se detecte como NULL
      posicionAsignada = posicionEnRamVacia;
      if (algoritmo === "FIFO") {
        this.FIFOQUEUE.push(pagina);
      } else if (algoritmo === "Second Chance") {
        pagina.marcado = "X"; //Marca la pagina como que aun tiene second chance
        this.SECONDCHANCEQUEUE.push(pagina);
      }

      this.memoriaRealKB += this.tamanioPagina;
      console.log(`Página ${pagina.numeroPagina} cargada en RAM.`);
    }
    //Si no hay espacio espacios vacios, pero hay espacio en RAM
    else if (this.memoriaReal.length < paginasMax) {
      pagina.estaEnRam = true;
      pagina.direccionEnRam = this.memoriaReal.length + 1; //+1 para que no se detecte como NULL
      posicionAsignada = this.memoriaReal.length;
      this.memoriaReal.push(pagina);

      if (algoritmo === "FIFO") {
        this.FIFOQUEUE.push(pagina);
      } else if (algoritmo === "Second Chance") {
        pagina.marcado = "X"; //Marca la pagina como que aun tiene second chance
        this.SECONDCHANCEQUEUE.push(pagina);
      }
      this.memoriaRealKB += this.tamanioPagina;
      console.log(`Página ${pagina.numeroPagina} cargada en RAM.`);
    } else {
      switch (algoritmo) {
        case "FIFO":
          paginaEliminada = this.FIFOQUEUE.shift();
          paginaEliminada.estaEnRam = false;
          paginaEliminada.direccionEnRam = null;
          posicionAsignada = this.memoriaReal.indexOf(paginaEliminada);
          if (posicionAsignada !== -1) {
            pagina.estaEnRam = true;
            pagina.direccionEnRam = posicionAsignada;
            this.memoriaReal[posicionAsignada] = pagina;
            this.FIFOQUEUE.push(pagina);

            console.log(`Página ${pagina.numeroPagina} cargada en RAM.`);
          }
          break;

        case "Second Chance":
          while (true) {
            if (this.SECONDCHANCEQUEUE.length === 0) {
              console.warn(
                "La cola de Second Chance está vacía. No se puede reemplazar."
              ); //No deberia de ocurrir, pero por si acaso
              break;
            }
            paginaEliminada = this.SECONDCHANCEQUEUE.shift();
            if (paginaEliminada.marcado === "X") {
              paginaEliminada.marcado = 0; //Marca la pagina como que ya no tiene second chance
              //Si la pagina tiene second chance, se le da otra oportunidad
              this.SECONDCHANCEQUEUE.push(paginaEliminada);

              console.log(
                `Página ${paginaEliminada.numeroPagina} perdió su second chance.`
              );
              continue;
            }
            //Si la pagina no tiene second chance, se elimina
            paginaEliminada.estaEnRam = false;
            paginaEliminada.direccionEnRam = null;
            posicionAsignada = this.memoriaReal.indexOf(paginaEliminada);
            if (posicionAsignada !== -1) {
              pagina.estaEnRam = true;
              pagina.marcado = "X"; //Marca la pagina como que aun tiene second chance
              pagina.direccionEnRam = posicionAsignada;
              this.memoriaReal[posicionAsignada] = pagina;

              this.SECONDCHANCEQUEUE.push(pagina);

              console.log(`Página ${pagina.numeroPagina} cargada en RAM.`);
              break;
            }
          }

          break;

        case "OPTIMO":
          let distanciaMasLejana = -1;
          let indiceMasLejano = -1;
          for (let i = 0; i < this.memoriaReal.length; i++) {
            const paginaEnRam = this.memoriaReal[i];
            const usosFuturos = this.OPTIMOPAGES[paginaEnRam.puntero] || [];
            if (usosFuturos.length === 0) {
              distanciaMasLejana = Infinity;
              indiceMasLejano = i;
              break;
            } else {
              const siguienteUso = usosFuturos[0];
              if (siguienteUso > distanciaMasLejana) {
                distanciaMasLejana = siguienteUso;
                indiceMasLejano = i;
              }
            }
          }

          paginaEliminada = this.memoriaReal[indiceMasLejano];
          pagina.estaEnRam = true;
          pagina.direccionEnRam = indiceMasLejano;
          posicionAsignada = indiceMasLejano;
          this.memoriaReal[indiceMasLejano] = pagina;

          break;
        case "MRU":
          const paginaMasReciente = this.memoriaReal.reduce(
            (másReciente, actual) => {
              return actual.marcado > másReciente.marcado
                ? actual
                : másReciente;
            }
          );

          paginaEliminada = paginaMasReciente;
          posicionAsignada = this.memoriaReal.indexOf(paginaEliminada);

          paginaEliminada.estaEnRam = false;
          paginaEliminada.direccionEnRam = null;

          pagina.estaEnRam = true;
          pagina.direccionEnRam = posicionAsignada;
          //EL TIMESTAMP SE ACTUALIZA AFUERA DE ESTA FUNCION
          this.memoriaReal[posicionAsignada] = pagina;

          console.log(`Reemplazada página más reciente con MRU.`);
          break;
        case "LRU":
          const paginaMenosReciente = this.memoriaReal.reduce(
            (menosReciente, actual) => {
              return actual.marcado < menosReciente.marcado
                ? actual
                : menosReciente;
            }
          );

          paginaEliminada = paginaMenosReciente;
          posicionAsignada = this.memoriaReal.indexOf(paginaEliminada);

          paginaEliminada.estaEnRam = false;
          paginaEliminada.direccionEnRam = null;

          pagina.estaEnRam = true;
          pagina.direccionEnRam = posicionAsignada;
          //EL TIMESTAMP SE ACTUALIZA AFUERA DE ESTA FUNCION
          this.memoriaReal[posicionAsignada] = pagina;

          console.log(`Reemplazada página más reciente con LRU.`);
          break;
        case "Random":
          const totalPaginas = this.memoriaReal.length;
          const indiceAleatorio = Math.floor(Math.random() * totalPaginas);
          paginaEliminada = this.memoriaReal[indiceAleatorio];
          posicionAsignada = indiceAleatorio;

          paginaEliminada.estaEnRam = false;
          paginaEliminada.direccionEnRam = null;

          pagina.estaEnRam = true;
          pagina.direccionEnRam = indiceAleatorio;
          pagina.timestampDeCarga = Date.now(); // o reloj lógico si estás usando uno

          this.memoriaReal[indiceAleatorio] = pagina;
          break;

        default:
          console.log("Algoritmo no reconocido.", algoritmo);
          return -1;
      }
    }
    //APLICAR MARCAS SEGUN ALGORITMO
    if (algoritmo === "Second Chance") {
      pagina.marcado = "X"; //Marca la pagina como que aun tiene second chance
    }

    this.posicionesActualizar.push(posicionAsignada);
    return {
      paginaAgregada: pagina,
      paginaEliminada,
      posicion: posicionAsignada,
    };
  }

  metodoKill(pid) {
    const proceso = this.procesos[pid];
    if (!proceso) {
      console.log("No se puede matar el proceso, el proceso no existe.");
      return -1;
    }
    proceso.estado = "MUERTO";
    const paginasEliminadas = [];
    //Matar la memoria que era de ese proceso
    for (const ptr in this.paginasPunteros) {
      const paginas = this.paginasPunteros[ptr];
      if (paginas.length > 0 && paginas[0].pid === pid) {
        paginasEliminadas.push(...paginas);
        for (let i = 0; i < this.memoriaReal.length; i++) {
          if (paginas.includes(this.memoriaReal[i])) {
            this.memoriaReal[i] = null;
            this.posicionesActualizar.push(i); //Annadir a las posiciones a actualizar en ram
            this.memoriaRealKB -= this.tamanioPagina; //Restar el tamaño de la pagina
          }
        }
        for (let i = 0; i < this.memoriaVirtual.length; i++) {
          if (paginas.includes(this.memoriaVirtual[i])) {
            this.memoriaVirtual[i] = null; //Vaciar del disco
            this.memoriaVirtualKB -= this.tamanioPagina; //Restar el tamaño de la pagina
          }
        }

        if (this.fragmentacionPorPagina) {
          paginas.forEach((pagina) => {
            const numero = pagina.numeroPagina;
            if (this.fragmentacionPorPagina[numero] !== undefined) {
              this.fragmentacion -= this.fragmentacionPorPagina[numero];
              delete this.fragmentacionPorPagina[numero];
            }
          });
        }
        delete this.paginasPunteros[ptr];
      }
    }
    return paginasEliminadas;
  }
  metodoDelete(ptr) {
    const paginas = this.paginasPunteros[ptr];

    if (!paginas) {
      console.log("No se puede eliminar la página, el puntero no existe.");
      return -1;
    }
    //ALGO SIMILAR HAY QUE HACER CON RAM,
    // AUN NO ESTA HECHO
    for (let i = 0; i < this.memoriaReal.length; i++) {
      if (paginas.includes(this.memoriaReal[i])) {
        this.memoriaReal[i] = null;
        this.posicionesActualizar.push(i); //Annadir a las posiciones a actualizar en ram
        this.memoriaRealKB -= this.tamanioPagina; //Restar el tamaño de la pagina
      }
    }

    for (let i = 0; i < this.memoriaVirtual.length; i++) {
      if (paginas.includes(this.memoriaVirtual[i])) {
        this.memoriaVirtual[i] = null; //Vaciamos del disco digamos
        this.memoriaVirtualKB -= this.tamanioPagina; //Restar el tamaño de la pagina
      }
    }

    if (this.fragmentacionPorPagina) {
      paginas.forEach((pagina) => {
        const numero = pagina.numeroPagina;
        if (this.fragmentacionPorPagina[numero] !== undefined) {
          this.fragmentacion -= this.fragmentacionPorPagina[numero];
          delete this.fragmentacionPorPagina[numero];
        }
      });
    }

    delete this.paginasPunteros[ptr];
    console.log(`Página ${ptr} eliminada.`);
    return paginas;
  }
}
