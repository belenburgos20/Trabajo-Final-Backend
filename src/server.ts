import app from "./app";
import {sequelize} from "./config/db";

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a PostgreSQL correctamente");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar la base de datos:", error);
  }
};

start();