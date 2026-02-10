Proyecto final backend - Oleohidráulica Guardese

Descripción del proyecto

    El proyecto implementa un backend en Node.js+ Express + TypeScript para gestión de presupuestos, productos, usuarios y detalle de presupuesto. A la vez utiliza Sequelize como herramienta para trabajar sobre la base de datos con una estructura de modelos en TypeScript y PostgreSQL en Render como base de datos principal. El sistema incluye autenticación JWT, validación de datos y manejo de errores.

Diagrama de la base de datos

![diagrama](diagrama/diagrama-back.png)

---

Deploy en Render

1. **Subir el código**  
   Subí el backend a un repo en GitHub (si no está ya).

2. **En Render**  
   - Entrá a [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**.  
   - Conectá el repositorio de GitHub y seleccioná el repo del backend.  
   - **Root Directory**: si el backend está en una carpeta (ej. `Trabajo-Final-Backend`), indicá esa carpeta.  
   - **Build Command**: `npm install && npm run build`  
   - **Start Command**: `npm run start`  
   - **Runtime**: Node  

3. **Variables de entorno** (en el servicio → Environment):  
   - `DATABASE_URL`: URL de tu base PostgreSQL. **Recomendado**: usar **Internal Database URL** (misma cuenta Render) para evitar "Connection terminated unexpectedly"; si usás External, la app agrega SSL automáticamente.  
   - `JWT_SECRET`: una clave secreta (ej. string aleatorio largo).  
   - No hace falta definir `PORT`; Render la asigna.  

4. **Crear el servicio**  
   Deploy automático. Cuando termine, tendrás una URL tipo `https://tu-nombre.onrender.com`.  

5. **Si la base está vacía**  
   En el Web Service → **Shell**:  
   `npm run create-tables`  
   `npm run insert-productos`  

6. **Probar**  
   `GET https://tu-url.onrender.com/` debe responder con `{"message":"Servidor funcionando correctamente."}`.

- Ejemplo de URL: https://trabajo-final-backend-9l6v.onrender.com

---

Configuración y Deploy (local)

    git clone https://github.com/belenburgos20/Trabajo-Final-Backend.git
    cd Trabajo-Final-Backend

    npm install
    npm run create-tables
    npm run insert-productos
    npm run build
    npm run start

Tests

    El proyecto incluye tests con Jest y Supertest para los controladores (auth, usuarios, productos, presupuestos, detallePresupuesto).

    npm run test
    npm run test:watch   # ejecuta tests en modo watch

--- 
 Rutas principales

    Usuarios:
        POST        /api/usuarios/
        POST        /api/usuarios/login
        POST        /api/usuarios/logout
        GET         /api/usuarios/
        GET         /api/usuarios/:id
        PUT         /api/usuarios/:id
        DELETE      /api/usuarios/:id
    
    Productos:
        POST        /api/productos/
        GET         /api/productos/list
        GET         /api/productos/:codigo
        GET         /api/productos/:idcategoria
        GET         /api/productos/:nombre
        PUT         /api/productos/:codigo
        DELETE      /api/productos/
    
    Presupuestos:
        POST        /api/presupuestos/
        GET         /api/presupuestos/
        GET         /api/presupuestos/:idPresupuesto
        GET         /api/presupuestos/usuario/:idUsuario
        GET         /api/presupuestos/fecha/:fecha
        GET         /api/presupuestos/estado/:estado
        PUT         /api/presupuestos/:idPresupuesto
        DELETE      /api/presupuestos/:idPresupuesto

    DetallePresupuesto:
        POST        /api/detallePresupuesto/presupuesto/:idPresupuesto
        GET         /api/detallePresupuesto/presupuesto/:idPresupuesto
        PUT         /api/detallePresupuesto/cantidad
        PUT         /api/detallePresupuesto/precio
        PUT         /api/detallePresupuesto/:idDetalle
        DELETE      /api/detallePresupuesto/:idDetalle

Colección Postman (prueba de rutas)

- [Colección Proyecto Final](https://www.postman.com/ds6666-7215/workspace/proyecto-final/collection/39847383-dc410020-40f8-499f-818b-73d89f90443b?action=share&creator=39847383)

Variables de entorno (.env)

    Crear un archivo .env en la raíz del proyecto con las siguientes variables (usar valores propios; no subir credenciales al repositorio):

        # Base de datos
        DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_db
        DB_HOST=tu_host
        DB_PORT=5432
        DB_NAME=nombre_db
        DB_USER=usuario
        DB_PASS=contraseña

        # JWT
        JWT_SECRET=tu_clave_secreta

        # Servidor
        PORT=3000
        NODE_ENV=development

Trello (división de tareas y cronograma)

- https://trello.com/b/MuVdiLr8/mi-tablero-de-trello

Integrantes del grupo

- Burgos, Belén
- Guardese, Luciano
- Hubert, Noelia
- Ibañez, Ian Franco