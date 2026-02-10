import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loginUsuario, verificarToken } from "../controllers/auth.controller";

jest.mock("../services/usuarios.service", () => ({
  getUsuarios: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "token-mock"),
  verify: jest.fn((token: string, secret: string, cb: (err: Error | null, user?: object) => void) => {
    if (token === "token-invalido") {
      cb(new Error("invalid"));
      return;
    }
    cb(null, { id: 1, email: "test@test.com" });
  }),
}));

import { getUsuarios } from "../services/usuarios.service";

const mockGetUsuarios = getUsuarios as jest.MockedFunction<typeof getUsuarios>;

describe("Auth Controller", () => {
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

  describe("loginUsuario", () => {
    it("debe retornar 404 cuando el usuario no existe", async () => {
      mockGetUsuarios.mockResolvedValue([]);
      mockRequest = {
        body: { email: "noexiste@test.com", password: "123" },
      };

      await loginUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Credenciales inválidas" });
    });

    it("debe retornar 401 cuando la contraseña es incorrecta", async () => {
      mockGetUsuarios.mockResolvedValue([
        {
          idUsuario: 1,
          email: "user@test.com",
          password: "correct",
          nombre: "User",
          cuit: null,
          direccion: null,
          telefono: null,
          esAdmin: false,
          localidad: null,
        } as any,
      ]);
      mockRequest = {
        body: { email: "user@test.com", password: "wrong" },
      };

      await loginUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Credenciales incorrectas" });
    });

    it("debe retornar 200 y token cuando las credenciales son correctas", async () => {
      const usuario = {
        idUsuario: 1,
        email: "user@test.com",
        password: "123",
        nombre: "User",
        cuit: null,
        direccion: null,
        telefono: null,
        esAdmin: false,
        localidad: null,
      };
      mockGetUsuarios.mockResolvedValue([usuario] as any);
      mockRequest = {
        body: { email: "user@test.com", password: "123" },
      };

      await loginUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jwt.sign).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          token: "token-mock",
          esAdmin: false,
        }),
      );
    });

    it("acepta contraseña con nombre 'contraseña' en el body", async () => {
      const usuario = {
        idUsuario: 1,
        email: "user@test.com",
        password: "123",
        nombre: "User",
        cuit: null,
        direccion: null,
        telefono: null,
        esAdmin: false,
        localidad: null,
      };
      mockGetUsuarios.mockResolvedValue([usuario] as any);
      mockRequest = {
        body: { email: "user@test.com", contraseña: "123" },
      };

      await loginUsuario(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ token: "token-mock" }),
      );
    });
  });

  describe("verificarToken", () => {
    const nextFn = jest.fn();

    it("debe retornar 401 cuando no se envía Authorization header", () => {
      mockRequest = { headers: {} };

      verificarToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFn,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Token no proporcionado" });
      expect(nextFn).not.toHaveBeenCalled();
    });

    it("debe retornar 401 cuando el header no tiene Bearer token", () => {
      mockRequest = { headers: { authorization: "InvalidFormat" } };

      verificarToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFn,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(nextFn).not.toHaveBeenCalled();
    });

    it("debe llamar a next() cuando el token es válido", () => {
      mockRequest = { headers: { authorization: "Bearer token-valido" } };

      verificarToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFn,
      );

      expect(nextFn).toHaveBeenCalled();
    });

    it("debe retornar 403 cuando el token es inválido", () => {
      (jwt.verify as jest.Mock).mockImplementation(
        (token: string, secret: string, cb: (err: Error | null) => void) => {
          cb(new Error("invalid"));
        },
      );
      mockRequest = { headers: { authorization: "Bearer token-invalido" } };

      verificarToken(
        mockRequest as Request,
        mockResponse as Response,
        nextFn,
      );

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Token inválido" });
      expect(nextFn).not.toHaveBeenCalled();
    });
  });
});
