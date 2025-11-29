import db from '../config/db';
import fs from 'fs';
import path from 'path';

interface ProductoData {
    codigo: string;
    categoria: string;
    descripcion: string;
    precio: string;
}

const insertProductos = async () => {
    try {
        console.log('Leyendo archivo de productos...');
        
        const sqlPath = path.join(process.cwd(), 'database', 'create_tables_productos.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        
        const productos: ProductoData[] = [];
        const categoriasSet = new Set<string>();
        
        const updateRegex = /UPDATE\s+productos\s+SET\s+codigo\s*=\s*'([^']*(?:''[^']*)*)',\s*categoria\s*=\s*'([^']*(?:''[^']*)*)',\s*descripcion\s*=\s*'([^']*(?:''[^']*)*)',\s*precio\s*=\s*'([^']*(?:''[^']*)*)'/gi;
        
        let match;
        while ((match = updateRegex.exec(sql)) !== null) {
            const codigo = match[1].replace(/''/g, "'");
            const categoria = match[2].replace(/''/g, "'");
            const descripcion = match[3].replace(/''/g, "'");
            const precio = match[4].replace(/''/g, "'");
            productos.push({ codigo, categoria, descripcion, precio });
            categoriasSet.add(categoria);
        }
        
        console.log(`Se encontraron ${productos.length} productos`);
        console.log(`Se encontraron ${categoriasSet.size} categorías únicas:`, Array.from(categoriasSet));
        
        console.log('\nInsertando categorías...');
        const categorias = Array.from(categoriasSet);
        const categoriaMap = new Map<string, number>();
        
        for (const categoriaNombre of categorias) {
            try {
                const checkResult = await db.query(
                    'SELECT id_categoria FROM categorias WHERE nombre = $1',
                    [categoriaNombre]
                );
                
                if (checkResult.rows.length > 0) {
                    categoriaMap.set(categoriaNombre, checkResult.rows[0].id_categoria);
                    console.log(`✓ Categoría "${categoriaNombre}" ya existe (ID: ${checkResult.rows[0].id_categoria})`);
                } else {
                    const insertResult = await db.query(
                        'INSERT INTO categorias (nombre) VALUES ($1) RETURNING id_categoria',
                        [categoriaNombre]
                    );
                    const idCategoria = insertResult.rows[0].id_categoria;
                    categoriaMap.set(categoriaNombre, idCategoria);
                    console.log(`✓ Categoría "${categoriaNombre}" insertada (ID: ${idCategoria})`);
                }
            } catch (error: any) {
                console.error(`✗ Error al insertar categoría "${categoriaNombre}":`, error.message);
            }
        }
        
        console.log(`\nInsertando ${productos.length} productos...`);
        let insertados = 0;
        let actualizados = 0;
        let errores = 0;
        
        for (let i = 0; i < productos.length; i++) {
            const producto = productos[i];
            const idCategoria = categoriaMap.get(producto.categoria);
            
            if (!idCategoria) {
                console.error(`✗ Producto ${producto.codigo}: Categoría "${producto.categoria}" no encontrada`);
                errores++;
                continue;
            }
            
            try {
                const precioNum = parseFloat(producto.precio.replace(',', '.'));
                
                const checkResult = await db.query(
                    'SELECT id_producto FROM productos WHERE codigo = $1',
                    [producto.codigo]
                );
                
                if (checkResult.rows.length > 0) {
                    await db.query(
                        `UPDATE productos 
                         SET nombre = $1, descripcion = $2, precio = $3, id_categoria = $4 
                         WHERE codigo = $5`,
                        [producto.descripcion, producto.descripcion, precioNum, idCategoria, producto.codigo]
                    );
                    actualizados++;
                    if ((i + 1) % 100 === 0) {
                        console.log(`  Procesados ${i + 1}/${productos.length} productos...`);
                    }
                } else {    
                    await db.query(
                        `INSERT INTO productos (codigo, nombre, descripcion, precio, stock, id_categoria) 
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [producto.codigo, producto.descripcion, producto.descripcion, precioNum, 0, idCategoria]
                    );
                    insertados++;
                    if ((i + 1) % 100 === 0) {
                        console.log(`  Procesados ${i + 1}/${productos.length} productos...`);
                    }
                }
            } catch (error: any) {
                console.error(`✗ Error al procesar producto ${producto.codigo}:`, error.message);
                errores++;
            }
        }
        
        console.log('\nProceso completado');
        console.log(`  - Productos insertados: ${insertados}`);
        console.log(`  - Productos actualizados: ${actualizados}`);
        console.log(`  - Errores: ${errores}`);
        console.log(`  - Total procesados: ${insertados + actualizados + errores}`);
        
        process.exit(0);
    } catch (error: any) {
        console.error('Error al insertar productos:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

insertProductos();

