import { NextFunction, Request, Response } from "express";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err.stack);
    res.status(500).json({ 
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
};

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ 
        message: "Ruta no encontrada",
        path: req.originalUrl 
    });
};

export { errorHandler, notFoundHandler };