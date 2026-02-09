import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ClaveAcceso";

interface JwtPayload {
  id: string;
  email: string;
  role: string; // Ejemplo de campo adicional en el payload del JWT
  iat?: number;
  exp?: number;
}

const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  console.log("Encabezado Authorization recibido:", authHeader);

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    console.log("Token decodificado:", jwt.verify(token, JWT_SECRET));
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export default jwtMiddleware;
