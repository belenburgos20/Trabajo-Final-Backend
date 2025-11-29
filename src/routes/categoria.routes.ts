import { Router, Request, Response } from "express";
import {obtenerCategorias, obtenerCategoriaPorId, obtenerCategoriaPorNombre, eliminarCategoria, modificarCategoria, agregarCategoria} from "../controllers/categoria.controllers";
import jwtMiddleware from "../middleware/jwt.middleware";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.send("Ruta de categorias funcionando");
});

router.get("/list", obtenerCategorias);
router.get("/:idCategoria", obtenerCategoriaPorId);
router.get("/categorias/:nombre", obtenerCategoriaPorNombre);

router.post("/", jwtMiddleware, agregarCategoria);
router.put("/:idCategoria", jwtMiddleware, modificarCategoria);
router.delete("/:idCategoria", jwtMiddleware, eliminarCategoria);

export default router;

