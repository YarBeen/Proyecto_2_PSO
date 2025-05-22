export class Proceso {
  constructor(pid) {
    this.pid = pid; //identificador del proceso
    this.estado = "VIVO"; // Estado puede ser VIVO o MUERTO //Talvez se elimine si el manejo l o hace la MMU ******
    this.tablaSimbolos = {}; // {ptr: [Contenido,tamaño]}
    this.contadorSimbolos = 0; // Contador utilizado para generar punteros con ids inucos
  }
  /**
   * Crea un nuevo puntero lógico (ptr) y lo añade a la tabla de símbolos del proceso.
   * @param {Contenido} paginas - Lo que tiene adrentro
   * @returns {string} El puntero generado.
   */
  crearSimbolo(contenido, tamaño) {
    const ptr = "ptr" + this.contadorSimbolos + this.pid; // Genera un puntero único
    this.contadorSimbolos++;
    this.tablaSimbolos[ptr] = [contenido, tamaño]; // Annadir el simbolo a la tabla de simbolos
    return ptr;
  }
  /**
   * Borrar el puntero lógico (ptr) de la tabla de símbolos del proceso.
   * @param {string} ptr - El puntero a borrar.
   * @returns {void}
   */
  borrarSimbolo(ptr) {
    if (this.tablaSimbolos[ptr]) {
      delete this.tablaSimbolos[ptr];
    } else {
      console.error(`Error: El puntero ${ptr} no existe.`);
    }
  }
  /**
   * Obtener el contenido asociado a un puntero lógico (ptr) de la tabla de símbolos del proceso.
   * @param {string} ptr - El puntero a buscar.
   * @returns {Contenido} El contenido asociado al puntero.
   */
  obtenerPaginas(ptrId) {
    return this.tablaSimbolos[ptrId] || null;
  }

  eliminarProceso() {
    this.estado = "MUERTO";
    this.tablaSimbolos = {};
    this.contadorSimbolos = 0;
  }
}
