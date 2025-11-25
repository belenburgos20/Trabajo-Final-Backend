import { Router } from "express";
import { obtenerPresupuestos, obtenerPresupuestoPorId, obtenerPresupuestoPorUsuario, modificarPresupuesto, eliminarPresupuesto, agregarPresupuesto, obtenerPresupuestosPorFecha, obtenerPresupuestosPorEstado } from "../controllers/presupuesto.controllers";

const router = Router();

router.get("/", obtenerPresupuestos);
router.get("/:idPresupuesto", obtenerPresupuestoPorId);
router.get("/usuario/:idUsuario", obtenerPresupuestoPorUsuario);
router.get("/fecha/:fecha", obtenerPresupuestosPorFecha);
router.get("/estado/:estado", obtenerPresupuestosPorEstado);
router.put("/:idPresupuesto", modificarPresupuesto);
router.post("/", agregarPresupuesto); 
router.delete("/:idPresupuesto", eliminarPresupuesto);

export default router;
