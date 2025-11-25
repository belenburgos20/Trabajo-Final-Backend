import { Router, Request, Response } from "express";
import {obtenerCategorias, obtenerCategoriaPorId, obtenerCategoriaPorNombre, eliminarCategoria, modificarCategoria, agregarCategoria} from "../controllers/categoria.controllers";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.send("Ruta de categorias funcionando");
});

router.get("/list", obtenerCategorias);
router.get("/:idCategoria", obtenerCategoriaPorId);
router.get("/categorias/:nombre", obtenerCategoriaPorNombre);
router.put("/:idCategoria", modificarCategoria);
router.delete("/:idCategoria", eliminarCategoria);
router.post("/", agregarCategoria);

export default router;

