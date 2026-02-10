import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUsuarios } from "../services/usuarios.service";
import { Usuario } from "../models/usuario.models";

const JWT_SECRET = process.env.JWT_SECRET || "ClaveAcceso";
const JWT_EXPIRES_IN = "1h";

export const loginUsuario = async (req: Request, res: Response) => {
  const { email, password } = {
    ...req.body,
    password: req.body.password || req.body.contraseña, // Aceptar ambos nombres
  };

  console.log("Datos recibidos en la solicitud:", { email, password });

  try {
    const mail = await getUsuarioBymail(email);

    if (!mail) {
      return res.status(404).json({ message: "Credenciales inválidas" });
    }
    if (mail.password !== password) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        id: mail.idUsuario, // Corregido de 'idusuario' a 'idUsuario'
        email: mail.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    return res.status(200).json({
      id: mail.idUsuario, // Incluir el ID del usuario en la respuesta
      token,
      esAdmin: mail.esAdmin, // Incluir la propiedad esAdmin en la respuesta
    });
  } catch (error) {
    return res.status(500).json({ message: "Error" });
  }
};

export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }
    (req as any).user = user;
    next();
  });
};

const getUsuarioBymail = async (
  email: string,
): Promise<Usuario | undefined> => {
  const usuarios: Usuario[] = (await getUsuarios()) as Usuario[];
  return usuarios.find((u) => u.email === email);
};
