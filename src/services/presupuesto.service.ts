import { sequelize } from "../config/db";
import { Presupuesto } from "../models/presupuesto.models";

export const ObtenerPresupuestos = async (): Promise<Presupuesto[]> => {
  try {
    const [results] = await sequelize.query("SELECT * FROM presupuestos");
    return results as Presupuesto[];
  } catch (error) {
    console.error(
      "Error al obtener presupuestos desde la base de datos:",
      error,
    );
    throw error;
  }
};

export const ObtenerPresupuestosPorUsuario = async (
  idUsuario: number,
): Promise<Presupuesto[]> => {
  try {
    const [results] = await sequelize.query(
      "SELECT * FROM presupuestos WHERE idusuario = :idusuario",
      {
        replacements: { idusuario: idUsuario },
      },
    );
    return results as Presupuesto[];
  } catch (error) {
    console.error(
      "Error al obtener presupuestos por usuario desde la base de datos:",
      error,
    );
    throw error;
  }
};
