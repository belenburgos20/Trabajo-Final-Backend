import { Request, Response } from "express";
import { detallePresupuesto } from "../models/detallePresupuesto.models";
import { obtenerProductos } from "../services/productos.service";
import { obtenerDetallesPresupuesto } from "../services/detallePresupuesto.service";
import { actualizarMontoTotalPresupuesto } from "./presupuesto.controllers";
import { Producto } from "../models/producto.models";

let detalles: detallePresupuesto[] = [];
let Idactual = 1;

const inicializarDetalles = async () => {
  try {
    const detallesIniciales = await obtenerDetallesPresupuesto();
    detalles = detallesIniciales.map(
      (d: any) =>
        new detallePresupuesto(
          d.idDetallePresupuesto,
          d.idPresupuesto,
          d.idProducto,
          d.cantidad,
          d.precio,
        ),
    );
    if (detalles.length > 0) {
      Idactual = Math.max(...detalles.map((d) => d.idDetallePresupuesto)) + 1;
    }
  } catch (error) {
    console.error("Error al inicializar detalles desde el servicio:", error);
  }
};
inicializarDetalles();

export const obtenerDetallesPorPresupuesto = async (
  req: Request,
  res: Response,
) => {
  try {
    const idPresupuesto = parseInt(req.params.idPresupuesto);
    if (detalles.length === 0) {
      await inicializarDetalles();
    }
    const filtrados = detalles.filter((d) => d.idPresupuesto === idPresupuesto);
    if (filtrados.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No hay productos para este presupuesto." });
    }
    return res.status(200).json(filtrados);
  } catch (error) {
    console.error("Error al obtener detalles por presupuesto:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al obtener detalles del presupuesto" });
  }
};

export const agregarDetallePresupuesto = async (
  req: Request,
  res: Response,
) => {
  try {
    const idPresupuesto = parseInt(req.params.idPresupuesto);
    const { productos } = req.body;
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        mensaje: "Error: Falta de datos",
      });
    }
    const productosDisponibles: Producto[] = await obtenerProductos();
    const detallesCreados: detallePresupuesto[] = [];
    const errores: string[] = [];
    for (const productoSeleccionado of productos) {
      const { idProducto, cantidad } = productoSeleccionado;
      if (!idProducto || !cantidad || cantidad <= 0) {
        errores.push(`Cantidad inválida`);
        continue;
      }
      const producto = productosDisponibles.find(
        (p) => p.idProducto === idProducto,
      );
      if (!producto) {
        errores.push(`Producto no encontrado`);
        continue;
      }
      if (producto.stock < cantidad) {
        errores.push(`Stock insuficiente`);
        continue;
      }
      const nuevoDetalle = new detallePresupuesto(
        Idactual++,
        idPresupuesto,
        idProducto,
        cantidad,
        producto.precio || 0, // Manejar el caso en que precio sea undefined
      );
      detalles.push(nuevoDetalle);
      detallesCreados.push(nuevoDetalle);
    }
    if (errores.length > 0) {
      return res.status(400).json({ errores });
    }
    await actualizarMontoTotalPresupuesto(idPresupuesto, detallesCreados); // Pasar ambos argumentos requeridos
    return res.status(201).json(detallesCreados);
  } catch (error) {
    console.error("Error al agregar detalles al presupuesto:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al agregar detalles al presupuesto" });
  }
};

export const modificarCantidad = (req: Request, res: Response) => {
  const idDetalle = parseInt(req.params.idDetalle);
  const { cantidad } = req.body;
  const detalle = detalles.find((d) => d.idDetallePresupuesto === idDetalle);
  if (!detalle) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }
  detalle.cantidad = cantidad;
  const detallesDelPresupuesto = detalles.filter(
    (d) => d.idPresupuesto === detalle.idPresupuesto,
  );
  actualizarMontoTotalPresupuesto(
    detalle.idPresupuesto,
    detallesDelPresupuesto,
  );

  return res.status(200).json(detalle);
};

export const modificarPrecio = (req: Request, res: Response) => {
  const idDetalle = parseInt(req.params.idDetalle);
  const { precio } = req.body;
  const detalle = detalles.find((d) => d.idDetallePresupuesto === idDetalle);
  if (!detalle) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }
  detalle.precio = precio;
  const detallesDelPresupuesto = detalles.filter(
    (d) => d.idPresupuesto === detalle.idPresupuesto,
  );
  actualizarMontoTotalPresupuesto(
    detalle.idPresupuesto,
    detallesDelPresupuesto,
  );
  return res.status(200).json(detalle);
};

export const modificarDetalle = (req: Request, res: Response) => {
  const idDetalle = parseInt(req.params.idDetalle);
  const { cantidad, precio } = req.body;
  const detalle = detalles.find((d) => d.idDetallePresupuesto === idDetalle);
  if (!detalle) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }
  if (cantidad !== undefined) detalle.cantidad = cantidad;
  if (precio !== undefined) detalle.precio = precio;

  const detallesDelPresupuesto = detalles.filter(
    (d) => d.idPresupuesto === detalle.idPresupuesto,
  );
  actualizarMontoTotalPresupuesto(
    detalle.idPresupuesto,
    detallesDelPresupuesto,
  );
  return res.status(200).json(detalle);
};

export const eliminarDetalle = (req: Request, res: Response) => {
  const idDetalle = parseInt(req.params.idDetalle);
  const detalle = detalles.find((d) => d.idDetallePresupuesto === idDetalle);
  if (!detalle) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }
  const idPresupuesto = detalle.idPresupuesto;
  detalles = detalles.filter((d) => d.idDetallePresupuesto !== idDetalle);
  const detallesDelPresupuesto = detalles.filter(
    (d) => d.idPresupuesto === idPresupuesto,
  );
  actualizarMontoTotalPresupuesto(idPresupuesto, detallesDelPresupuesto);

  return res.status(200).json({ mensaje: "Producto eliminado" });
};
