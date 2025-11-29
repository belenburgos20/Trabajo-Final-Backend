import db from '../config/db';

export const ObtenerCategorias = async () => {
    try {
        const result = await db.query('SELECT * FROM categorias');
        return result.rows;
    } catch (error) {
        console.error("Error en ObtenerCategorias:", error);
        throw error;
    }
};

export const ObtenerCategoriaPorId = async (id: number) => {
    try {
        const result = await db.query('SELECT * FROM categorias WHERE id_categoria = $1', [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error en ObtenerCategoriaPorId:", error);
        throw error;
    }
};
