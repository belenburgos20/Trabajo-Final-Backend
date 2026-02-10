import { Request, Response } from "express";
import {
  obtenerPresupuestos,
  obtenerPresupuestoPorId,
  modificarPresupuesto,
  agregarPresupuesto,
  obtenerPresupuestosPorEstado,
} from "../controllers/presupuesto.controllers";

const mockDbQuery = jest.fn();
const mockPoolQuery = jest.fn();
const mockSequelizeQuery = jest.fn();

jest.mock("../config/db", () => ({
  __esModule: true,
  default: {
    query: (...args: any[]) => mockDbQuery.apply(null, args),
  },
  pool: {
    query: (...args: any[]) => mockPoolQuery.apply(null, args),
  },
  sequelize: {
    query: (...args: any[]) => mockSequelizeQuery.apply(null, args),
  },
}));

jest.mock("../services/presupuesto.service", () => ({
  ObtenerPresupuestos: jest.fn(),
}));

import { ObtenerPresupuestos } from "../services/presupuesto.service";

const mockObtenerPresupuestos = ObtenerPresupuestos as jest.MockedFunction<
  typeof ObtenerPresupuestos
>;

describe("Presupuesto Controller", () => {
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

  describe("obtenerPresupuestos", () => {
    it("debe retornar lista de presupuestos con status 200", async () => {
      const rows = [
        {
          id: 1,
          idUsuario: 1,
          nombre_usuario: "Juan",
          fecha_creacion: new Date(),
          estado: "Pendiente",
          monto_total: 1000,
        },
      ];
      mockDbQuery.mockResolvedValue({ rows });

      await obtenerPresupuestos(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            idPresupuesto: 1,
            estado: "Pendiente",
            montoTotal: 1000,
            detalle: [],
          }),
        ]),
      );
    });

    it("debe retornar 500 en caso de error", async () => {
      mockDbQuery.mockRejectedValue(new Error("DB error"));

      await obtenerPresupuestos(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Error al obtener presupuestos",
      });
    });
  });

  describe("obtenerPresupuestoPorId", () => {
    it("debe retornar 404 cuando el presupuesto no existe", async () => {
      mockDbQuery.mockResolvedValueOnce({ rows: [] });
      mockRequest = { params: { idPresupuesto: "999" } };

      await obtenerPresupuestoPorId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Presupuesto no encontrado",
      });
    });

    it("debe retornar presupuesto con detalle cuando existe", async () => {
      const presupuestoRow = {
        idpresupuesto: 1,
        fecha_creacion: new Date("2024-01-01"),
        estado: "Aprobado",
        monto_total: 500,
      };
      const detallesRows = [
        {
          iddetallepresupuesto: 1,
          nombre_producto: "Producto A",
          cantidad: 2,
          precio: 100,
          total_producto: 200,
        },
      ];
      mockDbQuery
        .mockResolvedValueOnce({ rows: [presupuestoRow] })
        .mockResolvedValueOnce({ rows: detallesRows });
      mockRequest = { params: { idPresupuesto: "1" } };

      await obtenerPresupuestoPorId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          idPresupuesto: 1,
          estado: "Aprobado",
          montoTotal: 500,
          detalle: expect.arrayContaining([
            expect.objectContaining({
              idDetallePresupuesto: 1,
              nombreProducto: "Producto A",
              cantidad: 2,
              precioUnitario: 100,
              totalProducto: 200,
            }),
          ]),
        }),
      );
    });
  });

  describe("modificarPresupuesto", () => {
    it("debe retornar 400 cuando no se envía estado", async () => {
      mockRequest = {
        params: { idPresupuesto: "1" },
        body: {},
      };

      await modificarPresupuesto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "El estado es obligatorio",
      });
      expect(mockPoolQuery).not.toHaveBeenCalled();
    });

    it("debe retornar 404 cuando el presupuesto no existe", async () => {
      mockPoolQuery.mockResolvedValue({ rowCount: 0, rows: [] });
      mockRequest = {
        params: { idPresupuesto: "999" },
        body: { estado: "Aprobado" },
      };

      await modificarPresupuesto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Presupuesto no encontrado",
      });
    });

    it("debe actualizar y retornar presupuesto cuando existe", async () => {
      const actualizado = {
        id: 1,
        estado: "Aprobado",
        monto_total: 1000,
      };
      mockPoolQuery.mockResolvedValue({ rowCount: 1, rows: [actualizado] });
      mockRequest = {
        params: { idPresupuesto: "1" },
        body: { estado: "Aprobado" },
      };

      await modificarPresupuesto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(actualizado);
    });
  });

  describe("agregarPresupuesto", () => {
    it("debe retornar 400 cuando falta idUsuario", async () => {
      mockRequest = {
        body: { detalle: [{ idProducto: 1, cantidad: 2, precio: 100 }] },
      };

      await agregarPresupuesto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "El idUsuario es requerido",
      });
    });

    it("debe retornar 400 cuando el detalle está vacío o no es array", async () => {
      mockRequest = {
        body: { idUsuario: 1, detalle: [] },
      };

      await agregarPresupuesto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: expect.stringContaining("detalle del presupuesto es requerido"),
      });
    });

    it("debe crear presupuesto y retornar 201 cuando los datos son válidos", async () => {
      mockSequelizeQuery
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);
      mockRequest = {
        body: {
          idUsuario: 1,
          estado: "Pendiente",
          detalle: [
            { idProducto: 1, cantidad: 2, precio: 100 },
            { idProducto: 2, cantidad: 1, precio: 50 },
          ],
        },
      };

      await agregarPresupuesto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Presupuesto creado exitosamente",
          idPresupuesto: 1,
        }),
      );
    });
  });

  describe("obtenerPresupuestosPorEstado", () => {
    it("debe retornar 404 cuando no hay presupuestos con ese estado", async () => {
      mockObtenerPresupuestos.mockResolvedValue([
        { idPresupuesto: 1, estado: "Pendiente", fecha: new Date() } as any,
      ]);
      mockRequest = { params: { estado: "Aprobado" } };

      await obtenerPresupuestosPorEstado(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "No se encontraron presupuestos con el estado Aprobado",
      });
    });

    it("debe retornar presupuestos filtrados cuando hay coincidencias", async () => {
      const presupuestos = [
        { idPresupuesto: 1, estado: "Pendiente", fecha: new Date() },
      ];
      mockObtenerPresupuestos.mockResolvedValue(presupuestos as any);
      mockRequest = { params: { estado: "pendiente" } };

      await obtenerPresupuestosPorEstado(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(presupuestos);
    });
  });
});
