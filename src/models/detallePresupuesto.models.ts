export class detallePresupuesto{

    idDetallePresupuesto: number;
    idPresupuesto: number;
    idProducto: number;
    cantidad: number;
    precio: number;

    constructor (idDetallePresupuesto:number, idPresupuesto: number, idProducto:number, cantidad: number, precio:number){
        this.idDetallePresupuesto= idDetallePresupuesto;
        this.idPresupuesto= idPresupuesto;
        this.idProducto= idProducto;
        this.cantidad= cantidad;
        this.precio = precio;
    }
}