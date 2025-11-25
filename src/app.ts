import express from "express";
import cors from "cors";
import usuariosRoutes from "./routes/usuarios.routes";
import productosRoutes from "./routes/productos.routes";
import categoriasRoutes from "./routes/categoria.routes";
import presupuestosRoutes from "./routes/presupuesto.routes";
import detallePresupuestoRoutes from "./routes/detallePresupuesto.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/presupuestos", presupuestosRoutes);
app.use("/api/detalle-presupuesto", detallePresupuestoRoutes);

export default app;
