import {Router} from "express";
import {ObtenerUsuarios, obtenerUsuarioPorId, crearUsuario, modificarUsuario, eliminarUsuario, login, logout} from "../controllers/usuarios.controller";

const router = Router();
router.get("/", ObtenerUsuarios);
router.get("/:id", obtenerUsuarioPorId);
router.post("/", crearUsuario);
router.put("/:id", modificarUsuario);
router.delete("/:id", eliminarUsuario);
router.post("/login", login);
router.post("/logout", logout);

export default router;
