import {detallePresupuesto} from "./detallePresupuesto.models"

export class Presupuesto {
    idPresupuesto: number;
    idUsuario: number;
    fecha: Date;
    detalle: detallePresupuesto[];
    montoTotal: number;
    fechaEntrega: Date;
    estado: string;

    constructor(idPresupuesto: number, detalle: detallePresupuesto[] ,idUsuario: number, fecha: Date, montoTotal: number, fechaEntrega: Date, estado: string) {
        this.idPresupuesto = idPresupuesto;
        this.idUsuario = idUsuario;
        this.fecha = fecha;
        this.detalle= detalle;
        this.montoTotal = montoTotal;
        this.fechaEntrega = fechaEntrega;
        this.estado = estado;
    }
}