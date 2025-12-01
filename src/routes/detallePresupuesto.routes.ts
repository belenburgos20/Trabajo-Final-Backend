import { Router } from "express";
import {obtenerDetallesPorPresupuesto, agregarDetallePresupuesto, modificarCantidad, modificarPrecio, modificarDetalle, eliminarDetalle} from "../controllers/detallePresupuesto.controllers";
import jwtMiddleware from "../middleware/jwt.middleware";

const router = Router();

router.get("/presupuesto/:idPresupuesto", jwtMiddleware, obtenerDetallesPorPresupuesto);
router.post("/presupuesto/:idPresupuesto", jwtMiddleware, agregarDetallePresupuesto);
router.put("/:idDetalle/cantidad", jwtMiddleware, modificarCantidad);
router.put("/:idDetalle/precio", jwtMiddleware, modificarPrecio);
router.put("/:idDetalle", jwtMiddleware, modificarDetalle);
router.delete("/:idDetalle", jwtMiddleware, eliminarDetalle);

export default router;

