import { Instruccion } from "../constants/instrucciones.js";
import { TAMANNO_PAGINA_EN_KB } from "../constants/computerSpecs.js";
import * as COMPUTER_SPECS from "../constants/computerSpecs.js";
export function leerArchivoInstrucciones(archivo) {
  const instrucciones = []; //[TIPO INSTRUCCION, ARGUMENTOS, NUMERO DE LINEA]
  const errores = []; // [{tipo, linea, contenido, argumentos}]
  const lineas = archivo.split("\n");
  const regex = /^\s*(\w+)\s*\(([^)]*)\)/i; //regex de palabra(argumentos)
  const regexArgumentos = /(\w+)\s*=\s*([^,]+)/g; //regex de argumentos=valor
  const tiposValidos = Object.values(Instruccion);

  for (let i = 0; i < lineas.length; i++) {
    const lineaOriginal = lineas[i];
    const sinComentario = lineaOriginal.split("//")[0].trim();
    if (sinComentario === "") {
      continue; // línea vacía o solo comentario
    }
    const match = sinComentario.match(regex);
    if (!match) {
      errores.push({
        tipo: "invalida",
        linea: i + 1,
        contenido: lineaOriginal.trim(),
        argumentos: [],
      });
      continue;
    }

    const tipoRaw = match[1].toLowerCase();
    const argsTexto = match[2];
    const argumentos = argsTexto
      .split(",")
      .map((a) => parseInt(a.trim()))
      .filter((n) => !isNaN(n));

    if (!tiposValidos.includes(tipoRaw)) {
      errores.push({
        tipo: tipoRaw,
        linea: i + 1,
        contenido: lineaOriginal.trim(),
        argumentos: [],
      });
      continue;
    }
    const cantidadEsperada = tipoRaw === "new" ? 2 : 1;
    if (argumentos.length !== cantidadEsperada) {
      errores.push({
        tipo:
          "argumentosInvalidos, se esperaban " +
          cantidadEsperada +
          " Se recibieron " +
          argumentos.length,
        linea: i + 1,
        contenido: lineaOriginal.trim(),
        argumentos,
      });
      continue;
    }

    instrucciones.push([tipoRaw, argumentos, i + 1]);
  }
  return { instrucciones, errores };
}

export function validarSemanticaDesdeArchivo(instrucciones) {
  const errores = [];
  const punterosCreados = new Set();
  const procesosVivos = new Set();
  const procesosEliminados = new Set();
  let contadorPunteros = 0;
  let totalPaginasNecesarias = 0;

  for (const [tipo, args, linea] of instrucciones) {
    switch (tipo) {
      case Instruccion.NEW:
        const [pid, tamannoKB] = args;

        if (procesosEliminados.has(pid)) {
          errores.push({
            tipo: "procesoInvalido",
            linea,
            contenido: `Proceso ${pid} fue eliminado anteriormente con kill.`,
            argumentos: args,
          });
        } else if (
          Math.ceil(tamannoKB / TAMANNO_PAGINA_EN_KB) >
          COMPUTER_SPECS.MAXIMA_PAGINAS
        ) {
          errores.push({
            tipo: "procesoInvalido",
            linea,
            contenido: `Proceso ${pid} no puede crear tantas paginas. Maximo ${COMPUTER_SPECS.MAXIMA_PAGINAS} paginas.`,
            argumentos: args,
          });
        } else if (tamannoKB <= 0) {
          errores.push({
            tipo: "procesoInvalido",
            linea,
            contenido: `Proceso ${pid} no puede crear paginas de tamaño negativo o 0.`,
            argumentos: args,
          });
        } else {
          // Annadir a vivos
          procesosVivos.add(pid);
          //Si aun no existe el proceso, lo agrego a la lista de procesos vivos
          const paginasNecesarias = Math.ceil(tamannoKB / TAMANNO_PAGINA_EN_KB);

          totalPaginasNecesarias += paginasNecesarias;
          contadorPunteros++;
          punterosCreados.add(contadorPunteros);
        }
        break;
      case Instruccion.USE:
        const [ptrUso] = args;
        if (!punterosCreados.has(ptrUso)) {
          errores.push({
            tipo: "punteroInvalido",
            linea,
            contenido: `Puntero ${ptrUso} no existe o ya fue eliminado. USE`,
            argumentos: args,
          });
        }
        break;
      case Instruccion.KILL:
        const [pidKill] = args;
        if (procesosVivos.has(pidKill)) {
          procesosVivos.delete(pidKill);
          procesosEliminados.add(pidKill);
        } else if (procesosEliminados.has(pidKill)) {
          errores.push({
            tipo: "procesoInvalido",
            linea,
            contenido: `Proceso ${pidKill} ya fue eliminado anteriormente.`,
            argumentos: args,
          });
        } else {
          // Matamos el proceso, a pesar de que nunca fue utilizado
          procesosEliminados.add(pidKill);
        }

        break;
      case Instruccion.DELETE:
        const [ptrDelete] = args;
        if (!punterosCreados.has(ptrDelete)) {
          errores.push({
            tipo: "punteroInvalido",
            linea,
            contenido: `Puntero ${ptrDelete} no existe, o ya fue eliminado. USE`,
            argumentos: args,
          });
        } else {
          punterosCreados.delete(ptrDelete);
        }

        break;
      default:
        break;
    }
  }
  console.log("Paginas necesarias:", totalPaginasNecesarias);
  return {
    errores,
    totalPaginasNecesarias,
    pidsFinales: Array.from(
      new Set([...procesosVivos, ...procesosEliminados])
    ).sort((a, b) => a - b),
  };
}
export function validarSemantica(instrucciones, cantidadP) {
  const errores = [];
  const punterosCreados = new Set();
  const procesosVivos = new Set();
  let contadorPunteros = 0;
  let totalPaginasNecesarias = 0;

  for (let i = 0; i < cantidadP; i++) {
    procesosVivos.add(i + 1); //Procesos de 1 a P
  }
  for (const [tipo, args, linea] of instrucciones) {
    switch (tipo) {
      case Instruccion.NEW:
        const [pid, tamannoKB] = args;
        if (pid > cantidadP || pid < 1) {
          errores.push({
            tipo: "procesoInvalido",
            linea,
            contenido: `Proceso ${pid} no existe. Solo existen procesos de 1 a ${cantidadP}.`,
            argumentos: args,
          });
        } else if (!procesosVivos.has(pid)) {
          errores.push({
            tipo: "procesoInvalido",
            linea,
            contenido: `Proceso ${pid}  fue eliminado anteriormente.`,
            argumentos: args,
          });
        } else {
          const paginasNecesarias = Math.ceil(tamannoKB / TAMANNO_PAGINA_EN_KB);
          totalPaginasNecesarias += paginasNecesarias;
          punterosCreados.add(contadorPunteros);
          contadorPunteros++;
        }
        break;
      case Instruccion.USE:
        const [ptrUso] = args;
        if (!punterosCreados.has(ptrUso)) {
          errores.push({
            tipo: "punteroInvalido",
            linea,
            contenido: `Puntero ${ptrUso} no existe. USE`,
            argumentos: args,
          });
        }
        break;
      case Instruccion.KILL:
        const [pidKill] = args;
        if (!procesosVivos.has(pidKill)) {
          errores.push({
            tipo: "procesoInvalido",
            linea,
            contenido: `Proceso ${pidKill} no existe. KILL`,
            argumentos: args,
          });
        } else {
          procesosVivos.delete(pidKill);
        }
        break;
      case Instruccion.DELETE:
        const [ptrDelete] = args;
        if (!punterosCreados.has(ptrDelete)) {
          errores.push({
            tipo: "punteroInvalido",
            linea,
            contenido: `Puntero ${ptrDelete} no existe. USE`,
            argumentos: args,
          });
        } else {
          punterosCreados.delete(ptrDelete);
        }

        break;
      default:
        break;
    }
  }
  return { errores, totalPaginasNecesarias };
}
