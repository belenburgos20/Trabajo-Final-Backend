import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

//rutas

export default app;