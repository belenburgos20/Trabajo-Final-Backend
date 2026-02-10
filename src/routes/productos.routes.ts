import { Router, Request, Response } from "express";
import {
  obtenerProductoPorCategoria,
  obtenerProductoPorCodigo,
  obtenerProductoPorNombre,
  ObtenerProductos,
  modificarProducto,
  eliminarProducto,
  agregarProducto,
} from "../controllers/productos.controller";
import jwtMiddleware from "../middleware/jwt.middleware";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Ruta de productos funcionando");
});

router.get("/list", ObtenerProductos);
router.get("/:idproducto", obtenerProductoPorCodigo);
router.get("/categoria/:idcategoria", obtenerProductoPorCategoria);
router.get("/productos/:nombre", obtenerProductoPorNombre);

router.post("/", jwtMiddleware, agregarProducto);
router.put("/:idproducto", jwtMiddleware, modificarProducto);
router.delete("/:idproducto", jwtMiddleware, eliminarProducto);

export default router;
