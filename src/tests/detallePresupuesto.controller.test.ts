import { Request, Response } from "express";
import {
  modificarCantidad,
  modificarPrecio,
  modificarDetalle,
  eliminarDetalle,
} from "../controllers/detallePresupuesto.controllers";

jest.mock("../services/detallePresupuesto.service", () => ({
  obtenerDetallesPresupuesto: jest.fn(),
}));

jest.mock("../services/productos.service", () => ({
  obtenerProductos: jest.fn(),
}));

describe("Detalle Presupuesto Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    jest.clearAllMocks();
  });

  describe("modificarCantidad", () => {
    it("debe retornar 404 cuando el detalle no existe", () => {
      mockRequest = {
        params: { idDetalle: "99999" },
        body: { cantidad: 5 },
      };

      modificarCantidad(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: "Producto no encontrado",
      });
    });
  });

  describe("modificarPrecio", () => {
    it("debe retornar 404 cuando el detalle no existe", () => {
      mockRequest = {
        params: { idDetalle: "99999" },
        body: { precio: 150 },
      };

      modificarPrecio(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: "Producto no encontrado",
      });
    });
  });

  describe("modificarDetalle", () => {
    it("debe retornar 404 cuando el detalle no existe", () => {
      mockRequest = {
        params: { idDetalle: "99999" },
        body: { cantidad: 3, precio: 200 },
      };

      modificarDetalle(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: "Producto no encontrado",
      });
    });
  });

  describe("eliminarDetalle", () => {
    it("debe retornar 404 cuando el detalle no existe", () => {
      mockRequest = { params: { idDetalle: "99999" } };

      eliminarDetalle(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: "Producto no encontrado",
      });
    });
  });
});
