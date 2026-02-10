import { sequelize } from "../config/db";

export const obtenerDetallesPresupuesto = async () => {
  try {
    const [results] = await sequelize.query(
      "SELECT * FROM detalles_presupuesto",
    );
    return results;
  } catch (error) {
    console.error(
      "Error al obtener detalles de presupuesto desde la base de datos:",
      error,
    );
    throw error;
  }
};
