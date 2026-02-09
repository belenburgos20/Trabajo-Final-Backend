import { Request, Response } from "express";
import db from "../config/db";
import { Producto } from "../models/producto.models";
import { obtenerProductos } from "../services/productos.service";

export const ObtenerProductos = async (req: Request, res: Response) => {
  try {
    const productos = await db.query(
      `SELECT p.idProducto, p.nombre, p.descripcion, p.precio, p.stock, 
              p.id_categoria AS "idCategoria", c.nombre AS "categoria_nombre"
       FROM productos p
       LEFT JOIN categorias c ON p.id_categoria = c.id_categoria`,
    );
    res.json(productos.rows);
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.status(500).json({ mensaje: "Error al obtener los productos" });
  }
};

export const obtenerProductoPorCodigo = async (req: Request, res: Response) => {
  const codigo = req.params.codigo;
  try {
    const producto = await db.query(
      "SELECT * FROM productos WHERE codigo = $1",
      [codigo],
    );
    if (producto.rows.length > 0) {
      res.json(producto.rows[0]);
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el producto" });
  }
};

export const obtenerProductoPorCategoria = async (
  req: Request,
  res: Response,
) => {
  const idCategoria = parseInt(req.params.idcategoria);
  try {
    const productos = await db.query(
      `SELECT p.idProducto, p.nombre, p.descripcion, p.precio, p.stock, 
              p.id_categoria AS "idCategoria", c.nombre AS "categoria_nombre"
       FROM productos p
       LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
       WHERE p.id_categoria = $1`,
      [idCategoria],
    );
    res.json(productos.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los productos por categoría",
    });
  }
};

export const obtenerProductoPorNombre = async (req: Request, res: Response) => {
  const nombre = req.params.nombre.toLowerCase();
  try {
    const productos = await db.query(
      "SELECT * FROM productos WHERE nombre ILIKE $1",
      [nombre],
    );
    if (productos.rows.length > 0) {
      res.status(200).json(productos.rows);
    } else {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener productos" });
  }
};

export const modificarProducto = async (req: Request, res: Response) => {
  const idProducto = parseInt(req.params.idproducto);
  const { nombre, descripcion, precio, stock, id_categoria } = req.body;

  // Validar que al menos uno de los campos esté presente
  if (!nombre && !descripcion && !precio && !stock && !id_categoria) {
    console.log("Error: No se proporcionaron campos para modificar");
    return res
      .status(400)
      .json({ mensaje: "Debe proporcionar al menos un campo para modificar" });
  }

  try {
    const productoExistente = await db.query(
      "SELECT * FROM productos WHERE idproducto = $1",
      [idProducto],
    );

    if (productoExistente.rows.length === 0) {
      console.log("Error: Producto no encontrado con id:", idProducto);
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    // Construir dinámicamente la consulta de actualización
    const campos = [];
    const valores = [];

    if (nombre) {
      campos.push("nombre = $" + (campos.length + 1));
      valores.push(nombre);
    }
    if (descripcion) {
      campos.push("descripcion = $" + (campos.length + 1));
      valores.push(descripcion);
    }
    if (precio) {
      campos.push("precio = $" + (campos.length + 1));
      valores.push(precio);
    }
    if (stock) {
      campos.push("stock = $" + (campos.length + 1));
      valores.push(stock);
    }
    if (id_categoria) {
      campos.push("id_categoria = $" + (campos.length + 1));
      valores.push(id_categoria);
    }

    valores.push(idProducto);

    const query = `UPDATE productos SET ${campos.join(", ")} WHERE idproducto = $${valores.length} RETURNING *`;

    const resultado = await db.query(query, valores);

    res.json({
      producto: resultado.rows[0],
      mensaje: "Producto modificado correctamente",
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al modificar el producto" });
  }
};

export const eliminarProducto = async (req: Request, res: Response) => {
  const idProducto = parseInt(req.params.idproducto);

  console.log("ID del producto a eliminar:", idProducto);

  try {
    const productoExistente = await db.query(
      "SELECT * FROM productos WHERE idproducto = $1",
      [idProducto],
    );

    if (productoExistente.rows.length === 0) {
      console.log("Error: Producto no encontrado con id:", idProducto);
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    await db.query("DELETE FROM productos WHERE idproducto = $1", [idProducto]);

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el producto" });
  }
};

export const agregarProducto = async (req: Request, res: Response) => {
  const { nombre, descripcion, precio, stock, id_categoria } = req.body;

  // Validar que los campos requeridos no sean nulos
  if (!nombre || !precio || !stock || !id_categoria) {
    return res.status(400).json({
      mensaje:
        "Todos los campos requeridos deben estar presentes: nombre, precio, stock, id_categoria",
    });
  }

  try {
    const nuevoProducto = await db.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, descripcion, precio, stock, id_categoria],
    );

    res.json({
      producto: nuevoProducto.rows[0],
      mensaje: "Producto agregado correctamente",
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al agregar el producto" });
  }
};
