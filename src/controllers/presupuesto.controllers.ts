import { Request, Response } from "express";
import db, { sequelize } from "../config/db";
import { Presupuesto } from "../models/presupuesto.models";
import { detallePresupuesto } from "../models/detallePresupuesto.models";
import { ObtenerPresupuestos } from "../services/presupuesto.service";
import { obtenerDetallesPresupuesto } from "../services/detallePresupuesto.service";

let presupuestos: Presupuesto[] = [];
let idPresupuestoActual = 1;
const inicializarPresupuestos = async () => {
  try {
    const presupuestosIniciales = await db.query("SELECT * FROM presupuestos");
    const detallesIniciales = await db.query(
      "SELECT * FROM detalles_presupuesto",
    );

    const presupuestos = presupuestosIniciales.rows.map((p: any) => {
      const detallesDelPresupuesto = detallesIniciales.rows
        .filter((d: any) => d.idPresupuesto === p.idPresupuesto)
        .map((d: any) => ({
          idDetallePresupuesto: d.idDetallePresupuesto,
          idPresupuesto: d.idPresupuesto,
          idProducto: d.idProducto,
          cantidad: d.cantidad,
          precio: d.precio,
        }));

      return {
        idPresupuesto: p.idPresupuesto,
        idUsuario: p.idUsuario,
        fecha: p.fecha,
        detalle: detallesDelPresupuesto,
        montoTotal: p.montoTotal,
        fechaEntrega: p.fechaEntrega,
        estado: p.estado,
      };
    });

    return presupuestos;
  } catch (error) {
    console.error(
      "Error al inicializar presupuestos desde la base de datos:",
      error,
    );
    throw error;
  }
};

inicializarPresupuestos();
const calcularMontoTotal = (detalles: detallePresupuesto[]): number => {
  return detalles.reduce((total, detalle) => {
    return total + detalle.cantidad * detalle.precio;
  }, 0);
};

export const actualizarMontoTotalPresupuesto = (
  idPresupuesto: number,
  detalles: detallePresupuesto[],
) => {
  const presupuesto = presupuestos.find(
    (p) => p.idPresupuesto === idPresupuesto,
  );
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
    const presupuestosConMontoActualizado = presupuestos.map((p) => {
      p.montoTotal = calcularMontoTotal(p.detalle);
      return p;
    });

    if (presupuestosConMontoActualizado.length > 0) {
      return res.status(200).json(presupuestosConMontoActualizado);
    } else {
      return res
        .status(404)
        .json({ message: "No se encontraron presupuestos" });
    }
  } catch (error) {
    console.error("Error al obtener los presupuestos:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener los presupuestos" });
  }
};
export const obtenerPresupuestoPorId = async (req: Request, res: Response) => {
  const idPresupuesto = Number(req.params.idPresupuesto);
  try {
    const presupuestoResult= await db.query(
      `SELECT id, fecha_creacion, estado
       FROM presupuestos
       WHERE id = $1`,
      [idPresupuesto]
    );

    if (presupuestoResult.rows.length === 0) {
      return res.status(404).json({ message: "Presupuesto no encontrado" });
    }
    const detallesResult = await db.query(
        `
        SELECT 
          dp.iddetallepresupuesto,
          p.nombre AS nombre_producto,
          dp.cantidad,
          dp.precio,
          (dp.cantidad * dp.precio) AS total_producto
        FROM detalles_presupuesto dp
        JOIN productos p ON p.idproducto = dp.idproducto
        WHERE dp.idpresupuesto = $1
        `,
        [idPresupuesto]
      );
      const montoTotal= detallesResult.rows.reduce(
        (acc, item) => acc + Number(item.total_producto),
        0
      );

    return res.status(200).json({
      idPresupuesto,
      fecha: presupuestoResult.rows[0].fecha_creacion,
      estado: presupuestoResult.rows[0].estado,
      detalle: detallesResult.rows.map((d) => ({
        idDetallePresupuesto: d.idDetallePresupuesto,
        nombreProducto: d.nombre_producto,
        cantidad: d.cantidad,
        precioUnitario: Number(d.precio),
        totalProducto: Number(d.total_producto),
      })),
      montoTotal,
    });
    
  } catch (error) {
    console.error("Error al obtener el presupuesto:", error);
    return res.status(500).json({ message: "Error al obtener el presupuesto" });
  }
};
export const obtenerPresupuestoPorUsuario = async (
  req: Request,
  res: Response,
) => {
  const idUsuario = Number(req.params.idUsuario);
  try {
    const result = await db.query(
      `SELECT id, nombre, descripcion, fecha_creacion, monto_total, estado
       FROM presupuestos
       WHERE idUsuario = $1
       ORDER BY fecha_creacion DESC`,
      [idUsuario],
    );
      return res.status(200).json(result.rows);
  } catch (error) {
      console.error("Error al obtener presupuestos:", error);
      return res.status(404).json({ message: "No se encontraron presupuestos para este usuario" });
  }
};
export const modificarPresupuesto = async (req: Request, res: Response) => {
  const idPresupuesto = parseInt(req.params.idPresupuesto, 10);
  try {
    if (presupuestos.length === 0) {
      await inicializarPresupuestos();
    }

    const presupuestoIndex = presupuestos.findIndex(
      (p) => p.idPresupuesto === idPresupuesto,
    );
    if (presupuestoIndex !== -1) {
      const presupuesto = presupuestos[presupuestoIndex];
      if (req.body.idUsuario !== undefined)
        presupuesto.idUsuario = req.body.idUsuario;
      if (req.body.fechaEntrega !== undefined)
        presupuesto.fechaEntrega = new Date(req.body.fechaEntrega);
      if (req.body.estado !== undefined) presupuesto.estado = req.body.estado;
      presupuesto.montoTotal = calcularMontoTotal(presupuesto.detalle);

      return res.status(200).json(presupuesto);
    }
    return res.status(404).json({ message: "Presupuesto no encontrado" });
  } catch (error) {
    console.error("Error al modificar el presupuesto:", error);
    return res
      .status(500)
      .json({ message: "Error al modificar el presupuesto" });
  }
};
export const agregarPresupuesto = async (req: Request, res: Response) => {
  try {
    const { idUsuario, fechaEntrega, estado, detalle } = req.body;
    if (!idUsuario) {
      return res.status(400).json({ message: "El idUsuario es requerido" });
    }

    if (!detalle || !Array.isArray(detalle) || detalle.length === 0) {
      return res.status(400).json({ message: "El detalle del presupuesto es requerido y debe ser un array no vacío" });
    }
    const [result]: any =await sequelize.query(
      `INSERT INTO presupuestos( idusuario, estado)
      VALUES (:idUsuario, :estado)
      RETURNING id`,
      {
        replacements: { idUsuario, estado: estado || "Pendiente" },
      }
    );

   const idPresupuesto= result[0].id;
   for (const item of detalle) {
    if (!item.idProducto || !item.cantidad || item.cantidad <= 0) continue;
    await sequelize.query(
      `INSERT INTO detalles_presupuesto( idPresupuesto, idProducto, cantidad, precio)
      VALUES (:idPresupuesto, :idProducto, :cantidad, :precio)`,
      {
        replacements: {
          idPresupuesto,
          idProducto: item.idProducto,
          cantidad: item.cantidad,
          precio: item.precioUnitario,
        },
      }
    );
    return res.status(201).json({ message: "Presupuesto creado exitosamente", idPresupuesto });
  }
  }catch (error) {
    console.error("Error al agregar el presupuesto:", error);
    return res.status(500).json({ message: "Error al agregar el presupuesto" });
  }
};
export const eliminarPresupuesto = async (req: Request, res: Response) => {
  const idPresupuesto = parseInt(req.params.idPresupuesto, 10);
  try {
    const presupuestos = await ObtenerPresupuestos();
    const presupuestoIndex = presupuestos.findIndex(
      (p: any) => p.idPresupuesto === idPresupuesto,
    );
    if (presupuestoIndex !== -1) {
      presupuestos.splice(presupuestoIndex, 1);
      return res
        .status(200)
        .json({ message: "Presupuesto eliminado exitosamente" });
    }
    return res.status(404).json({ message: "Presupuesto no encontrado" });
  } catch (error) {
    console.error("Error al eliminar el presupuesto:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el presupuesto" });
  }
};
export const obtenerPresupuestosPorEstado = async (
  req: Request,
  res: Response,
) => {
  const estado = req.params.estado;
  try {
    const presupuestos = await ObtenerPresupuestos();
    const presupuestosFiltrados = presupuestos.filter(
      (p: any) => p.estado.toLowerCase() === estado.toLowerCase(),
    );
    if (presupuestosFiltrados.length > 0) {
      return res.status(200).json(presupuestosFiltrados);
    } else {
      return res.status(404).json({
        message: "No se encontraron presupuestos con el estado " + estado,
      });
    }
  } catch (error) {
    console.error("Error al obtener presupuestos:", error);
    return res.status(500).json({ message: "Error al obtener presupuestos" });
  }
};
export const obtenerPresupuestosPorFecha = async (
  req: Request,
  res: Response,
) => {
  const fecha = new Date(req.params.fecha);
  try {
    const presupuestos = await ObtenerPresupuestos();
    const presupuestosFiltrados = presupuestos.filter((p: any) => {
      const fechaPresupuesto = new Date(p.fecha);
      return fechaPresupuesto.toDateString() === fecha.toDateString();
    });
    if (presupuestosFiltrados.length > 0) {
      return res.status(200).json(presupuestosFiltrados);
    } else {
      return res.status(404).json({
        message:
          "No se encontraron presupuestos para la fecha " + req.params.fecha,
      });
    }
  } catch (error) {
    console.error("Error al obtener presupuestos:", error);
    return res.status(500).json({ message: "Error al obtener presupuestos" });
  }
};
