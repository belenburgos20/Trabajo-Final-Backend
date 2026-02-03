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
    console.error("Error al obtener el producto:", error);
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
    console.error("Error al obtener los productos por categoría:", error);
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
    console.error("Error al obtener productos:", error);
    res.status(500).json({ mensaje: "Error al obtener productos" });
  }
};

export const modificarProducto = async (req: Request, res: Response) => {
  const codigo = req.params.codigo;
  const producto: Producto = req.body;
  try {
    const productos: Producto[] = await obtenerProductos();
    const index = productos.findIndex((p) => p.codigo === codigo);
    if (index === -1) {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    } else {
      productos[index] = producto;
      res.json({
        producto: productos[index],
        mensaje: "Producto modificado correctamente",
      });
    }
  } catch (error) {
    console.error("Error al modificar el producto:", error);
    res.status(500).json({ mensaje: "Error al modificar el producto" });
  }
};

export const eliminarProducto = async (req: Request, res: Response) => {
  const codigo = req.params.codigo;
  try {
    const productos: Producto[] = await obtenerProductos();
    const index = productos.findIndex((p) => p.codigo === codigo);
    if (index === -1) {
      res.status(404).json({ mensaje: "Producto no encontrado" });
    } else {
      productos.splice(index, 1);
      res.json(productos);
    }
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ mensaje: "Error al eliminar el producto" });
  }
};

export const agregarProducto = async (req: Request, res: Response) => {
  const producto: Producto = req.body;
  try {
    const productos: Producto[] = await obtenerProductos();
    productos.push(producto);
    res.json({ producto, mensaje: "Producto agregado correctamente" });
  } catch (error) {
    console.error("Error al agregar el producto:", error);
    res.status(500).json({ mensaje: "Error al agregar el producto" });
  }
};
