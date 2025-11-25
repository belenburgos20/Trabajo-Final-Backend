import { Router, Request, Response } from "express";
import { obtenerProductoPorCategoria, obtenerProductoPorCodigo, obtenerProductoPorNombre, ObtenerProductos, modificarProducto, eliminarProducto, agregarProducto } from "../controllers/productos.controller";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.send("Ruta de productos funcionando");
});

router.get("/list", ObtenerProductos);
router.get("/:codigo", obtenerProductoPorCodigo);
router.get("/categoria/:idcategoria", obtenerProductoPorCategoria);
router.get("/productos/:nombre", obtenerProductoPorNombre);
router.put("/:codigo", modificarProducto);
router.delete("/:codigo", eliminarProducto);
router.post("/", agregarProducto);

export default router;

