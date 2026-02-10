import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config();

let databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && databaseUrl.includes("render.com") && !databaseUrl.includes("sslmode=")) {
  databaseUrl += databaseUrl.includes("?") ? "&sslmode=require" : "?sslmode=require";
}

// Sequelize para la conexion a la base de datos
let sequelize: Sequelize;

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl:
        databaseUrl.includes("sslmode=require") || databaseUrl.includes("render.com")
          ? { require: true, rejectUnauthorized: false }
          : false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 10000,
      idle: 10000,
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

export const pool = new Pool({
  connectionString:
    databaseUrl ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
  ssl:
    databaseUrl && (databaseUrl.includes("render.com") || databaseUrl.includes("sslmode=require"))
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
