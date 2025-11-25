import { Request, Response } from "express";
import { ObtenerCategorias } from "../services/categorias.service";

export const obtenerCategorias = async (req: Request, res: Response) => {
    try {
        const categorias = await ObtenerCategorias();
        if (categorias){
            return res.status(200).json(categorias);}
        else {
            return res.status(404).json({ message: "No se encontraron categorías" });
        }
    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        return res.status(500).json({ message: "Error al obtener las categorías" });
    }
};
export const obtenerCategoriaPorId = async (req: Request, res: Response) => {
    const idCategoria = parseInt(req.params.idCategoria, 10);
    try {
        const categorias = await ObtenerCategorias();
        const categoria = categorias.find(c => c.idCategoria === idCategoria);
        if (categoria) {
            return res.status(200).json(categoria);
        } else {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }
    } catch (error) {
        console.error("Error al obtener la categoría:", error);
        return res.status(500).json({ message: "Error al obtener la categoría" });
    }
};
export const obtenerCategoriaPorNombre = async (req: Request, res: Response) => {
    const nombre = req.params.nombre;
    try {
        const categorias = await ObtenerCategorias();
        const categoria = categorias.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
        if (categoria) {
            return res.status(200).json(categoria);
        }
        return res.status(404).json({ message: "Categoría no encontrada" });
    } catch (error) {
        console.error("Error al obtener la categoría por nombre:", error);
        return res.status(500).json({ message: "Error al obtener la categoría por nombre" });
    }
};
export const modificarCategoria = async (req: Request, res: Response) => {
    const idCategoria = parseInt(req.params.idCategoria, 10);
    try {
        const categorias = await ObtenerCategorias();
        const categoriaIndex = categorias.findIndex(c => c.idCategoria === idCategoria);
        if (categoriaIndex !== -1) {
            categorias[categoriaIndex] = { ...categorias[categoriaIndex], ...req.body };
            return res.status(200).json(categorias[categoriaIndex]);
        }
        return res.status(404).json({ message: "No se puede encontrar categoría" });
    } catch (error) {
        console.error("Error al modificar la categoría:", error);
        return res.status(500).json({ message: "Error al modificar la categoría" });
    }
};
export const agregarCategoria = async (req: Request, res: Response  ) => {
    try {
        const categorias = await ObtenerCategorias();
        const nuevaCategoria = req.body;
        categorias.push(nuevaCategoria);
        return res.status(201).json(nuevaCategoria);
    } catch (error) {
        console.error("Error al agregar la categoría:", error);
        return res.status(500).json({ message: "Error al agregar la categoría" });
    }
};
export const eliminarCategoria = async (req: Request, res: Response) => {
    const idCategoria = parseInt(req.params.idCategoria, 10);
    try {
        const categorias = await ObtenerCategorias();
        const categoriaIndex = categorias.findIndex(c => c.idCategoria === idCategoria);
        if (categoriaIndex !== -1) {
            categorias.splice(categoriaIndex, 1);
            return res.status(200).json({ message: "Categoría eliminada correctamente" });
        }   
        return res.status(404).json({ message: "Categoría no encontrada" });
    } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        return res.status(500).json({ message: "Error al eliminar la categoría" });
    } 
};