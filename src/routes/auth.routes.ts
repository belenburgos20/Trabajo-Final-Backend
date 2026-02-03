import { Router } from "express";
import { loginUsuario } from "../controllers/auth.controller";

const router = Router();

// Ruta para el login de usuarios
router.post("/login", loginUsuario);

export default router;
