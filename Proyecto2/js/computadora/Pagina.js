export class Pagina {
  constructor(pid, ptr, numeroPagina) {
    this.pid = pid;
    this.estaEnRam = false; // Indica si la página está en RAM
    this.direccionEnDisco = null; // Dirección en disco
    this.direccionEnRam = null; // Dirección en RAM
    this.puntero = ptr; // Puntero de la página
    this.timestampDeCarga = null; // Timestamp de carga
    this.marcado = null; // Marcado de la página
    this.numeroPagina = numeroPagina; // Número de página
    this.ptr = ptr; // Que apunta hacia esta pagina
  }

  setDireccionEnDisco(direccion) {
    this.direccionEnDisco = direccion;
  }
}
