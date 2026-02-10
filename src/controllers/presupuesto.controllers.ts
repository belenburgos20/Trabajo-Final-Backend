import { Request, Response } from "express";
import db, { sequelize } from "../config/db";
import { Presupuesto } from "../models/presupuesto.models";
import { detallePresupuesto } from "../models/detallePresupuesto.models";
import { ObtenerPresupuestos } from "../services/presupuesto.service";
import { obtenerDetallesPresupuesto } from "../services/detallePresupuesto.service";
import { pool } from "../config/db";
import puppeteer from "puppeteer";
import fs from "fs";

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

    // Generar HTML para el PDF
    const htmlContent = `
      <html>
      <head>
        <meta charset="UTF-8" />
        
      </head>
      <style>
        body {
          font-family: "Arial", sans-serif;
          margin: 45px;
          color: #2b2b2b;
          font-size: 14px;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 15px;
          border-bottom: 3px solid #4b2c82;
          margin-bottom: 25px;
        }

        .titulo {
          font-size: 30px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #4b2c82;
        }

        .empresa {
          margin-top: 8px;
          font-size: 13px;
          line-height: 1.6;
          color: #555;
        }

        .logo {
          width: 130px;
          object-fit: contain;
        }
        .bloque {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          background: #f6f6f9;
          border-left: 5px solid #4b2c82;
          padding: 18px;
          margin-top: 30px;
          border-radius: 6px;
        }

        .bloque > div {
          width: 50%;
          font-size: 14px;
          line-height: 1.6;
        }

        .bloque h3 {
          margin: 0 0 8px 0;
          font-size: 15px;
          color: #4b2c82;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 35px;
        }

        thead th {
          background: #4b2c82;
          color: #fff;
          padding: 10px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        tbody td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          font-size: 14px;
        }

        tbody tr:nth-child(even) {
          background-color: #fafafa;
        }

        .right {
          text-align: right;
        }

        .totales {
          display: flex;
          justify-content: flex-end;
          margin-top: 25px;
        }

        .totales table {
          width: 45%;
          border: 2px solid #4b2c82;
          border-radius: 6px;
          overflow: hidden;
        }

        .totales th {
          background: #f1eef9;
          padding: 12px;
          font-size: 15px;
          text-align: left;
          color: #4b2c82;
        }

        .totales td {
          padding: 12px;
          font-size: 16px;
          font-weight: bold;
          text-align: right;
        }
        .footer {
          margin-top: 45px;
          font-size: 13px;
          color: #555;
          line-height: 1.8;
        }
      </style>
      <body>
        <!-- Encabezado -->
        <div class="top">
          <div>
            <div class="titulo">PRESUPUESTO</div>
            <div class="empresa">
              Oleohidráulica Guardese<br />
              Bravard 1469 – Bahía Blanca<br />
              Tel: 0291 517-1986<br />
              claudioguardes@hotmail.com
            </div>
          </div>

          <img
            src="https://res.cloudinary.com/dzj8q3l6n/image/upload/v1700000000/guardese-logo.png"
            class="logo"
          />
        </div>

        <!-- Cliente / Presupuesto -->
        <div class="bloque">
          <div>
            <h3>Cliente</h3>
            ${presupuesto.cliente.nombre}<br />
            ${presupuesto.cliente.direccion}<br />
            Tel: ${presupuesto.cliente.telefono}<br />
            ${presupuesto.cliente.email}
          </div>

          <div>
            <h3>N° de Presupuesto</h3>
            ${presupuesto.idPresupuesto}<br /><br />
            <strong>Fecha:</strong> ${presupuesto.fecha}
          </div>
        </div>

        <!-- Tabla -->
        <table>
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Descripción</th>
              <th>Cant.</th>
              <th>Precio Unit.</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            ${presupuesto.detalle.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.nombreProducto}</td>
                <td class="right">${item.cantidad}</td>
                <td class="right">$${item.precioUnitario.toFixed(2)}</td>
                <td class="right">$${item.totalProducto.toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <!-- Totales -->
        <div class="totales">
          <table>
            <tr>
              <th>IMPORTE TOTAL</th>
              <th class="right">$${presupuesto.montoTotal.toFixed(2)}</th>
            </tr>
          </table>
        </div>

        <div class="footer">
          Atentamente,<br />
          Oleohidráulica Guardese
        </div>
      </body>
      </html>
    `;

    console.log("HTML generado para el PDF:", htmlContent);

    // Generar el PDF con Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    console.log("PDF generado correctamente");

    // Guardar el PDF generado en el servidor para depuración
    const fs = require("fs");
    const filePath = `./presupuesto_${idPresupuesto}.pdf`;
    fs.writeFileSync(filePath, pdfBuffer);
    console.log(`PDF guardado en el servidor: ${filePath}`);

    // Configurar la respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=presupuesto_${idPresupuesto}.pdf`,
    );
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error al generar el PDF del presupuesto:", error);
    return res.status(500).json({ message: "Error al generar el PDF" });
  }
};
