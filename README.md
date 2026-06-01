# Wijutopia TCG E-Commerce - Trujillo, Perú 🇵🇪

Plataforma de comercio electrónico de alto rendimiento diseñada como **prototipo académico** para una tienda TCG inspirada en Wijutopia, comunidad de juegos de cartas coleccionables de Trujillo, Perú. El sistema integra un frontend moderno con Next.js y Tailwind CSS, un backend RESTful en Express.js y persistencia relacional en MySQL.

> **Aviso legal:** este repositorio no representa una página oficial de Wijutopia, Wiju World ni de las franquicias Pokémon, Yu-Gi-Oh!, Digimon, Bandai, One Piece o similares. Es un examen de prueba sin pagos reales ni inventario oficial.

## 🔗 Enlaces del Proyecto en Línea

- Frontend en Producción: `https://wijutopia-tcg.vercel.app`
- API REST Backend: `https://wijutopia-backend.onrender.com`



## 🎨 Limpieza visual e iconografía

La interfaz usa una navegación compacta con iconos SVG internos, un mapa rápido plegable para no sobrecargar la pantalla y una portada visual inspirada en una fachada morada de tienda TCG. La paleta visual toma como base los tonos morado noche, fachada violeta, letrero magenta, puerta púrpura, dorado lunar y azul vereda de la imagen de referencia. También se agregaron animaciones suaves de brillo/flotación y un interruptor de efectos sonoros opcionales para clics de navegación, carrito y confirmaciones; el sonido queda desactivado por defecto para respetar la experiencia del usuario. Las tarjetas priorizan estado, etiqueta, precio y acción principal para que el catálogo sea más legible.

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
- Si el indicador aparece en rojo, revise que el backend esté levantado, que MySQL esté configurado y que `NEXT_PUBLIC_API_URL` apunte al puerto correcto.

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
        ▼ mysql2/promise
MySQL / Railway-compatible InnoDB schema
```

## 🛠️ Instrucciones para Instalación Local

### Requisitos previos

- Node.js v18 o superior.
- MySQL 8.x local o remoto.

### Paso 1: Configurar la base de datos

Ejecute el esquema DDL:

```bash
mysql -u root -p < backend/config/schema.sql
```

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
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_clave_local_mysql
DB_NAME=wijutopia_db
DB_PORT=3306
JWT_SECRET=secret_desarrollo_local_wijutopia_123
CAPTCHA_KEY=8e9fb74ab1a89f81a7199c09930fca611a2f1b49e19dcaef18a66bc2df7f2931
CAPTCHA_IV=4b3d2b7e192a013e8d9a2a3bc5d6a7ef
ADMIN_EMAIL=admin@wijutopia.com
ADMIN_PASSWORD=WijuAdmin2026_TrujilloTcg!
FRONTEND_ORIGIN=http://localhost:3000
```

Para Railway puede usar `DB_URL=mysql://user:pass@host.railway.app:3306/wijutopia_db`.

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

- MySQL: Railway.
- Backend Express: Render, raíz `backend/`, build `npm install`, start `npm start`.
- Frontend Next.js: Vercel, raíz `frontend/`, variable `NEXT_PUBLIC_API_URL=https://wijutopia-backend.onrender.com`.
