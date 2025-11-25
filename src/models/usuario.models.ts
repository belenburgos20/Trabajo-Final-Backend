export class Usuario {
    idUsuario: number;
    contraseña: string;
    nombre: string;
    email: string;
    CUIT: string;
    direccion: string;
    telefono: number;
    esAdmin: boolean;
    localidad: string;

    constructor(idUsuario: number, contraseña: string, nombre: string, email: string, CUIT: string, direccion: string, telefono: number, esAdmin: boolean, localidad: string) {
        this.idUsuario = idUsuario;
        this.contraseña = contraseña;
        this.nombre = nombre;
        this.email = email;
        this.CUIT = CUIT;
        this.direccion = direccion;
        this.telefono = telefono;
        this.esAdmin = esAdmin;
        this.localidad = localidad;
    }
}
