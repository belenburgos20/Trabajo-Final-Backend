export class Producto {
  idProducto: number;
  codigo: string;
  nombre: string;
  precio?: number;
  descripcion: string;
  idCategoria: number;
  stock: number;
  categoria_nombre?: string; // Agregado para incluir el nombre de la categoría

  constructor(
    idProducto: number,
    codigo: string,
    nombre: string,
    descripcion: string,
    idCategoria: number,
    stock: number,
    precio?: number,
    categoria_nombre?: string, // Agregado para inicializar el nombre de la categoría
  ) {
    this.idProducto = idProducto;
    this.codigo = codigo;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.idCategoria = idCategoria;
    this.stock = stock;
    if (precio !== undefined) {
      this.precio = precio;
    }
    if (categoria_nombre !== undefined) {
      this.categoria_nombre = categoria_nombre;
    }
  }
}
