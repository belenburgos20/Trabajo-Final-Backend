import { sequelize } from "../config/db";
import { QueryTypes } from "sequelize";
import { Usuario } from "../models/usuario.models"; // Importar el modelo Usuario

export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    console.log(
      "Ejecutando consulta SQL:",
      'SELECT idusuario AS "idUsuario", nombre, email, password, CUIT, direccion, telefono, "esAdmin", localidad FROM usuarios',
    );
    const [results] = await sequelize.query(
      'SELECT idusuario AS "idUsuario", nombre, email, password, CUIT, direccion, telefono, "esAdmin", localidad FROM usuarios',
    );
    return results as Usuario[]; // Tipar explícitamente el resultado como Usuario[]
  } catch (error) {
    console.error("Error al obtener usuarios desde la base de datos:", error);
    throw error;
  }
};

export const getUsuarioById = async (
  idUsuario: number,
): Promise<Usuario | null> => {
  try {
    console.log(
      "Ejecutando consulta SQL para obtener usuario por ID:",
      idUsuario,
    );
    const results = await sequelize.query(
      'SELECT idusuario AS "idUsuario", nombre, email, password, CUIT, direccion, telefono, "esAdmin", localidad FROM usuarios WHERE idusuario = :idUsuario',
      {
        replacements: { idUsuario },
        type: QueryTypes.SELECT,
      },
    );

    if (results.length > 0) {
      return results[0] as Usuario;
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      "Error al obtener usuario por ID desde la base de datos:",
      error,
    );
    throw error;
  }
};
