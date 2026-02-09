import { Request, Response } from "express";
import {
  ObtenerProductos,
  obtenerProductoPorCodigo,
  agregarProducto,
  modificarProducto,
  eliminarProducto,
  obtenerProductoPorNombre,
} from "../controllers/productos.controller";

const mockQuery = jest.fn();
jest.mock("../config/db", () => ({
  __esModule: true,
  default: {
    query: (...args: any[]) => mockQuery.apply(null, args),
  },
}));

describe("Productos Controller", () => {
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

  describe("ObtenerProductos", () => {
    it("debe retornar lista de productos con status 200", async () => {
      const productos = [
        { idProducto: 1, nombre: "Producto 1", precio: 100, stock: 10 },
      ];
      mockQuery.mockResolvedValue({ rows: productos });
      mockRequest = {};

      await ObtenerProductos(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockQuery).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(productos);
    });

    it("debe retornar 500 en caso de error", async () => {
      mockQuery.mockRejectedValue(new Error("DB error"));
      mockRequest = {};

      await ObtenerProductos(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: "Error al obtener los productos",
      });
    });
  });

  describe("obtenerProductoPorCodigo", () => {
    it("debe retornar producto cuando existe", async () => {
      const producto = { idproducto: 1, codigo: "COD1", nombre: "Prod" };
      mockQuery.mockResolvedValue({ rows: [producto] });
      mockRequest = { params: { codigo: "COD1" } };

      await obtenerProductoPorCodigo(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM productos WHERE codigo = $1",
        ["COD1"],
      );
      expect(jsonMock).toHaveBeenCalledWith(producto);
    });

    it("debe retornar 404 cuando el producto no existe", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      mockRequest = { params: { codigo: "NOEXISTE" } };

      await obtenerProductoPorCodigo(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ mensaje: "Producto no encontrado" });
    });
  });

  describe("agregarProducto", () => {
    it("debe retornar 400 cuando faltan campos requeridos", async () => {
      mockRequest = {
        body: { nombre: "Prod" }, 
      };

      await agregarProducto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: expect.stringContaining("nombre, precio, stock, id_categoria"),
        }),
      );
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("debe crear producto y retornar 200 cuando los datos son válidos", async () => {
      const nuevoProducto = {
        idproducto: 1,
        nombre: "Nuevo",
        descripcion: "Desc",
        precio: 50,
        stock: 5,
        id_categoria: 1,
      };
      mockQuery.mockResolvedValue({ rows: [nuevoProducto] });
      mockRequest = {
        body: {
          nombre: "Nuevo",
          descripcion: "Desc",
          precio: 50,
          stock: 5,
          id_categoria: 1,
        },
      };

      await agregarProducto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockQuery).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        producto: nuevoProducto,
        mensaje: "Producto agregado correctamente",
      });
    });
  });

  describe("modificarProducto", () => {
    it("debe retornar 400 cuando no se envía ningún campo para modificar", async () => {
      mockRequest = {
        params: { idproducto: "1" },
        body: {},
      };

      await modificarProducto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: "Debe proporcionar al menos un campo para modificar",
      });
    });

    it("debe retornar 404 cuando el producto no existe", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      mockRequest = {
        params: { idproducto: "999" },
        body: { nombre: "Nuevo nombre" },
      };

      await modificarProducto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ mensaje: "Producto no encontrado" });
    });

    it("debe actualizar y retornar producto cuando existe", async () => {
      const actualizado = {
        idproducto: 1,
        nombre: "Actualizado",
        precio: 100,
        stock: 20,
      };
      mockQuery
        .mockResolvedValueOnce({ rows: [{ idproducto: 1 }] })
        .mockResolvedValueOnce({ rows: [actualizado] });
      mockRequest = {
        params: { idproducto: "1" },
        body: { nombre: "Actualizado", precio: 100, stock: 20 },
      };

      await modificarProducto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(jsonMock).toHaveBeenCalledWith({
        producto: actualizado,
        mensaje: "Producto modificado correctamente",
      });
    });
  });

  describe("eliminarProducto", () => {
    it("debe retornar 404 cuando el producto no existe", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      mockRequest = { params: { idproducto: "999" } };

      await eliminarProducto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ mensaje: "Producto no encontrado" });
    });

    it("debe eliminar y retornar mensaje cuando el producto existe", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ idproducto: 1 }] })
        .mockResolvedValueOnce({ rows: [] });
      mockRequest = { params: { idproducto: "1" } };

      await eliminarProducto(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: "Producto eliminado correctamente",
      });
    });
  });

  describe("obtenerProductoPorNombre", () => {
    it("debe retornar 404 cuando no hay productos con ese nombre", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      mockRequest = { params: { nombre: "inexistente" } };

      await obtenerProductoPorNombre(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ mensaje: "Producto no encontrado" });
    });

    it("debe retornar productos cuando hay coincidencias", async () => {
      const productos = [{ nombre: "Filtro", idproducto: 1 }];
      mockQuery.mockResolvedValue({ rows: productos });
      mockRequest = { params: { nombre: "filtro" } };

      await obtenerProductoPorNombre(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(productos);
    });
  });
});
