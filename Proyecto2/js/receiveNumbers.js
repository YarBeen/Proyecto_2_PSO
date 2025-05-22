let listaMemoria = [];
import { Estadistica, AtributosPagina } from "./constants/Valores-Tabla.js";
const acciones = ["FIFO", , "Second Chance", "MRU", "Random", "LRU"];
let algoritmoSeleccionado = "FIFO";
let currentStep = 0; // Paso actual del algoritmo
let tablaCeldas = []; // guardar las celdas de la tabla
let memoriaActual = []; // Lo que esta en memoria actualmente
let marcos = 100; // Páginas de memoria
let cantidadPaginasNecesarias = 0; // Total de páginas necesarias
let instruccionesGlobales = []; // Instrucciones leídas del archivo
let procesosGlobales = [];
window.onload = () => {
  //Cargar el dropdown de algortimos al cargar la página
  const container = document.getElementById("algoritmosContainer");

  const label = document.createElement("label");
  label.setAttribute("for", "actionSelect");
  label.textContent = "Escoger un algoritmo:";

  const select = document.createElement("select");
  select.id = "actionSelect";

  acciones.forEach((accion) => {
    const option = document.createElement("option");
    option.value = accion;
    option.textContent = accion.charAt(0).toUpperCase() + accion.slice(1);
    select.appendChild(option);
  });

  container.appendChild(label);
  container.appendChild(select);
};

function generarTablaDePaginas(nombre, contenedor) {
  if (
    typeof instruccionesGlobales === "undefined" ||
    instruccionesGlobales.length === 0
  ) {
    alert("Cargar instrucciones primero.");
    return;
  }

  if (
    typeof cantidadPaginasNecesarias === "undefined" ||
    cantidadPaginasNecesarias <= 0
  ) {
    alert("No se ha calculado la cantidad de páginas necesarias.");
    return;
  }
  //Contiene la tabla de paginas y los stats
  const wrapper = document.createElement("div");
  wrapper.classList.add("contenedor-tabla-paginas");
  wrapper.id = `wrapper-paginas-${nombre}`;

  const scroll = document.createElement("div");
  scroll.classList.add("scroll-tabla");

  const tabla = document.createElement("table");
  tabla.classList.add("tabla-marcos");

  // Encabezado de la tabla
  const filaEncabezado = document.createElement("tr");
  const columnas = [
    "ID Página",
    AtributosPagina.PID,
    AtributosPagina.EN_RAM,
    AtributosPagina.DIRECCION_DISCO,
    AtributosPagina.DIRECCION_RAM,
    AtributosPagina.PUNTERO,
    AtributosPagina.TIMESTAMP_DE_CARGA,
    AtributosPagina.MARCADO,
  ];

  columnas.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col;
    filaEncabezado.appendChild(th);
  });

  const thead = document.createElement("thead");
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  // Filas de páginas (solo ID llenado, resto vacío)
  for (let i = 0; i < cantidadPaginasNecesarias; i++) {
    const fila = document.createElement("tr");

    const celdaId = document.createElement("td");
    celdaId.textContent = `P${i}`;
    celdaId.id = `pagina-${i}-${nombre}`; // Ej: pagina-0-OPTIMO
    fila.appendChild(celdaId);

    // Agregar columnas vacías
    for (let j = 1; j < columnas.length; j++) {
      const celda = document.createElement("td");
      celda.textContent = ""; // Vacío por ahora
      fila.appendChild(celda);
    }

    tabla.appendChild(fila);
  }

  scroll.appendChild(tabla);
  wrapper.appendChild(scroll);

  // Agregar estadísticas
  const stats = document.createElement("div");
  stats.classList.add("stats-paginas");

  const tablaStats = document.createElement("table");
  const datos = [
    ["Algoritmo", nombre],
    [Estadistica.PROCESOS, ""],
    [Estadistica.TIEMPO_SIMULACION, ""],
    [Estadistica.RAM_KB, ""],
    [Estadistica.RAM_PORCENTAJE, ""],
    [Estadistica.V_RAM_KB, ""],
    [Estadistica.V_RAM_PORCENTAJE, ""],

    [Estadistica.THRASING, ""],
    [Estadistica.THRASING_PORCENTAJE, ""],
    [Estadistica.FRAGMENTACION, ""],
  ];
  const diccionarioReferencias = {}; // Guardar referencias a el valor de cada Stat
  datos.forEach(([label, valor]) => {
    const fila = document.createElement("tr");

    const celdaLabel = document.createElement("td");
    celdaLabel.textContent = label;

    const celdaValor = document.createElement("td");
    celdaValor.textContent = valor;
    const idValor = `${label.replace(/\s+/g, "-")}-${nombre}`; //Ejemplo: "RAM-KB-FIFO"
    celdaValor.id = idValor;

    fila.appendChild(celdaLabel);
    fila.appendChild(celdaValor);
    tablaStats.appendChild(fila);
  });

  const gridWrapper = document.createElement("div");
  gridWrapper.classList.add("grid--ram-wrapper");

  const gridRam = document.createElement("div");
  gridRam.classList.add("grid-ram");
  gridRam.id = `grid-ram-${nombre}`;

  const totalMarcos = marcos || 100;
  for (let i = 0; i < totalMarcos; i++) {
    const celda = document.createElement("div");
    celda.classList.add("celda-ram");
    celda.id = `ram-${i}-${nombre}`; // Ejemplo: ram-5-FIFO
    gridRam.appendChild(celda);
  }
  const tituloRam = document.createElement("h3");
  tituloRam.textContent = `RAM ${nombre}`;
  tituloRam.classList.add("titulo-ram");
  gridWrapper.appendChild(tituloRam);
  gridWrapper.appendChild(gridRam);
  stats.appendChild(tablaStats);
  wrapper.appendChild(stats);
  wrapper.appendChild(gridWrapper);

  contenedor.appendChild(wrapper);
}

function generarTablaDeAlgoritmo(nombre, contenedor) {
  const scroll = document.createElement("div");
  scroll.classList.add("scroll-tabla");
  const tabla = document.createElement("table");

  tabla.classList.add("tabla-marcos");

  // Encabezado
  const filaEncabezado = document.createElement("tr");
  const celdaTitulo = document.createElement("th");
  celdaTitulo.textContent = `Instrucciones (Tabla ${nombre})`;
  filaEncabezado.appendChild(celdaTitulo);

  instruccionesGlobales.forEach(([tipo, argumentos]) => {
    const th = document.createElement("th");
    th.textContent = `${tipo}(${argumentos.join(", ")})`;
    filaEncabezado.appendChild(th);
  });
  const thead = document.createElement("thead");
  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  // Filas de marcos
  for (let i = 0; i < marcos; i++) {
    const fila = document.createElement("tr");
    const celdaMarco = document.createElement("td");
    celdaMarco.textContent = `Marco ${i}`;
    fila.appendChild(celdaMarco);

    for (let j = 0; j < instruccionesGlobales.length; j++) {
      const celda = document.createElement("td");
      celda.textContent = ""; // Inicialmente vacío
      fila.appendChild(celda);
    }

    tabla.appendChild(fila);
  }
  scroll.appendChild(tabla);
  contenedor.appendChild(scroll);

  contenedor.appendChild(document.createElement("br"));
}
function generarTablas() {
  if (instruccionesGlobales.length === 0 || !instruccionesGlobales) {
    alert("Cargar un archivo primero.");
    return;
  }
  const valorMarcos = parseInt(document.getElementById("inputMarcos").value);
  if (!isNaN(valorMarcos) && valorMarcos > 0) {
    marcos = valorMarcos;
  }

  const contenedorRAM = document.getElementById("tablaRam");
  const contenedorPaginas = document.getElementById("tablaPaginas");
  contenedorPaginas.innerHTML = ""; // Limpiar si hubo una tabla antes
  contenedorRAM.innerHTML = ""; // Limpiar si hubo una tabla antes
  algoritmoSeleccionado = document.getElementById("actionSelect").value;
  //Estas comentadas serian las tablas de Ram
  //generarTablaDeAlgoritmo(algoritmoSeleccionado, contenedorRAM);
  //generarTablaDeAlgoritmo("OPTIMO", contenedorRAM);

  //Tablas de paginas
  generarTablaDePaginas(algoritmoSeleccionado, contenedorPaginas);
  generarTablaDePaginas("OPTIMO", contenedorPaginas);

  //Annadir boton de correr simulacion
  const contenedorTablas = document.getElementById("contenedor-tablas");
  const btnExistente = document.getElementById("btnRunSimulacion");

  // Si ya existe un botón de simulación, lo reemplazamos por uno nuevo
  if (btnExistente) {
    contenedorTablas.removeChild(btnExistente);
  }
  const btnRun = document.createElement("button");
  btnRun.id = "btnRunSimulacion";
  btnRun.textContent = "Correr simulaciones";
  btnRun.classList.add("btn-run");
  btnRun.onclick = runBarryRun;

  contenedorTablas.appendChild(btnRun);
}
//Funcion utilizada para la tabla anterior
//Invalida y se tiene solo de referencia
function showNumbers() {
  const input = document.getElementById("numberInput").value;
  const warning = document.getElementById("warning");
  const numberList = input.split(",").map((num) => num.trim());

  const isValid = numberList.every((num) => !isNaN(num) && num !== "");

  if (!isValid) {
    warning.textContent =
      "Escribe solo números, con el siguiente formato. Ejemplo: 1, 2, 3, 4, 5";
    return;
  } else {
    warning.textContent = ""; // Vaciar el mensaje de advertencia
  }
  //Actualizar la cantidad de marcos
  const valorMarcos = parseInt(document.getElementById("inputMarcos").value);
  if (!isNaN(valorMarcos) && valorMarcos > 0) {
    marcos = valorMarcos;
  }

  listaMemoria = [];

  numberList.forEach((num) => {
    listaMemoria.push({
      numero: Number(num),
      //timestamp: Date.now(),
    });
  });
  console.log(listaMemoria);
  selectedAlgorithm = document.getElementById("actionSelect").value;
  currentStep = 0;
  memoriaActual = [];
  nextStepFIFO.indice = 0; // Reiniciar el índice para FIFO, como propiedad de la función

  generarTablaLRU(listaMemoria, marcos); //
}
function nextStep() {
  switch (selectedAlgorithm) {
    case "FIFO":
      nextStepFIFO();
      break;
    case "LRU":
      nextStepLRU();
      break;
    case "MRU":
      nextStepMRU();
      break;
    case "OPTIMO":
      nextStepOPTIMO();
      break;
    default:
      alert("Algoritmo no reconocido.");
  }
}
function nextStepFIFO() {
  if (typeof nextStepFIFO.indice === "undefined") {
    nextStepFIFO.indice = 0; // Inicializar el índice si no está definido
    //Se guarda como propiedad de la función para que no se reinicie al llamar a nextStepFIFO
    //Se utiliza para saber que pagina se va a eliminar
  }

  if (currentStep >= listaMemoria.length) {
    alert("Fin del algoritmo FIFO");
    return;
  }

  const pagina = listaMemoria[currentStep].numero;
  let eliminado = null;
  let agregado = null;
  let existe = null;

  if (memoriaActual.includes(pagina)) {
    existe = pagina;
  } else {
    if (memoriaActual.length < marcos) {
      memoriaActual.push(pagina);
    } else {
      eliminado = memoriaActual[nextStepFIFO.indice];
      memoriaActual[nextStepFIFO.indice] = pagina;
    }

    agregado = pagina;
    //Se utiliza modulo para que el índice no se salga del rango de marcos
    //Si el índice es 4 y hay 4 marcos, se reinicia a 0
    nextStepFIFO.indice = (nextStepFIFO.indice + 1) % marcos;
  }

  actualizarTabla(memoriaActual, currentStep, { agregado, eliminado, existe });
  currentStep++;
}

function actualizarTabla(memoria, paso, opciones = {}) {
  const tabla = document.querySelector(".tabla-marcos");

  for (let i = 0; i < marcos; i++) {
    const fila = tabla.rows[i + 1];
    const celda = fila.cells[paso + 1];

    celda.textContent = memoria[i] !== undefined ? memoria[i] : "";

    // Limpiar las celdas de estilos anteriores
    celda.className = "";

    // Aplicar color según acción
    if (opciones.agregado === memoria[i]) {
      celda.classList.add("agregado");
    } else if (opciones.existe === memoria[i]) {
      celda.classList.add("existe");
    }
  }

  // Si se borro algo marcarlo en la pagina pasado
  if (opciones.eliminado && paso > 0) {
    for (let i = 0; i < marcos; i++) {
      const filaAnterior = tabla.rows[i + 1];
      const celdaAnterior = filaAnterior.cells[paso];
      if (celdaAnterior.textContent == opciones.eliminado) {
        celdaAnterior.className = "eliminado";
      }
    }
  }
}
function ejecutarAlgoritmo(lista, accion) {
  switch (accion) {
    case "FIFO":
      alert(`FIFO`);
      break;
    case "LRU":
      alert(`LRU`);
      break;
    case "MRU":
      alert(`MRU`);
      break;
    case "OPTIMO":
      alert(`OPTIMO`);

    default:
      alert("Algoritmo no reconocido.");
  }
}
function generarTablaLRU(paginas, cantidadMarcos) {
  const contenedor = document.getElementById("tablaRam");
  contenedor.innerHTML = ""; // Limpiar contenido anterior

  const tabla = document.createElement("table");
  tabla.classList.add("tabla-marcos");

  // Fila encabezado
  const filaEncabezado = document.createElement("tr");
  const celdaTitulo = document.createElement("th");
  celdaTitulo.textContent = "Memoria Principal";
  filaEncabezado.appendChild(celdaTitulo);

  paginas.forEach((numero) => {
    const th = document.createElement("th");
    th.textContent = numero.numero; // Mostrar el número de la página
    filaEncabezado.appendChild(th);
  });

  tabla.appendChild(filaEncabezado);

  // Filas de marcos
  for (let i = 0; i < cantidadMarcos; i++) {
    const fila = document.createElement("tr");
    const celdaMarco = document.createElement("td");
    celdaMarco.textContent = `Marco ${i}`;
    fila.appendChild(celdaMarco);

    for (let j = 0; j < paginas.length; j++) {
      const celda = document.createElement("td");
      celda.textContent = ""; // Por ahora vacío
      fila.appendChild(celda);
    }

    tabla.appendChild(fila);
  }

  contenedor.appendChild(tabla);
  let btnNext = document.getElementById("btnNextStep");
  if (!btnNext) {
    btnNext = document.createElement("button");
    btnNext.id = "btnNextStep";
    btnNext.textContent = "Siguiente paso";
    btnNext.onclick = nextStep;
    contenedor.appendChild(document.createElement("br"));
    contenedor.appendChild(btnNext);
  }
}

function nextStepLRU() {
  if (currentStep >= listaMemoria.length) {
    alert("Fin del algoritmo MRU");
    return;
  }

  const paginaActual = listaMemoria[currentStep].numero;
  const ahora = Date.now();
  let agregado = null;
  let eliminado = null;
  let existe = null;

  // Encontrar la página en memoria
  const index = memoriaActual.findIndex((p) => p.pagina === paginaActual);

  if (index !== -1) {
    //Si existe, actualizar el timestamp
    memoriaActual[index].timestamp = ahora;
    existe = paginaActual;
  } else {
    // Si no esta en memoria, agregarla
    if (memoriaActual.length < marcos) {
      memoriaActual.push({ pagina: paginaActual, timestamp: ahora });
    } else {
      // Encontrar la página más recientemente utilizada (MRU)
      const masReciente = memoriaActual.reduce((a, b) =>
        a.timestamp < b.timestamp ? a : b
      );

      eliminado = masReciente.pagina;

      // Reemplazar la página más reciente con la nueva
      const reemplazoIndex = memoriaActual.findIndex(
        (p) => p.pagina === masReciente.pagina
      );
      memoriaActual[reemplazoIndex] = {
        pagina: paginaActual,
        timestamp: ahora,
      };
    }

    agregado = paginaActual;
  }

  // Obtener las páginas actuales en memoria, sin el timestamp.
  //Dado que el timestamp no se muestra en la tabla, solo se necesita la página.
  const paginasMemoria = memoriaActual.map((p) => p.pagina);

  actualizarTabla(paginasMemoria, currentStep, {
    agregado,
    eliminado,
    existe,
  });

  currentStep++;
}

function nextStepMRU() {
  if (currentStep >= listaMemoria.length) {
    alert("Fin del algoritmo MRU");
    return;
  }

  const paginaActual = listaMemoria[currentStep].numero;
  const ahora = Date.now();
  let agregado = null;
  let eliminado = null;
  let existe = null;

  // Encontrar la página en memoria
  const index = memoriaActual.findIndex((p) => p.pagina === paginaActual);

  if (index !== -1) {
    //Si existe, actualizar el timestamp
    memoriaActual[index].timestamp = ahora;
    existe = paginaActual;
  } else {
    // Si no esta en memoria, agregarla
    if (memoriaActual.length < marcos) {
      memoriaActual.push({ pagina: paginaActual, timestamp: ahora });
    } else {
      // Encontrar la página más recientemente utilizada (MRU)
      const masReciente = memoriaActual.reduce((a, b) =>
        a.timestamp > b.timestamp ? a : b
      );

      eliminado = masReciente.pagina;

      // Reemplazar la página más reciente con la nueva
      const reemplazoIndex = memoriaActual.findIndex(
        (p) => p.pagina === masReciente.pagina
      );
      memoriaActual[reemplazoIndex] = {
        pagina: paginaActual,
        timestamp: ahora,
      };
    }

    agregado = paginaActual;
  }

  // Obtener las páginas actuales en memoria, sin el timestamp.
  //Dado que el timestamp no se muestra en la tabla, solo se necesita la página.
  const paginasMemoria = memoriaActual.map((p) => p.pagina);

  actualizarTabla(paginasMemoria, currentStep, {
    agregado,
    eliminado,
    existe,
  });

  currentStep++;
}

function nextStepOPTIMO() {
  if (currentStep >= listaMemoria.length) {
    alert("Fin del algoritmo Óptimo");
    return;
  }

  const paginaActual = listaMemoria[currentStep].numero;
  let agregado = null;
  let eliminado = null;
  let existe = null;

  // Ver si la página ya está en memoria
  if (memoriaActual.includes(paginaActual)) {
    existe = paginaActual; //
  } else {
    // Si no está en memoria, agregarla
    if (memoriaActual.length < marcos) {
      // Si hay espacio, agregar directamente
      memoriaActual.push(paginaActual);
      agregado = paginaActual;
    } else {
      // Utilizar solo los numeros futuros
      const futurasPaginas = listaMemoria
        .slice(currentStep + 1)
        .map((p) => p.numero);

      // Buscar si existe alguna página en memoria que no esté en futurasPaginas
      const paginaNoUsada = memoriaActual.find(
        (p) => !futurasPaginas.includes(p)
      );

      if (paginaNoUsada !== undefined) {
        // Reemplazar la pagina que no se usará más
        eliminado = paginaNoUsada;
        const idx = memoriaActual.indexOf(paginaNoUsada);
        memoriaActual[idx] = paginaActual;
      } else {
        // Buscar la que se usará más lejos en el futuro
        const distancias = memoriaActual.map((p) => {
          const index = futurasPaginas.indexOf(p); //devuelve el primer indice de la pagina en futurasPaginas
          // Si no se encuentra, devolver -1
          //Se reemplaza por INFINITY para que se considere la que más lejos está
          return index === -1 ? Infinity : index; // Si no se encuentra, asignar iNFINITO, sin embargo este escenario no debería ocurrir
        });

        const idxMasLejano = distancias.indexOf(Math.max(...distancias));
        eliminado = memoriaActual[idxMasLejano];
        memoriaActual[idxMasLejano] = paginaActual;
      }

      agregado = paginaActual;
    }
  }

  actualizarTabla(memoriaActual, currentStep, {
    agregado,
    eliminado,
    existe,
  });

  currentStep++;
}

import {
  leerArchivoInstrucciones,
  validarSemantica,
  validarSemanticaDesdeArchivo,
} from "./parseoInstrucciones/leerArchivoInstrucciones.js";

// Código para el botón de Cargar archivo
function cargarArchivo() {
  const input = document.getElementById("archivoInput");
  const archivo = input.files[0];

  if (!archivo) {
    alert("Cargar un archivo primero.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const contenido = reader.result;
    const { instrucciones, errores: erroresLexicos } =
      leerArchivoInstrucciones(contenido);

    // Mostrar resultado en consola o en pantalla
    console.log("Instrucciones válidas:", instrucciones);
    console.log("Errores:", erroresLexicos);

    const output = document.getElementById("resultadoOutput");
    output.innerHTML = "";

    //Si hay errores lexicos, se muestran
    if (erroresLexicos.length > 0) {
      const tituloLexico = document.createElement("h3");
      tituloLexico.textContent = "Errores léxicos encontrados:";
      output.appendChild(tituloLexico);

      erroresLexicos.forEach((error) => {
        const divError = document.createElement("div");
        divError.className = "error-box";
        divError.innerHTML = `
        <strong>Línea:</strong> ${error.linea}<br>
        <strong>Tipo:</strong> ${error.tipo}<br>
        <strong>Contenido:</strong> ${error.contenido}<br>
        <strong>Argumentos:</strong> ${error.argumentos.join(", ")}
      `;
        output.appendChild(divError);
      });

      return;
    }

    const {
      errores: erroresSemanticos,
      totalPaginasNecesarias,
      pidsFinales,
    } = validarSemanticaDesdeArchivo(instrucciones);
    if (erroresSemanticos.length > 0) {
      const titulo = document.createElement("h3");
      titulo.textContent = "Errores semánticos encontrados:";
      output.appendChild(titulo);

      erroresSemanticos.forEach((error) => {
        const div = document.createElement("div");
        div.className = "error-box";
        div.innerHTML = `
        <strong>Línea:</strong> ${error.linea}<br>
        <strong>Tipo:</strong> ${error.tipo}<br>
        <strong>Contenido:</strong> ${error.contenido}<br>
        <strong>Argumentos:</strong> ${error.argumentos.join(", ")}
      `;
        output.appendChild(div);
      });
      return;
    }

    procesosGlobales = pidsFinales;
    cantidadPaginasNecesarias = totalPaginasNecesarias;
    // Si no hay errores, mostrar instrucciones
    const tituloValido = document.createElement("h3");
    tituloValido.textContent = "El archivo es correcto:";
    output.appendChild(tituloValido);
    instruccionesGlobales = instrucciones;
    const div = document.createElement("div");
    div.className = "instruccion-box";
    div.innerHTML = `
      <strong>Da click a generar tabla para seguir:</strong> <br>
     
     
    `;
    output.appendChild(div);
  };
  reader.readAsText(archivo);
}

//Logica de la simulacion
import { MMU } from "./computadora/MMU.js";
import { Simulador } from "./computadora/simulador.js";

let mmuOPTIMO;
let mmuOtroAlgoritmo;
let SimuladorObjeto;
let pasoActual = 0;
let relojGlobal = 0;
function runBarryRun() {
  if (!instruccionesGlobales || instruccionesGlobales.length === 0) {
    alert("Cargá primero un archivo válido.");
    return;
  }
  mmuOPTIMO = new MMU();
  mmuOtroAlgoritmo = new MMU();
  mmuOPTIMO.generarProcesosDesdeLista(procesosGlobales);
  mmuOPTIMO.prepararListaOptimo(instruccionesGlobales); // Iniciar el mapeo del algoritmo óptimo
  mmuOtroAlgoritmo.generarProcesosDesdeLista(procesosGlobales);
  SimuladorObjeto = new Simulador(
    mmuOPTIMO,
    mmuOtroAlgoritmo,
    instruccionesGlobales,
    document.getElementById("tablaPaginas"),
    algoritmoSeleccionado,
    "OPTIMO"
  );
  SimuladorObjeto.iniciarSimulacion();
}
//Globalizar funciones para que sean accesibles desde el HTML
window.generarTablas = generarTablas;
window.cargarArchivo = cargarArchivo;
window.runSimulation = runBarryRun;

//PENDIENTE
// CAMBIAR LA CUESTION DE MMEORIA REAL ASIGNAR
// CAMBIAR LA PAGINACION Y MEMORIA REAL
