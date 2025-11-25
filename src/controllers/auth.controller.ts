import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUsuarios } from "../services/usuarios.service";

const JWT_SECRET = process.env.JWT_SECRET || "ClaveAcceso";
const JWT_EXPIRES_IN = "1h";

export const loginUsuario = async (req: Request, res: Response) => {
    const { email, contraseña } = req.body;
    try {
        const mail = await getUsuarioBymail(email);
        if (!mail) {
            return res.status(404).json({ message: "Credenciales inválidas" });
        }
        if (mail.contraseña !== contraseña) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            {
                email: mail.email,
                contraseña: mail.contraseña

            }, JWT_SECRET, 

        { expiresIn: JWT_EXPIRES_IN });
        return res.status(200).json({ token });
        }  
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Error" });
    }
};

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
    
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


const getUsuarioBymail = async (email: string) => {
    const usuarios = await getUsuarios();
    return usuarios.find((u: any) => u.email === email);
};