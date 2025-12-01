export class Producto {
  idProducto: number;
  nombre: string;
  precio?: number;
  descripcion: string;
  idCategoria: number;
  stock: number;

  constructor(
    idProducto: number,
    nombre: string,
    descripcion: string,
    idCategoria: number,
    stock: number,
    precio?: number
  ) {
    this.idProducto = idProducto;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.idCategoria = idCategoria;
    this.stock = stock;
    if (precio !== undefined) {
      this.precio = precio;
    }
  }
}
