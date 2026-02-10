import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                contraseña?: string;
                [key: string]: any;
            };
        }
    }
}

// Se asegura que la propiedad `user` sea opcional y esté correctamente definida.
// No se requiere cambio adicional ya que la propiedad `user` ya está declarada.

