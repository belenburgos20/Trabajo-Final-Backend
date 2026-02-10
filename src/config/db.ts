import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config();

let databaseUrl = process.env.DATABASE_URL;
// Render (y pg v9+): usar verify-full para evitar el warning de seguridad.
// Si usás Internal Database URL en Render, no agregamos sslmode (conexión interna).
const isRenderExternal =
  databaseUrl &&
  databaseUrl.includes("render.com") &&
  !databaseUrl.includes("internal") &&
  !databaseUrl.includes("sslmode=");
if (isRenderExternal && databaseUrl) {
  databaseUrl += databaseUrl.includes("?") ? "&sslmode=verify-full" : "?sslmode=verify-full";
}

// Sequelize para la conexion a la base de datos
let sequelize: Sequelize;

if (databaseUrl) {
  const useSsl =
    databaseUrl.includes("sslmode=") ||
    (databaseUrl.includes("render.com") && !databaseUrl.includes("internal"));
  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: useSsl ? { require: true, rejectUnauthorized: false } : false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 10000,
      idle: 10000,
    },
    retry: {
      max: 3,
      match: [
        /Connection terminated unexpectedly/,
        /Connection refused/,
        /timeout/,
        /ECONNRESET/,
      ],
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME!,
    process.env.DB_USER!,
    process.env.DB_PASS!,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      dialect: "postgres",
      logging: false,
    },
  );
}

export { sequelize };

const poolSsl =
  databaseUrl &&
  (databaseUrl.includes("sslmode=") ||
    (databaseUrl.includes("render.com") && !databaseUrl.includes("internal")));

export const pool = new Pool({
  connectionString:
    databaseUrl ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
  ssl: poolSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
