import { Request, Response } from "express";
import db, { sequelize } from "../config/db";
import { Presupuesto } from "../models/presupuesto.models";
import { detallePresupuesto } from "../models/detallePresupuesto.models";
import { ObtenerPresupuestos } from "../services/presupuesto.service";
import { obtenerDetallesPresupuesto } from "../services/detallePresupuesto.service";
import { pool } from "../config/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

let presupuestos: Presupuesto[] = [];
let idPresupuestoActual = 1;

export const obtenerPresupuestos = async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id,
        u.nombre as nombre_usuario,
        p.fecha_creacion,
        p.estado,
        p.monto_total
      FROM presupuestos p
      JOIN usuarios u ON u.idusuario = p.idUsuario
      LEFT JOIN detalles_presupuesto dp ON dp.idpresupuesto = p.id
      GROUP BY p.id, u.nombre
      ORDER BY p.fecha_creacion DESC
    `);

    return res.status(200).json(
      result.rows.map((p) => ({
        idPresupuesto: p.id,
        usuario: p.idUsuario,
        idUsuario: p.nombre_usuario,
        fecha: p.fecha_creacion,
        estado: p.estado,
        montoTotal: Number(p.monto_total),
        detalle: [],
      })),
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener presupuestos" });
  }
};

export const obtenerPresupuestoPorId = async (req: Request, res: Response) => {
  const idPresupuesto = Number(req.params.idPresupuesto);
  try {
    const presupuestoResult = await db.query(
      `SELECT id as idpresupuesto,fecha_creacion, estado, monto_total
       FROM presupuestos
       WHERE id = $1`,
      [idPresupuesto],
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
      [idPresupuesto],
    );
    const montoTotal = detallesResult.rows.reduce(
      (acc, item) => acc + Number(item.total_producto),
      0,
    );

    console.log("Detalles del presupuesto:", detallesResult.rows);

    return res.status(200).json({
      idPresupuesto,
      fecha: presupuestoResult.rows[0].fecha_creacion,
      estado: presupuestoResult.rows[0].estado,
      detalle: detallesResult.rows.map((d) => ({
        idDetallePresupuesto: d.iddetallepresupuesto,
        nombreProducto: d.nombre_producto,
        cantidad: d.cantidad,
        precioUnitario: Number(d.precio),
        totalProducto: Number(d.total_producto),
      })),
      montoTotal: Number(presupuestoResult.rows[0].monto_total),
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
    return res
      .status(404)
      .json({ message: "No se encontraron presupuestos para este usuario" });
  }
};
export const modificarPresupuesto = async (req: Request, res: Response) => {
  const idPresupuesto = Number(req.params.idPresupuesto);
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ message: "El estado es obligatorio" });
  }

  try {
    const result = await pool.query(
      `UPDATE presupuestos
       SET estado = $1
       WHERE id = $2
       RETURNING *`,
      [estado, idPresupuesto],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Presupuesto no encontrado" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al modificar el presupuesto:", error);
    return res.status(500).json({
      message: "Error al modificar el presupuesto",
    });
  }
};
export const agregarPresupuesto = async (req: Request, res: Response) => {
  try {
    const { idUsuario, fechaEntrega, estado, detalle } = req.body;
    if (!idUsuario) {
      return res.status(400).json({ message: "El idUsuario es requerido" });
    }

    if (!detalle || !Array.isArray(detalle) || detalle.length === 0) {
      return res.status(400).json({
        message:
          "El detalle del presupuesto es requerido y debe ser un array no vacío",
      });
    }
    const [result]: any = await sequelize.query(
      `INSERT INTO presupuestos( idusuario, estado)
      VALUES (:idUsuario, :estado)
      RETURNING id`,
      {
        replacements: { idUsuario, estado: estado || "Pendiente" },
      },
    );

    const idPresupuesto = result[0].id;
    let montoTotal = 0;

    for (const item of detalle) {
      if (!item.idProducto || !item.cantidad || item.cantidad <= 0) continue;
      const precio = Number(item.precio ?? item.precioUnitario ?? 0) || 0;
      await sequelize.query(
        `INSERT INTO detalles_presupuesto( idPresupuesto, idProducto, cantidad, precio)
        VALUES (:idPresupuesto, :idProducto, :cantidad, :precio)`,
        {
          replacements: {
            idPresupuesto,
            idProducto: item.idProducto,
            cantidad: item.cantidad,
            precio,
          },
        },
      );
      montoTotal += item.cantidad * precio;
    }

    // Actualizar el monto_total en la tabla presupuestos
    await sequelize.query(
      `UPDATE presupuestos
       SET monto_total = :montoTotal
       WHERE id = :idPresupuesto`,
      {
        replacements: { montoTotal, idPresupuesto },
      },
    );

    return res
      .status(201)
      .json({ message: "Presupuesto creado exitosamente", idPresupuesto });
  } catch (error) {
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

export const generarPDFPresupuesto = async (req: Request, res: Response) => {
  const idPresupuesto = Number(req.params.idPresupuesto);

  console.log("ID del presupuesto recibido:", idPresupuesto);

  try {
    // Obtener datos del presupuesto
    console.log("Ejecutando consulta para obtener el presupuesto...");
    const presupuestoResult = await db.query(
      `SELECT id as idpresupuesto, fecha_creacion, estado, monto_total
       FROM presupuestos
       WHERE id = $1`,
      [idPresupuesto],
    );

    console.log(
      "Resultado de la consulta del presupuesto:",
      presupuestoResult.rows,
    );

    if (presupuestoResult.rows.length === 0) {
      console.log("Presupuesto no encontrado");
      return res.status(404).json({ message: "Presupuesto no encontrado" });
    }

    console.log(
      "Ejecutando consulta para obtener los detalles del presupuesto...",
    );
    const detallesResult = await db.query(
      `SELECT dp.iddetallepresupuesto, p.nombre AS nombre_producto, dp.cantidad, dp.precio, (dp.cantidad * dp.precio) AS total_producto
       FROM detalles_presupuesto dp
       JOIN productos p ON p.idproducto = dp.idproducto
       WHERE dp.idpresupuesto = $1`,
      [idPresupuesto],
    );

    console.log("Resultado de la consulta de detalles:", detallesResult.rows);
        const clienteResult = await db.query(
      `SELECT u.nombre AS nombre, u.direccion, u.telefono, u.email
       FROM presupuestos p
       JOIN usuarios u ON u.idusuario = p.idUsuario
       WHERE p.id = $1`,
      [idPresupuesto],
    );
    if (clienteResult.rows.length === 0) {
      console.log("Cliente no encontrado para el presupuesto");
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const presupuesto = {
      idPresupuesto,
      fecha: presupuestoResult.rows[0].fecha_creacion,
      estado: presupuestoResult.rows[0].estado,
      montoTotal: Number(presupuestoResult.rows[0].monto_total),
      cliente:{
        nombre: clienteResult.rows[0].nombre,
        direccion: clienteResult.rows[0].direccion,
        telefono: clienteResult.rows[0].telefono,
        email: clienteResult.rows[0].email,
      },
      detalle: detallesResult.rows.map((d) => ({
        idDetallePresupuesto: d.iddetallepresupuesto,
        nombreProducto: d.nombre_producto,
        cantidad: d.cantidad,
        precioUnitario: Number(d.precio),
        totalProducto: Number(d.total_producto),
      })),
    };

    console.log("Datos del presupuesto procesados:", presupuesto);

    // Generar PDF con pdf-lib (compatible con Render, sin Puppeteer/Chrome)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const margin = 50;
    const pageWidth = 595;
    let y = 800;
    const lineHeight = 16;
    const purple = rgb(0.29, 0.17, 0.51);

    const drawText = (
      text: string,
      opts: { x?: number; y?: number; size?: number; bold?: boolean } = {},
    ) => {
      const x = opts.x ?? margin;
      const size = opts.size ?? 12;
      const f = opts.bold ? fontBold : font;
      page.drawText(text, {
        x,
        y: opts.y ?? y,
        size,
        font: f,
        color: rgb(0.17, 0.17, 0.17),
      });
      if (opts.y == null) y -= lineHeight;
    };

    // Título y empresa
    page.drawText("PRESUPUESTO", { x: margin, y, size: 22, font: fontBold, color: purple });
    y -= 20;
    page.drawText("Oleohidráulica Guardese", { x: margin, y, size: 10, font });
    y -= 12;
    page.drawText("Bravard 1469 – Bahía Blanca | Tel: 0291 517-1986 | claudioguardes@hotmail.com", {
      x: margin,
      y,
      size: 9,
      font,
    });
    y -= 25;

    // Línea separadora
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 2,
      color: purple,
    });
    y -= 25;

    // Bloque Cliente / N° Presupuesto
    page.drawText("Cliente", { x: margin, y, size: 11, font: fontBold, color: purple });
    y -= 14;
    drawText(presupuesto.cliente.nombre);
    drawText(presupuesto.cliente.direccion || "");
    drawText(`Tel: ${presupuesto.cliente.telefono || ""}`);
    drawText(presupuesto.cliente.email || "");
    y -= 10;
    page.drawText("N° de Presupuesto", { x: 320, y: y + 10 + 4 * lineHeight, size: 11, font: fontBold, color: purple });
    page.drawText(String(presupuesto.idPresupuesto), { x: 320, y: y + 10 + 3 * lineHeight, size: 12, font });
    page.drawText(`Fecha: ${String(presupuesto.fecha).slice(0, 10)}`, {
      x: 320,
      y: y + 10 + 2 * lineHeight,
      size: 10,
      font,
    });
    y -= 20;

    // Encabezado tabla
    const colPos = { pos: margin, desc: margin + 40, cant: 380, precio: 430, importe: 500 };
    page.drawRectangle({
      x: margin,
      y: y - 8,
      width: pageWidth - 2 * margin,
      height: 22,
      color: purple,
    });
    page.drawText("Pos.", { x: colPos.pos, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Descripción", { x: colPos.desc, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Cant.", { x: colPos.cant, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Precio Unit.", { x: colPos.precio, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Importe", { x: colPos.importe, y: y, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    y -= 28;

    presupuesto.detalle.forEach((item, index) => {
      page.drawText(String(index + 1), { x: colPos.pos, y, size: 10, font });
      const desc = item.nombreProducto.length > 28 ? item.nombreProducto.slice(0, 25) + "..." : item.nombreProducto;
      page.drawText(desc, { x: colPos.desc, y, size: 10, font });
      page.drawText(String(item.cantidad), { x: colPos.cant, y, size: 10, font });
      page.drawText(`$${item.precioUnitario.toFixed(2)}`, { x: colPos.precio, y, size: 10, font });
      page.drawText(`$${item.totalProducto.toFixed(2)}`, { x: colPos.importe, y, size: 10, font });
      y -= lineHeight;
    });

    y -= 15;
    page.drawText("IMPORTE TOTAL", { x: margin, y, size: 12, font: fontBold, color: purple });
    page.drawText(`$${presupuesto.montoTotal.toFixed(2)}`, { x: colPos.importe, y, size: 12, font: fontBold });
    y -= 30;
    page.drawText("Atentamente, Oleohidráulica Guardese", { x: margin, y, size: 10, font });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=presupuesto_${idPresupuesto}.pdf`,
    );
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error al generar el PDF del presupuesto:", error);
    return res.status(500).json({ message: "Error al generar el PDF" });
  }
};
