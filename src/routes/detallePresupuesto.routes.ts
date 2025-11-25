import { Router } from "express";
import {obtenerDetallesPorPresupuesto, agregarDetallePresupuesto, modificarCantidad, modificarPrecio, modificarDetalle, eliminarDetalle} from "../controllers/detallePresupuesto.controllers";

const router = Router();

router.get("/presupuesto/:idPresupuesto", obtenerDetallesPorPresupuesto);
router.post("/presupuesto/:idPresupuesto", agregarDetallePresupuesto);
router.put("/:idDetalle/cantidad", modificarCantidad);
router.put("/:idDetalle/precio", modificarPrecio);
router.put("/:idDetalle", modificarDetalle);
router.delete("/:idDetalle", eliminarDetalle);

export default router;

