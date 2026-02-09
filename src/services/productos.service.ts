import { sequelize } from "../config/db";
import { Producto } from "../models/producto.models";

export const obtenerProductos = async (): Promise<Producto[]> => {
  try {
    const [results] = await sequelize.query("SELECT * FROM productos");

    return results as Producto[];
  } catch (error) {
    console.error("Error al obtener productos desde la base de datos:", error);
    throw error;
  }
};
