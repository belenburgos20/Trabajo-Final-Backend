import { Request, Response } from "express";
import { Usuario } from "../models/usuario.models";
import db from "../config/db"; // Conexión a la base de datos
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const ObtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await db.query("SELECT * FROM usuarios");
    return res.status(200).json(usuarios.rows);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};
export const obtenerUsuarioPorId = async (req: Request, res: Response) => {
  const idUsuario = parseInt(req.params.id, 10);
  console.log("ID recibido:", idUsuario);
  try {
    const resultado = await db.query(
      "SELECT * FROM usuarios WHERE idusuario = $1",
      [idUsuario],
    );
    console.log("Resultado de la consulta:", resultado.rows);
    const usuario = resultado.rows[0];

    if (usuario) {
      const usuarioMapeado = {
        ...usuario,
        id: usuario.idusuario, // Mapeo de idusuario a id
        cuit: usuario.cuit || "No disponible", // Asegurar que cuit esté presente
      };
      delete usuarioMapeado.idusuario; // Eliminamos el campo original
      return res.status(200).json(usuarioMapeado);
    } else {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return res.status(500).json({ message: "Error al obtener el usuario" });
  }
};
export const crearUsuario = async (req: Request, res: Response) => {
  const idUsuario = parseInt(req.params.id, 10);
  console.log("ID recibido:", idUsuario);
  console.log("Datos recibidos en la solicitud para crear usuario:", req.body);
  try {
    const {
      nombre,
      email,
      password: password,
      CUIT,
      direccion,
      telefono,
      esAdmin,
      localidad,
    } = {
      ...req.body,
      password: req.body.password || req.body.contraseña, // Aceptar ambos nombres
    };

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Datos de usuario incompletos" });
    }

    // Verificar si el email ya existe
    const emailExistente = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email],
    );

    if (emailExistente.rows.length > 0) {
      console.log(
        "Error: El correo electrónico ya está registrado. Por favor, inicie sesión o use otro correo.",
      ); // Log para depuración
      return res.status(400).json({
        message:
          "El correo electrónico ya está registrado. Por favor, inicie sesión o use otro correo.",
      });
    }

    const nuevoUsuario = await db.query(
      `INSERT INTO usuarios (nombre, email, password, cuit, direccion, telefono, "esAdmin", localidad)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING idusuario AS "idUsuario", nombre, email, cuit, direccion, telefono, "esAdmin", localidad`,
      [
        nombre,
        email,
        password,
        CUIT || null,
        direccion || null,
        telefono || null,
        esAdmin || false,
        localidad || null,
      ],
    );

    // Mapear el campo idusuario a id
    const usuarioCreado = {
      id: nuevoUsuario.rows[0].idusuario, // Mapeo del ID
      nombre: nuevoUsuario.rows[0].nombre,
      email: nuevoUsuario.rows[0].email,
      cuit: nuevoUsuario.rows[0].cuit,
      direccion: nuevoUsuario.rows[0].direccion,
      telefono: nuevoUsuario.rows[0].telefono,
      esAdmin: nuevoUsuario.rows[0].esAdmin,
      localidad: nuevoUsuario.rows[0].localidad,
    };

    // Generar token JWT
    const token = jwt.sign(
      { id: nuevoUsuario.rows[0].idusuario, email: nuevoUsuario.rows[0].email },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.status(201).json({
      message: "Usuario creado correctamente",
      usuario: usuarioCreado,
      token,
    });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    return res.status(500).json({ message: "Error al crear el usuario" });
  }
};
export const modificarUsuario = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const {
    nombre,
    email,
    contraseña,
    CUIT,
    direccion,
    telefono,
    esAdmin,
    localidad,
  } = req.body;

  try {
    const resultado = await db.query(
      "SELECT * FROM usuarios WHERE idusuario = $1",
      [id],
    );
    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuarioActualizado = await db.query(
      `UPDATE usuarios SET nombre = $1, email = $2, "contraseña" = $3, cuit = $4, direccion = $5, telefono = $6, esadmin = $7, localidad = $8 WHERE idusuario = $9 RETURNING *`,
      [
        nombre || usuario.nombre,
        email || usuario.email,
        contraseña || usuario.contraseña,
        CUIT || usuario.cuit,
        direccion || usuario.direccion,
        telefono || usuario.telefono,
        esAdmin || usuario.esadmin,
        localidad || usuario.localidad,
        id,
      ],
    );

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      usuario: usuarioActualizado.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};
export const eliminarUsuario = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    const resultado = await db.query("SELECT * FROM usuarios");
    const usuarios: Usuario[] = resultado.rows;
    const usuarioIndex = usuarios.findIndex((u) => u.idUsuario === id);

    if (usuarioIndex !== -1) {
      await db.query("DELETE FROM usuarios WHERE idusuario = $1", [id]);
      return res
        .status(200)
        .json({ message: "Usuario eliminado correctamente" });
    }

    return res.status(404).json({ message: "Usuario no encontrado" });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    return res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};
export const login = async (req: Request, res: Response) => {
  return res.status(501).json({ message: "Función no implementada" });
};
export const logout = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ message: "Sesión cerrada" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return res.status(500).json({ message: "Error al cerrar sesión" });
  }
};
