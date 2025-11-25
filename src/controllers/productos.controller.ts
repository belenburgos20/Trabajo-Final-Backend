import {Request, Response} from "express";
import { obtenerProductos } from "../services/productos.service";

export const ObtenerProductos = async (req: Request, res: Response) => {
    try {
        const productos = await obtenerProductos();
        res.json(productos);
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ mensaje: "Error al obtener los productos" });
    }
};

export const obtenerProductoPorCodigo = async (req: Request, res: Response) => {
    const codigo = req.params.codigo;
    try {
        const productos = await obtenerProductos();
        const producto = productos.find(p => p.codigo === codigo);
        if (producto) {
            res.json(producto);
        } else {
            res.status(404).json({ mensaje: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        res.status(500).json({ mensaje: "Error al obtener el producto" });
    }
};

export const obtenerProductoPorCategoria = async (req: Request, res: Response) => {
    const idCategoria = parseInt(req.params.idcategoria);
    try {
        const productos = await obtenerProductos();
        const productosFiltrados = productos.filter(p => p.idCategoria === idCategoria);
        res.json(productosFiltrados);
    }
    catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ mensaje: "Error al obtener productos" });
    }
};

export const obtenerProductoPorNombre = async (req: Request, res: Response) => {
    const nombre = req.params.nombre.toLowerCase();
    try {
        const productos = await obtenerProductos();
        const productosFiltrados = productos.filter(p => p.nombre.toLowerCase()=== nombre || p.nombre.toLowerCase().includes(nombre));
        if (productosFiltrados.length > 0) {
            res.status(200).json(productosFiltrados);
        }
        else {
            res.status(404).json({ mensaje: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ mensaje: "Error al obtener productos" });
    }
};
export const modificarProducto = async (req: Request, res: Response) => {
    const codigo = req.params.codigo;
    const producto = req.body;
    try {
        const productos = await obtenerProductos();
        const index = productos.findIndex(p => p.codigo === codigo);
        if (index === -1) {
            res.status(404).json({ mensaje: "Producto no encontrado" });
        } else {
            productos[index] = producto;
            res.json({ producto: productos[index], mensaje: "Producto modificado correctamente" });
        }
    } catch (error) {
        console.error("Error al modificar el producto:", error);
        res.status(500).json({ mensaje: "Error al modificar el producto" });
    }
};

export const eliminarProducto = async (req: Request, res: Response) => {
    const codigo = req.params.codigo;
    try {
        const productos = await obtenerProductos();
        const index = productos.findIndex(p => p.codigo === codigo);
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
    const producto = req.body;
    try {
        const productos = await obtenerProductos();
        productos.push(producto);
        res.json({ producto, mensaje: "Producto agregado correctamente" });
    } catch (error) {
        console.error("Error al agregar el producto:", error);
        res.status(500).json({ mensaje: "Error al agregar el producto" });
    }
};

