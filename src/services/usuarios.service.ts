export const getUsuarios = async () => {
    return Promise.resolve([
        { id: 1, nombre: "Lucho Guardese", contraseña: "admin123", email: "lucho@example.com", CUIT: "20-12345678-9", direccion: "Calle Falsa 123", telefono: 1234567890, esAdmin: true, localidad: "Ciudad A" },
        { id: 2, nombre: "Noe Hubert", contraseña: "user456", email: "noe@example.com", CUIT: "27-87654321-0", direccion: "Avenida Siempre Viva 456", telefono: 987654321, esAdmin: false, localidad: "Ciudad B" }
    ]);
};