export class Usuario {
  idUsuario: number;
  password: string; // Cambiado de contraseña a password
  nombre: string;
  email: string;
  CUIT: string;
  direccion: string;
  telefono: bigint;
  esAdmin: boolean;
  localidad: string;

  constructor(
    idUsuario: number,
    password: string, // Cambiado de contraseña a password
    nombre: string,
    email: string,
    CUIT: string,
    direccion: string,
    telefono: bigint,
    esAdmin: boolean,
    localidad: string,
  ) {
    this.idUsuario = idUsuario;
    this.password = password; // Cambiado de contraseña a password
    this.nombre = nombre;
    this.email = email;
    this.CUIT = CUIT;
    this.direccion = direccion;
    this.telefono = telefono;
    this.esAdmin = esAdmin;
    this.localidad = localidad;
  }
}
