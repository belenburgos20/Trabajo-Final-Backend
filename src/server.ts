import app from "./app";
import dotenv from "dotenv";
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  const baseUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.VERCEL_URL ||
    null;
  console.log(
    `Servidor corriendo en el puerto ${PORT}`,
    baseUrl ? `→ ${baseUrl}` : `(local: http://localhost:${PORT})`
  );
});
