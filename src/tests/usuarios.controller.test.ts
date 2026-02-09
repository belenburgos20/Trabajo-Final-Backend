import { Request, Response } from "express";
import {
  ObtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  modificarUsuario,
  eliminarUsuario,
  logout,
} from "../controllers/usuarios.controller";

const mockQuery = jest.fn();
jest.mock("../config/db", () => ({
  __esModule: true,
  default: {
    query: (...args: any[]) => mockQuery.apply(null, args),
  },
}));

describe("Usuarios Controller", () => {
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

  describe("ObtenerUsuarios", () => {
    it("debe retornar lista de usuarios con status 200", async () => {
      const usuarios = [
        { idusuario: 1, nombre: "User 1", email: "u1@test.com" },
      ];
      mockQuery.mockResolvedValue({ rows: usuarios });
      mockRequest = {};

      await ObtenerUsuarios(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(usuarios);
    });

    it("debe retornar 500 en caso de error", async () => {
      mockQuery.mockRejectedValue(new Error("DB error"));
      mockRequest = {};

      await ObtenerUsuarios(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Error al obtener los usuarios",
      });
    });
  });

  describe("obtenerUsuarioPorId", () => {
    it("debe retornar 400 cuando el id no es un número válido", async () => {
      mockRequest = { params: { id: "abc" } };

      await obtenerUsuarioPorId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "El ID del usuario debe ser un número válido.",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("debe retornar 404 cuando el usuario no existe", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      mockRequest = { params: { id: "999" } };

      await obtenerUsuarioPorId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("debe retornar usuario mapeado con id cuando existe", async () => {
      const usuario = {
        idusuario: 1,
        nombre: "Juan",
        email: "juan@test.com",
        cuit: "20-12345678-9",
      };
      mockQuery.mockResolvedValue({ rows: [usuario] });
      mockRequest = { params: { id: "1" } };

      await obtenerUsuarioPorId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          nombre: "Juan",
          email: "juan@test.com",
          cuit: "20-12345678-9",
        }),
      );
    });
  });

  describe("crearUsuario", () => {
    it("debe retornar 400 cuando faltan datos obligatorios", async () => {
      mockRequest = {
        params: {},
        body: { nombre: "Juan" }, // falta email y password
      };

      await crearUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Datos de usuario incompletos",
      });
    });

    it("debe retornar 400 cuando el email ya está registrado", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ email: "existente@test.com" }] });
      mockRequest = {
        params: { id: "0" },
        body: {
          nombre: "Nuevo",
          email: "existente@test.com",
          password: "123456",
        },
      };

      await crearUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: expect.stringContaining("correo electrónico ya está registrado"),
      });
    });

    it("debe crear usuario y retornar 201 con token cuando los datos son válidos", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // email no existe
        .mockResolvedValueOnce({
          rows: [
            {
              idusuario: 1,
              nombre: "Nuevo",
              email: "nuevo@test.com",
              cuit: null,
              direccion: null,
              telefono: null,
              esAdmin: false,
              localidad: null,
            },
          ],
        });
      mockRequest = {
        params: { id: "0" },
        body: {
          nombre: "Nuevo",
          email: "nuevo@test.com",
          password: "123456",
        },
      };

      await crearUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Usuario creado correctamente",
          usuario: expect.objectContaining({ id: 1, email: "nuevo@test.com" }),
          token: expect.any(String),
        }),
      );
    });
  });

  describe("modificarUsuario", () => {
    it("debe retornar 400 cuando el id no es válido", async () => {
      mockRequest = { params: { id: "nan" }, body: {} };

      await modificarUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "El ID del usuario debe ser un número válido.",
      });
    });

    it("debe retornar 404 cuando el usuario no existe", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      mockRequest = {
        params: { id: "999" },
        body: { nombre: "Otro" },
      };

      await modificarUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("debe actualizar y retornar usuario cuando existe", async () => {
      const usuarioExistente = {
        idusuario: 1,
        nombre: "Viejo",
        email: "viejo@test.com",
        password: "pass",
        cuit: null,
        direccion: null,
        telefono: null,
        esAdmin: false,
        localidad: null,
      };
      const actualizado = { ...usuarioExistente, nombre: "Actualizado" };
      mockQuery
        .mockResolvedValueOnce({ rows: [usuarioExistente] })
        .mockResolvedValueOnce({ rows: [actualizado] });
      mockRequest = {
        params: { id: "1" },
        body: { nombre: "Actualizado" },
      };

      await modificarUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Usuario actualizado correctamente",
          usuario: expect.objectContaining({ id: 1 }),
        }),
      );
    });
  });

  describe("eliminarUsuario", () => {
    it("debe retornar 404 cuando el usuario no existe", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ idUsuario: 2 }, { idUsuario: 3 }],
      });
      mockRequest = { params: { id: "999" } };

      await eliminarUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    it("debe eliminar y retornar 200 cuando el usuario existe", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ idUsuario: 1 }, { idUsuario: 2 }] })
        .mockResolvedValueOnce({ rows: [] });
      mockRequest = { params: { id: "1" } };

      await eliminarUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Usuario eliminado correctamente",
      });
    });
  });

  describe("logout", () => {
    it("debe retornar 200 con mensaje de sesión cerrada", async () => {
      mockRequest = {};

      await logout(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Sesión cerrada" });
    });
  });
});
