import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

// Sequelize para la conexion a la base de datos
let sequelize: Sequelize;

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
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

const pool = new Pool({
  connectionString:
    databaseUrl ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
  ssl: databaseUrl
    ? {
        rejectUnauthorized: false,
      }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
