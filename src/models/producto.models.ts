import { Categoria } from "./categoria.models";
export class Producto {
    idProducto: number;
    nombre: string;
    precio?: number;
    descripcion: string;
    idCategoria: Categoria;
    stock: number;

    constructor(idProducto: number, nombre: string, descripcion: string, idCategoria: Categoria, stock: number, precio?: number) {
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