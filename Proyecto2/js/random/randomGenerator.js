document.addEventListener("DOMContentLoaded", () => {
  const generarBtn = document.getElementById("generarBtn");

  generarBtn.addEventListener("click", () => {
    const seed = document.getElementById("semillaRandom").value.trim();
    const totalInstrucciones = parseInt(
      document.getElementById("cantidadN").value
    );
    const maxProcesos = parseInt(document.getElementById("inputP").value);

    if (!seed || isNaN(totalInstrucciones) || isNaN(maxProcesos)) {
      alert("Por favor ingrese todos los valores correctamente.");
      return;
    }

    // Usar seedrandom de la biblioteca, pero en archivo local seedRandom.js
    Math.seedrandom(seed);

    // variables para la generación de instrucciones
    const instrucciones = [];
    const procesos = {};
    let ptrGlobal = 1;
    let cantidadDeletes = 0;
    let cantidadKills = 0;
    const maxDeletes = Math.floor(totalInstrucciones * 0.1);
    const maxKills = Math.floor(totalInstrucciones * 0.1);
    let intentosSinExito = 0; // para evitar que se encicle
    const maxIntentosSinExito = 1000; // prevenir bucle infinito

    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomElemento(array) {
      return array[Math.floor(Math.random() * array.length)];
    }

    function hayProcesosViables() {
      for (let pid in procesos) {
        if (!procesos[pid].killed) {
          return true;
        }
      }
      return false;
    }

    function crearNuevoProceso() {
      // Encontrar un PID que no esté completamente muerto
      for (let i = 1; i <= maxProcesos; i++) {
        if (!procesos[i] || !procesos[i].killed) {
          return i;
        }
      }
      return null;
    }

    while (instrucciones.length < totalInstrucciones) {
      // Verificar si puede continuar con generacion de instr
      if (intentosSinExito > maxIntentosSinExito) {
        console.warn(
          `Se alcanzó el límite de intentos. Generadas ${instrucciones.length} instrucciones de ${totalInstrucciones} solicitadas.`
        );
        break;
      }

      let pid = randomInt(1, maxProcesos);

      // si proceso muerto, intentar encontrar uno viable o crear uno nuevo
      if (procesos[pid] && procesos[pid].killed) {
        const nuevoPid = crearNuevoProceso();
        if (nuevoPid === null) {
          // Si no hay procesos viables y ya alcanzamos el límite de kills, crear uno nuevo
          if (cantidadKills < maxKills) {
            pid = randomInt(1, maxProcesos);
          } else {
            intentosSinExito++;
            continue;
          }
        } else {
          pid = nuevoPid;
        }
      }

      // Inicializar proceso si no existe
      procesos[pid] = procesos[pid] || {
        activos: [],
        eliminados: [],
        killed: false,
      };

      const proceso = procesos[pid];
      if (proceso.killed) {
        intentosSinExito++;
        continue;
      }

      const opciones = ["new"];
      if (proceso.activos.length > 0) {
        opciones.push("use");
        if (cantidadDeletes < maxDeletes) opciones.push("delete");
      }
      if (!proceso.killed && cantidadKills < maxKills) {
        opciones.push("kill");
      }

      // Si no hay opciones válidas, continuar
      // para reducir enciclado con numero de procesos
      if (opciones.length === 0) {
        intentosSinExito++;
        continue;
      }

      const op = getRandomElemento(opciones);
      let instruccionAgregada = false;

      if (op === "new") {
        const size = randomInt(1, 50); // acá se cambia el rango de tam de página :)
        instrucciones.push(`new(${pid},${size})`);
        proceso.activos.push(ptrGlobal++);
        instruccionAgregada = true;
      } else if (op === "use" && proceso.activos.length > 0) {
        const ptr = getRandomElemento(proceso.activos);
        instrucciones.push(`use(${ptr})`);
        instruccionAgregada = true;
      } else if (
        op === "delete" &&
        proceso.activos.length > 0 &&
        cantidadDeletes < maxDeletes
      ) {
        const ptr = getRandomElemento(proceso.activos);
        instrucciones.push(`delete(${ptr})`);
        proceso.activos = proceso.activos.filter((p) => p !== ptr);
        proceso.eliminados.push(ptr);
        cantidadDeletes++;
        instruccionAgregada = true;
      } else if (op === "kill" && !proceso.killed && cantidadKills < maxKills) {
        instrucciones.push(`kill(${pid})`);
        proceso.killed = true;
        proceso.activos = [];
        cantidadKills++;
        instruccionAgregada = true;
      }

      if (instruccionAgregada) {
        intentosSinExito = 0; // reiniciar counter
      } else {
        intentosSinExito++;
      }
    }

    const blob = new Blob([instrucciones.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "instrucciones_random.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});
