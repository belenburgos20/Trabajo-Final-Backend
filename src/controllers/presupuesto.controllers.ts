import {Request, Response} from 'express';
import {ObtenerPresupuestos} from '../services/presupuesto.service';
import {Presupuesto} from '../models/presupuesto.models';
import {detallePresupuesto} from '../models/detallePresupuesto.models';
import {obtenerDetallesPresupuesto} from '../services/detallePresupuesto.service';

let presupuestos: Presupuesto[] = [];
let idPresupuestoActual = 1;
const inicializarPresupuestos = async () => {
    try {
        const presupuestosIniciales = await ObtenerPresupuestos();
        const detallesIniciales = await obtenerDetallesPresupuesto();
        
        presupuestos = presupuestosIniciales.map((p: any) => {
            const detallesDelPresupuesto = detallesIniciales
                .filter((d: any) => d.idPresupuesto === p.idPresupuesto)
                .map((d: any) => new detallePresupuesto(
                    d.idDetallePresupuesto,
                    d.idPresupuesto,
                    d.idProducto,
                    d.cantidad,
                    d.precio
                ));
            
            return new Presupuesto(
                p.idPresupuesto,
                detallesDelPresupuesto,
                p.idUsuario,
                new Date(p.fecha),
                p.montoTotal,
                new Date(p.fechaEntrega),
                p.estado
            );
        });
        
        if (presupuestos.length > 0) {
            idPresupuestoActual = Math.max(...presupuestos.map(p => p.idPresupuesto)) + 1;
        }
    } catch (error) {
        console.error("Error al inicializar presupuestos desde el servicio:", error);
    }
};

inicializarPresupuestos();
const calcularMontoTotal = (detalles: detallePresupuesto[]): number => {
    return detalles.reduce((total, detalle) => {
        return total + (detalle.cantidad * detalle.precio);
    }, 0);
};

export const actualizarMontoTotalPresupuesto = (idPresupuesto: number, detalles: detallePresupuesto[]) => {
    const presupuesto = presupuestos.find(p => p.idPresupuesto === idPresupuesto);
    if (presupuesto) {
        presupuesto.detalle = detalles;
        presupuesto.montoTotal = calcularMontoTotal(detalles);
    }
};

export const obtenerPresupuestos = async (req: Request, res: Response) => {
    try {
        if (presupuestos.length === 0) {
            await inicializarPresupuestos();
        }
        const presupuestosConMontoActualizado = presupuestos.map(p => {
            p.montoTotal = calcularMontoTotal(p.detalle);
            return p;
        });

        if (presupuestosConMontoActualizado.length > 0) {
            return res.status(200).json(presupuestosConMontoActualizado);
        } else {
            return res.status(404).json({ message: "No se encontraron presupuestos" });
        }
    } catch (error) {
        console.error("Error al obtener los presupuestos:", error);
        return res.status(500).json({ message: "Error al obtener los presupuestos" });
    }
};
export const obtenerPresupuestoPorId = async (req: Request, res: Response) => {
    const idPresupuesto = parseInt(req.params.idPresupuesto, 10);
    try {
        if (presupuestos.length === 0) {
            await inicializarPresupuestos();
        }

        let presupuesto = presupuestos.find(p => p.idPresupuesto === idPresupuesto);
        if (!presupuesto) {
            const presupuestosServicio = await ObtenerPresupuestos();
            const presupuestoData = presupuestosServicio.find((p:any) => p.idPresupuesto === idPresupuesto);
            
            if (presupuestoData) {
                const detallesServicio = await obtenerDetallesPresupuesto();
                const detallesDelPresupuesto = detallesServicio
                    .filter((d: any) => d.idPresupuesto === idPresupuesto)
                    .map((d: any) => new detallePresupuesto(
                        d.idDetallePresupuesto,
                        d.idPresupuesto,
                        d.idProducto,
                        d.cantidad,
                        d.precio
                    ));
                
                presupuesto = new Presupuesto(
                    presupuestoData.idPresupuesto,
                    detallesDelPresupuesto,
                    presupuestoData.idUsuario,
                    new Date(presupuestoData.fecha),
                    presupuestoData.montoTotal,
                    new Date(presupuestoData.fechaEntrega),
                    presupuestoData.estado
                );
            }
        }

        if (presupuesto) {
            presupuesto.montoTotal = calcularMontoTotal(presupuesto.detalle);
            return res.status(200).json(presupuesto);
        } else {
            return res.status(404).json({ message: "Presupuesto no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener el presupuesto:", error);
        return res.status(500).json({ message: "Error al obtener el presupuesto" });
    }
};
export const obtenerPresupuestoPorUsuario = async (req: Request, res: Response) => {
    const idUsuario = parseInt(req.params.idUsuario, 10);
    try {
        const presupuestos = await ObtenerPresupuestos();
        const presupuesto = presupuestos.find((p:any) => p.idUsuario === idUsuario);
        if (presupuesto) {
            return res.status(200).json(presupuesto);
        }
        return res.status(404).json({ message: "Presupuesto no encontrado" });
    }
    catch (error) {
        console.error("Error al obtener el presupuesto:", error);
        return res.status(500).json({ message: "Error al obtener el presupuesto" });
    }
};
export const modificarPresupuesto = async (req: Request, res: Response) => {
    const idPresupuesto = parseInt(req.params.idPresupuesto, 10);
    try {
        if (presupuestos.length === 0) {
            await inicializarPresupuestos();
        }

        const presupuestoIndex = presupuestos.findIndex(p => p.idPresupuesto === idPresupuesto);
        if (presupuestoIndex !== -1) {
            const presupuesto = presupuestos[presupuestoIndex];
            if (req.body.idUsuario !== undefined) presupuesto.idUsuario = req.body.idUsuario;
            if (req.body.fechaEntrega !== undefined) presupuesto.fechaEntrega = new Date(req.body.fechaEntrega);
            if (req.body.estado !== undefined) presupuesto.estado = req.body.estado;
            presupuesto.montoTotal = calcularMontoTotal(presupuesto.detalle);
            
            return res.status(200).json(presupuesto);
        }
        return res.status(404).json({ message: "Presupuesto no encontrado" });
    }
    catch (error) {
        console.error("Error al modificar el presupuesto:", error);
        return res.status(500).json({ message: "Error al modificar el presupuesto" });
    }
};
export const agregarPresupuesto = async (req: Request, res: Response) => {
    try {
        const { idUsuario, fechaEntrega, estado, productos } = req.body;
        if (!idUsuario) {
            return res.status(400).json({ message: "El idUsuario es requerido" });
        }

        if (!fechaEntrega) {
            return res.status(400).json({ message: "La fechaEntrega es requerida" });
        }

        let detallesPresupuesto: detallePresupuesto[] = [];
        
        if (productos && Array.isArray(productos) && productos.length > 0) {
            const { obtenerProductos } = await import('../services/productos.service');
            const productosDisponibles = await obtenerProductos();
            
            let idDetalleActual = 1;
            const detallesExistentes = await obtenerDetallesPresupuesto();
            if (detallesExistentes.length > 0) {
                idDetalleActual = Math.max(...detallesExistentes.map((d: any) => d.idDetallePresupuesto)) + 1;
            }

            for (const productoSeleccionado of productos) {
                const { idProducto, cantidad } = productoSeleccionado;
                
                if (!idProducto || !cantidad || cantidad <= 0) {
                    continue;
                }

                const producto = productosDisponibles.find((p: any) => p.id === idProducto);
                if (!producto || !producto.precio) {
                    continue;
                }

                if (producto.stock < cantidad) {
                    continue;
                }

                const nuevoDetalle = new detallePresupuesto(
                    idDetalleActual++,
                    idPresupuestoActual,
                    idProducto,
                    cantidad,
                    producto.precio
                );

                detallesPresupuesto.push(nuevoDetalle);
            }

            if (detallesPresupuesto.length === 0) {
                return res.status(400).json({ 
                    message: "No se pudieron crear detalles válidos con los productos proporcionados" 
                });
            }
        }

        const montoTotal = calcularMontoTotal(detallesPresupuesto);
        detallesPresupuesto.forEach(detalle => {
            detalle.idPresupuesto = idPresupuestoActual;
        });

        const nuevoPresupuesto = new Presupuesto(
            idPresupuestoActual++,
            detallesPresupuesto,
            idUsuario,
            new Date(),
            montoTotal,
            new Date(fechaEntrega),
            estado || 'Pendiente'
        );

        presupuestos.push(nuevoPresupuesto);

        return res.status(201).json({
            message: "Presupuesto creado exitosamente",
            presupuesto: nuevoPresupuesto
        });
    } catch (error) {
        console.error("Error al agregar el presupuesto:", error);
        return res.status(500).json({ message: "Error al agregar el presupuesto" });
    }
};
export const eliminarPresupuesto = async (req: Request, res: Response) => {
    const idPresupuesto = parseInt(req.params.idPresupuesto, 10);
    try {
        const presupuestos = await ObtenerPresupuestos();
        const presupuestoIndex = presupuestos.findIndex((p:any) => p.idPresupuesto === idPresupuesto);
        if (presupuestoIndex !== -1) {
            presupuestos.splice(presupuestoIndex, 1);
            return res.status(200).json({ message: "Presupuesto eliminado exitosamente" });
        }
        return res.status(404).json({ message: "Presupuesto no encontrado" });
    }
    catch (error) {
        console.error("Error al eliminar el presupuesto:", error);
        return res.status(500).json({ message: "Error al eliminar el presupuesto" });
    }
};
export const obtenerPresupuestosPorEstado = async (req: Request, res: Response) => {
    const estado = req.params.estado;
    try {
        const presupuestos = await ObtenerPresupuestos();
        const presupuestosFiltrados = presupuestos.filter((p:any) => p.estado.toLowerCase() === estado.toLowerCase());
        if (presupuestosFiltrados.length > 0) {
            return res.status(200).json(presupuestosFiltrados);
        } else {
            return res.status(404).json({ message: "No se encontraron presupuestos con el estado " + estado });
        }
    } catch (error) {
        console.error("Error al obtener presupuestos:", error);
        return res.status(500).json({ message: "Error al obtener presupuestos" });
    }
};
export const obtenerPresupuestosPorFecha = async (req: Request, res: Response) => {
    const fecha = new Date(req.params.fecha);
    try {
        const presupuestos = await ObtenerPresupuestos();
        const presupuestosFiltrados = presupuestos.filter((p:any) => {
            const fechaPresupuesto = new Date(p.fecha);
            return fechaPresupuesto.toDateString() === fecha.toDateString();
        });
        if (presupuestosFiltrados.length > 0) {
            return res.status(200).json(presupuestosFiltrados);
        } else {
            return res.status(404).json({ message: "No se encontraron presupuestos para la fecha " + req.params.fecha });
        }
    } catch (error) {
        console.error("Error al obtener presupuestos:", error);
        return res.status(500).json({ message: "Error al obtener presupuestos" });
    }
};