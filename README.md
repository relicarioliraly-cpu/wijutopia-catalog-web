# Wijutopia TCG E-Commerce - Trujillo, Perú 🇵🇪

Plataforma de comercio electrónico de alto rendimiento diseñada como **prototipo académico** para una tienda TCG inspirada en Wijutopia, comunidad de juegos de cartas coleccionables de Trujillo, Perú. El sistema integra un frontend moderno con Next.js y Tailwind CSS, un backend RESTful en Express.js y persistencia en MongoDB Atlas.

> **Aviso legal:** este repositorio no representa una página oficial de Wijutopia, Wiju World ni de las franquicias Pokémon, Yu-Gi-Oh!, Digimon, Bandai, One Piece o similares. Es un examen de prueba sin pagos reales ni inventario oficial.

## 🔗 Enlaces del Proyecto en Línea

- Frontend en Producción: `https://wijutopia-tcg.vercel.app`
- API REST Backend: `https://wijutopia-backend.onrender.com`



## 🎨 Limpieza visual e iconografía

La interfaz usa una navegación compacta con iconos SVG internos, un mapa rápido plegable para no sobrecargar la pantalla y una portada visual inspirada en una fachada morada de tienda TCG. La paleta visual toma como base los tonos morado noche, fachada violeta, letrero magenta, puerta púrpura, dorado lunar y azul vereda de la imagen de referencia. También se agregaron animaciones suaves de brillo/flotación y un interruptor de efectos sonoros opcionales para clics de navegación, carrito y confirmaciones; el sonido queda desactivado por defecto para respetar la experiencia del usuario. Las tarjetas priorizan estado, etiqueta, precio y acción principal para que el catálogo sea más legible.


## 🚆 Despliegue en Railway / Railpack

El repositorio incluye dos archivos `railpack.toml` para evitar que Railway lea únicamente el `package.json` raíz, que solo funciona como orquestador local.

- Si el servicio tiene `rootDirectory = "frontend"`, Railway usa `frontend/railpack.toml`, ejecuta `npm run build` y arranca con `npm start`.
- Si el servicio queda apuntando a la raíz del repositorio, `railpack.toml` fuerza la instalación, compilación y arranque desde `frontend/`.
- El script `frontend` de producción usa `next start -p ${PORT:-3000}` para respetar el puerto dinámico que inyecta Railway.
- Para backend en Railway, configure un servicio separado con `rootDirectory = "backend"` y las variables de entorno de MongoDB/JWT/CAPTCHA.
- Si está migrando de un proyecto con MySQL, elimine todas las variables `MYSQL_*` de Railway y use únicamente `MONGODB_URI` y `MONGODB_DB`.
- No use variables como `MYSQL_DATABASE`, `MYSQL_URL`, `MYSQLHOST`, `MYSQLPASSWORD`, `MYSQLPORT`, `MYSQLUSER`, ni `MYSQL_PUBLIC_URL`.
- No monte volúmenes en `/var/lib/mysql` ni en `/var/lib/Mongodb` para este servicio de aplicación Node.js.
- No establezca un `Start Command` de MySQL (`docker-entrypoint.sh mysqld ...`) en el servicio que despliega la app.

### Cómo corregir un servicio Railway mal configurado como MySQL

Si Railway muestra un comando de inicio `docker-entrypoint.sh mysqld ...` o intenta arrancar MySQL, tu servicio está configurado con la plantilla equivocada. Para desplegar esta app debes:

1. Abrir el servicio en Railway y verificar que no sea una base de datos MySQL.
2. Eliminar cualquier `Start Command` que contenga `mysqld` o `mysql`.
3. Eliminar todas las variables `MYSQL_*` de ese servicio.
4. No montar ningún volumen en `/var/lib/mysql` ni en `/var/lib/Mongodb`.
5. Configurar el servicio como Node.js con `rootDirectory = "backend"` (o crear un nuevo servicio apuntando a `backend`).
6. Establecer el `Start Command` para la app backend en `npm start`.
7. Usar únicamente `MONGODB_URI` y `MONGODB_DB` para la conexión de datos.

Si necesitas usar MongoDB en Railway, crea un servicio MongoDB independiente y copia su URI a `MONGODB_URI`.

### Variables de entorno recomendadas para Railway

Configure estas variables en el servicio backend de Railway:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@cluster0.mongodb.net
MONGODB_DB=wijutopia_db
JWT_SECRET=secret_de_produccion_o_seed_seguro
CAPTCHA_KEY=<clave_hex>
CAPTCHA_IV=<vector-inicializacion_hex>
ADMIN_EMAIL=admin@wijutopia.com
ADMIN_PASSWORD=WijuAdmin2026_TrujilloTcg!
FRONTEND_ORIGIN=https://<tu-dominio-frontend>
```

- `MONGODB_URI` debe apuntar a su conexión de MongoDB Atlas o a un MongoDB administrado por Railway.
- `MONGODB_DB` debe ser el nombre de la base de datos usada por el backend.
- No es necesario ni compatible usar variables como `MYSQL_URL`, `MYSQL_HOST`, `MYSQL_DATABASE`, `MYSQL_USER` o `MYSQL_PASSWORD`.

## ▶️ Operación conjunta frontend + backend

Para que el sitio web opere conectado al backend, configure ambos entornos y ejecute desde la raíz:

```bash
npm run install:all
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run dev
```

- Backend Express: `http://localhost:5000`.
- Frontend Next.js: `http://localhost:3000`.
- El frontend usa `NEXT_PUBLIC_API_URL` para consumir `/api/health`, `/api/products`, `/api/metrics` y `/api/insights`.
- La barra superior muestra un indicador de integración frontend ↔ backend consultando `GET /api/health`.
- Si el indicador aparece en rojo, revise que el backend esté levantado, que MongoDB Atlas esté configurado y que `NEXT_PUBLIC_API_URL` apunte al puerto correcto.

Comandos útiles desde la raíz:

```bash
npm run dev:backend
npm run dev:frontend
npm run lint
npm run typecheck
```

## 🧱 Arquitectura

```text
frontend/ Next.js App Router + TypeScript + Tailwind
        │
        ▼ fetch REST
backend/ Express.js + Joi + JWT + Canvas CAPTCHA
        │
        ▼ mongodb
MongoDB Atlas / local MongoDB compatible
```

## 🛠️ Instrucciones para Instalación Local

### Requisitos previos

- Node.js v18 o superior.
- MongoDB local o una instancia de MongoDB Atlas.

### Paso 1: Configurar la base de datos

Para un desarrollo local con Docker Compose:

```bash
docker compose up -d
```

Si usa MongoDB Atlas, cree un clúster y copie la cadena de conexión en `backend/.env` como `MONGODB_URI`.

### Paso 2: Configuración del backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Variables relevantes:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@cluster0.mongodb.net
MONGODB_DB=wijutopia_db
JWT_SECRET=secret_desarrollo_local_wijutopia_123
CAPTCHA_KEY=8e9fb74ab1a89f81a7199c09930fca611a2a3bc5d6a7ef
CAPTCHA_IV=4b3d2b7e192a013e8d9a2a3bc5d6a7ef
ADMIN_EMAIL=admin@wijutopia.com
ADMIN_PASSWORD=WijuAdmin2026_TrujilloTcg!
FRONTEND_ORIGIN=http://localhost:3000
```

Para deploy en servicios como Railway o Render, use la URL de MongoDB Atlas en `MONGODB_URI`.

### Paso 3: Configuración del frontend

```bash
cd ../frontend
npm install
printf 'NEXT_PUBLIC_API_URL=http://localhost:5000\n' > .env.local
npm run dev
```

Abra `http://localhost:3000`.

## 🚀 Ejemplos de API REST

### Consultar catálogo

```bash
curl -X GET http://localhost:5000/api/products \
  -H "Accept: application/json"
```

### Registrar un producto con imagen autogenerada

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN_EMPLEADO>" \
  -d '{
    "name": "One Piece TCG: Awakening of the New Era [OP-05] Booster Box",
    "description": "Caja de sobres oficial de One Piece TCG para el prototipo académico.",
    "price": 420.00,
    "stock": 8
  }'
```

### Registrar métrica implícita

```bash
curl -X POST http://localhost:5000/api/metrics/track \
  -H "Content-Type: application/json" \
  -d '{ "elementId": "btn_agregar_carrito" }'
```

## 📌 Endpoints principales

| Método | Ruta | Permiso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/products` | Público | Lista productos. |
| GET | `/api/products/:id` | Público | Obtiene detalle. |
| POST | `/api/products` | Empleado | Crea producto y autogenera imagen si falta. |
| PUT | `/api/products/:id` | Empleado | Actualiza producto. |
| DELETE | `/api/products/:id` | Empleado | Elimina producto. |
| POST | `/api/metrics/track` | Público | Incrementa un contador de clics. |
| GET | `/api/metrics/dashboard` | Empleado | Retorna métricas y `E_ratio`. |
| GET | `/api/auth/captcha` | Público | Genera captcha visual Base64. |
| POST | `/api/auth/register` | Público | Registro cliente protegido con captcha. |
| POST | `/api/auth/login` | Público | Login JWT. |
| POST | `/api/insights/products/:id/restock` | Público | Registra solicitudes de reposición para productos agotados. |
| POST | `/api/insights/launch-requests` | Público | Registra pedidos de próximos lanzamientos/preventas. |
| POST | `/api/insights/research` | Público | Guarda encuestas, trivias y satisfacción de clientes. |
| GET | `/api/insights/dashboard` | Empleado | Consolida informe de restock, lanzamientos y conducta del cliente. |
| POST | `/api/insights/products/:id/interest` | Público | Suma vistas o clics de producto para la temporada activa. |
| POST | `/api/insights/restock/:requestId/cancel` | Público | Cancela una solicitud activa de stock/restock validando correo. |
| POST | `/api/insights/products/:id/whatsapp-interest` | Empleado | Agrega mensajes del WhatsApp oficial al cálculo de interés. |



## 🗂️ Estructura web ramificada tipo catálogo TCG

El frontend ahora separa el sitio en páginas jerárquicas de catálogo TCG, usando etiquetas internas de la tienda en lugar de plataformas externas:

- `/games`: índice de juegos con marcadores por franquicia.
- `/games/pokemon`, `/games/yugioh`, `/games/one-piece`, `/games/digimon`, `/games/dragon-ball`, `/games/magic`: páginas dedicadas por juego.
- `/singles`, `/sealed`, `/accessories`, `/releases`, `/restock`: ramas transversales del catálogo.
- `/store-tags/en-vitrina`, `/store-tags/pedido-por-encargo`, `/store-tags/restock-prioritario`, `/store-tags/preventa-wijutopia`, `/store-tags/torneo-liga`, `/store-tags/accesorio-tcg`: páginas por etiqueta operativa de tienda.

Cada página mantiene la jerarquía `Juego → Rama de catálogo → disponibilidad/señales`, y registra interés de productos para alimentar el análisis de restock.

## 🧪 Nuevas funciones de investigación comercial

- El aviso legal inicial se muestra como modal para dejar claro que el sitio es un prototipo académico/no oficial antes de navegar.
- Las tarjetas muestran etiquetas operativas de tienda como `En vitrina`, `Pedido por encargo`, `Restock prioritario`, `Preventa Wijutopia`, `Torneo/Liga` o `Accesorio TCG`.
- Cada producto muestra estado `Disponible` o `Agotado`; si está agotado, el cliente puede pedir stock/restock.
- La lógica de stock/restock no se aprueba inmediatamente: queda en espera hasta que el producto alcance un umbral de señales por temporada.
- Las señales combinan vistas del producto, clics dentro de la página y mensajes del WhatsApp oficial de la tienda preguntando por stock/restock o lanzamientos.
- Solo se permite un intento de stock/restock por correo de cliente, producto y temporada; después de activarlo aparece un botón para cancelar la espera.
- El mensaje al cliente indica que la solicitud está en espera y que la decisión se revisa por temporadas trimestrales/meses operativos.
- Los lanzamientos pueden marcarse como preventa y habilitar el botón `Pedir lanzamiento`.
- El cliente dispone de formularios de pedidos, encuestas de satisfacción, trivia y preferencias de compra.
- El panel administrativo consolida un informe para decidir qué productos traer según restock, lanzamientos, WhatsApp, franquicias favoritas, estilo de juego y presupuesto.


### Lógica de decisión de stock/restock

1. El cliente presiona `Pedir stock/restock` en un producto agotado e ingresa su correo.
2. El backend valida que ese correo no tenga otro intento para el mismo producto durante la temporada activa (`YYYY-T1` a `YYYY-T4`).
3. La solicitud queda con estado `en_espera` si todavía no alcanza el umbral; si ya alcanzó suficientes señales queda como `elegible_admin`.
4. Las señales se calculan como: `vistas del producto + clics del producto + mensajes oficiales de WhatsApp`.
5. El admin agrega manualmente la cantidad de mensajes recibidos por WhatsApp oficial y revisa el reporte de temporada.
6. Si el cliente cambia de opinión, puede presionar `Cancelar stock/restock`; la solicitud pasa a `cancelado` y no cuenta como solicitud activa.
7. Al cerrar la temporada, el panel sirve como informe para decidir compras de inventario o preventas del siguiente periodo.

## ☁️ Despliegue sugerido

- MongoDB Atlas o un servicio administrado de MongoDB.
- Backend Express: Render, raíz `backend/`, build `npm install`, start `npm start`.
- Frontend Next.js: Vercel, raíz `frontend/`, variable `NEXT_PUBLIC_API_URL=https://wijutopia-backend.onrender.com`.
