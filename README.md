Proyecto final backend- Oleohidráulica Guardese.

Descripción del proyecto

    El proyecto implementa un backend en Node.js+ Express + TypeScript para gestión de presupuestos, productos, usuarios y detalle de presupuesto. A la vez utiliza Sequelize como herramienta para trabajar sobre la base de datos con una estructura de modelos en TypeScript y PostgreSQL en Render como base de datos principal. El sistema incluye autenticación JWT, validación de datos y manejo de errores.

Configuración y Deploy

    git clone https://github.com/belenburgos20/Trabajo-Final-Backend.git

    cd Trabajo-Final-Backend

    npm install
    npm run create-tables
    npm run insert-productos
    npm run build
    npm run start

Diagrama de la base de datos

![diagrama](diagrama/diagrama-back.png)

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

    A continuación se adjunta un link de la colección en Postman para la prueba de rutas: 
    https://www.postman.com/ds6666-7215/workspace/proyecto-final/collection/39847383-dc410020-40f8-499f-818b-73d89f90443b?action=share&creator=39847383

Contenido .env

        # Configuraci n de Base de Datos - Render
        DATABASE_URL=postgresql://oleohidraulica_db_user:VYyJCiqSOqbs8HYme4tnbVMKHdI4vGdN@dpg-d4j0h7emcj7s739f83b0-a.oregon-postgres.render.com/oleohidraulica_db

        # Variables individuales (por si no se usa DATABASE_URL)
        DB_HOST=dpg-d4j0h7emcj7s739f83b0-a.oregon-postgres.render.com
        DB_PORT=5432
        DB_NAME=oleohidraulica_db
        DB_USER=oleohidraulica_db_user
        DB_PASS=VYyJCiqSOqbs8HYme4tnbVMKHdI4vGdN

        # JWT Secret
        JWT_SECRET=ClaveAcceso

        # Puerto del servidor
        PORT=3000

        # Entorno
        NODE_ENV=production

Integrantes del grupo:

    -Burgos, Belén.
    -Guardese, Luciano.
    -Hubert, Noelia.
    -Ibañez, Ian Franco.