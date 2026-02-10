import db from '../config/db';
import fs from 'fs';
import path from 'path';

const createTables = async () => {
    try {
        console.log('Conectando a la base de datos...');
        
        const sqlPath = path.join(process.cwd(), 'database', 'create_all_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        
        const statements = sql
            .split(';')
            .map(s => {
                const lines = s.split('\n').map(line => {
                    const commentIndex = line.indexOf('--');
                    return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
                });
                return lines.join('\n').trim();
            })
            .filter(s => s.length > 0 && !s.match(/^\s*$/));
        
        console.log(`Ejecutando ${statements.length} statements...\n`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    await db.query(statement + ';');
                    const statementPreview = statement.substring(0, 50).replace(/\n/g, ' ');
                    console.log(`✓ [${i + 1}/${statements.length}] ${statementPreview}...`);
                } catch (error: any) {      
                    if (error.message && (
                        error.message.includes('already exists') || 
                        error.message.includes('duplicate key')
                    )) {
                        const statementPreview = statement.substring(0, 50).replace(/\n/g, ' ');
                        console.log(`⚠ [${i + 1}/${statements.length}] Ya existe: ${statementPreview}...`);
                    } else {
                        console.error(`✗ Error en statement ${i + 1}:`, error.message);
                        console.error('Statement:', statement.substring(0, 200));
                        throw error;
                    }
                }
            }
        }
        
        console.log('\nTodas las tablas han sido creadas exitosamente!');
        process.exit(0);
    } catch (error: any) {
        console.error('Error al crear las tablas:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

// createTables();

