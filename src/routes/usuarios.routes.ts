import {Router} from "express";
import {ObtenerUsuarios, obtenerUsuarioPorId, crearUsuario, modificarUsuario, eliminarUsuario, login, logout} from "../controllers/usuarios.controller";
import jwtMiddleware from "../middleware/jwt.middleware";

const router = Router();

router.post("/login", login);
router.post("/", crearUsuario);

router.get("/", jwtMiddleware, ObtenerUsuarios);
router.get("/:id", jwtMiddleware, obtenerUsuarioPorId);
router.put("/:id", jwtMiddleware, modificarUsuario);
router.delete("/:id", jwtMiddleware, eliminarUsuario);
router.post("/logout", jwtMiddleware, logout);

export default router;
