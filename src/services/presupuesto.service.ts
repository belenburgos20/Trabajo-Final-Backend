export const ObtenerPresupuestos = async () => {
    return Promise.resolve([
        { idPresupuesto: 1, idUsuario: 1, fecha: new Date('2023-01-15'), montoTotal: 1500.00, fechaEntrega: new Date('2023-02-15'),estado: 'Pendiente'}
    ]);
};