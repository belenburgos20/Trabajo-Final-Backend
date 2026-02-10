import { Router } from "express";
import {
  obtenerPresupuestos,
  obtenerPresupuestoPorId,
  obtenerPresupuestoPorUsuario,
  modificarPresupuesto,
  eliminarPresupuesto,
  agregarPresupuesto,
  obtenerPresupuestosPorFecha,
  obtenerPresupuestosPorEstado,
  generarPDFPresupuesto,
} from "../controllers/presupuesto.controllers";
import jwtMiddleware from "../middleware/jwt.middleware";

const router = Router();

router.use("/api/presupuestos", router);

router.get("/", jwtMiddleware, obtenerPresupuestos);

router.get("/usuario/:idUsuario", jwtMiddleware, obtenerPresupuestoPorUsuario);
router.get("/fecha/:fecha", jwtMiddleware, obtenerPresupuestosPorFecha);
router.get("/estado/:estado", jwtMiddleware, obtenerPresupuestosPorEstado);

router.get("/:idPresupuesto", jwtMiddleware, obtenerPresupuestoPorId);
router.get("/:idPresupuesto/pdf", jwtMiddleware, generarPDFPresupuesto);

router.post("/", jwtMiddleware, agregarPresupuesto);
router.put("/:idPresupuesto", jwtMiddleware, modificarPresupuesto);
router.delete("/:idPresupuesto", jwtMiddleware, eliminarPresupuesto);

export default router;
