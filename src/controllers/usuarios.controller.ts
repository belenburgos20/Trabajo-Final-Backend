import { Request, Response } from "express";
import { getUsuarios } from "../services/usuarios.service";
import { loginUsuario } from "./auth.controller";

export const ObtenerUsuarios = async (req: Request, res: Response) => {
    try {
        const usuarios = await getUsuarios();
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        return res.status(500).json({ message: "Error al obtener los usuarios" });
    }
};  
export const obtenerUsuarioPorId = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
        const usuarios = await getUsuarios();
        const usuario = usuarios.find((u: any) => u.id === id);
        if (usuario) {
            return res.status(200).json(usuario);
        } else {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener el usuario:", error);  
        return res.status(500).json({ message: "Error al obtener el usuario" });
    }
};
export const crearUsuario = async (req: Request, res: Response) => {
    try {
        const newUsuario = req.body;
        if (!newUsuario || !newUsuario.email || !newUsuario.contraseña) {
            return res.status(400).json({ message: "Datos de usuario incompletos" });
        }
        const usuarios = await getUsuarios();
        newUsuario.id = usuarios.length > 0 ? usuarios[usuarios.length - 1].id + 1 : 1;
        usuarios.push(newUsuario);
        return res.status(201).json({ message: "Usuario creado correctamente", usuario: newUsuario });
    }
    catch (error) {
        console.error("Error al crear el usuario:", error);
        return res.status(500).json({ message: "Error al crear el usuario" });
    }
};
export const modificarUsuario = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
        const usuarios = await getUsuarios();
        const usuarioIndex = usuarios.findIndex((u: any) => u.id === id);
        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex] = { ...usuarios[usuarioIndex], ...req.body };
            return res.status(200).json(usuarios[usuarioIndex]);
        }
        return res.status(404).json({ message: "Usuario no encontrado" });
    }
    catch (error) {
        console.error("Error al modificar el usuario:", error);
        return res.status(500).json({ message: "Error al modificar el usuario" });
    }
};
export const eliminarUsuario = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
        const usuarios = await getUsuarios();
        const usuarioIndex = usuarios.findIndex((u: any) => u.id === id);
        if (usuarioIndex !== -1) {
            usuarios.splice(usuarioIndex, 1);
            return res.status(200).json({ message: "Usuario eliminado correctamente" });
        }
        return res.status(404).json({ message: "Usuario no encontrado" });
    }
    catch (error) {
        console.error("Error al eliminar el usuario:", error);
        return res.status(500).json({ message: "Error al eliminar el usuario" });
    }
};
export const login = async (req: Request, res: Response) => {
    return loginUsuario(req, res);
};
export const logout = async (req: Request, res: Response) => {
    try {
        return res.status(200).json({ message: "Sesión cerrada" });
    }
    catch (error) {
        console.error("Error al cerrar sesión:", error);
        return res.status(500).json({ message: "Error al cerrar sesión" });
    }
};