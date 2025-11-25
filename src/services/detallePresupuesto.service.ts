export const obtenerDetallesPresupuesto = async () => {
    return Promise.resolve([
        { 
            idDetallePresupuesto: 1, 
            idPresupuesto: 1, 
            idProducto: 1, 
            cantidad: 2, 
            precio: 15500 
        },
        { 
            idDetallePresupuesto: 2, 
            idPresupuesto: 1, 
            idProducto: 2, 
            cantidad: 1, 
            precio: 12300 
        },
        { 
            idDetallePresupuesto: 3, 
            idPresupuesto: 1, 
            idProducto: 3, 
            cantidad: 3, 
            precio: 10100 
        }
    ]);
};

