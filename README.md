# 📚 Wijutopia TCG - Catálogo Web Público

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Catálogo Web Público de Wijutopia TCG** — Una plataforma moderna de e-commerce para el descubrimiento y preventa de cartas de Trading Card Games (TCG), diseñada como **frontend puro** con arquitectura lista para conectarse a un backend de gestión de admin e inventario.

## 🎯 Propósito

Este proyecto es el **Catálogo Web Público** de Wijutopia, la vidriera digital 24/7 que permite a los clientes:

- ✨ **Explorar el inventario** de cartas TCG (Pokémon, Yu-Gi-Oh!, etc.)
- 🔍 **Filtrar y buscar** por juego, rareza, precio y disponibilidad
- 📊 **Registrar preferencias** mediante telemetría clickstream para análisis de demanda
- 🛒 **Generar intenciones de compra** (preventas) con integración a WhatsApp Business
- ♥️ **Crear listas de deseos** personalizadas

### Características Clave

| Feature | Estado | Descripción |
|---------|--------|-------------|
| 📱 Catálogo Responsivo | ✅ | Grid adaptable, búsqueda full-text |
| 🔌 API Service Layer | ✅ | Placeholders listos para backend real |
| 📊 Telemetría Clickstream | ✅ | Tracking de vistas, clics, deseos |
| 🎨 Dark Mode | ✅ | Soporte automático light/dark |
| 🌐 i18n Ready | ✅ | Estructura preparada para localización |
| 📦 Docker | ✅ | Deployment containerizado |
| 🧪 Testing | 🔄 | Jest + React Testing Library (próximo) |

## 🚀 Quick Start

### Requisitos Previos

- **Node.js** ≥ 24.0.0
- **npm** o **pnpm**
- **Docker** (opcional, para deployment)

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/relicarioliraly/wijutopia-catalog-web.git
cd wijutopia-catalog-web

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu configuración
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo (http://localhost:3000)
npm run dev

# En otra terminal: watch de TypeScript
npm run typecheck -- --watch

# Ejecutar linter
npm run lint
```

### Build & Producción

```bash
# Build optimizado
npm run build

# Iniciar servidor de producción
npm start

# Con puerto personalizado
PORT=8080 npm start
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                  # App Router de Next.js
│   │   ├── client/
│   │   │   └── page.tsx      # Página principal del catálogo
│   │   ├── layout.tsx        # Layout global
│   │   ├── page.tsx          # Home (landing)
│   │   └── globals.css       # Estilos globales
│   ├── components/
│   │   ├── ProductCard.tsx   # Tarjeta de carta TCG
│   │   ├── BackendStatus.tsx # Indicador de conexión backend
│   │   ├── SiteNav.tsx       # Navegación principal
│   │   └── Icons.tsx         # Sistema de iconos
│   ├── hooks/
│   │   └── useTracker.ts     # Hook de telemetría (legacy)
│   └── lib/
│       ├── apiService.ts     # 🔌 Service layer + Mock data
│       ├── api.ts            # Legacy (deprecar)
│       └── catalogTaxonomy.ts # Metadata de catálogo
├── public/
│   ├── wijutopia-logo.svg
│   └── ...
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔌 Integración Backend

### Modo Actual: MOCK (Desarrollo)

El proyecto actualmente usa **datos simulados** (MOCK) en `src/lib/apiService.ts`:

```typescript
// ✅ Datos de ejemplo (hardcoded)
const MOCK_CARDS = [
  { id: '1', name: 'Charizard ex', game: 'Pokemon', ... },
  { id: '2', name: 'Blastoise ex', game: 'Pokemon', ... },
  // ...
];

export async function getAllCards(filters?: CatalogFilter): Promise<Card[]> {
  // Retorna MOCK_CARDS filtrados
}
```

### Conexión al Backend Real

Cuando tu backend esté disponible, **reemplaza las funciones MOCK** en `apiService.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getAllCards(filters?: CatalogFilter): Promise<Card[]> {
  // Antes: return MOCK_CARDS.filter(...)
  
  // Después:
  const response = await fetch(`${API_BASE_URL}/api/catalog/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });
  return response.json();
}
```

### Endpoints Esperados del Backend

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/catalog/cards` | POST | Obtener cartas con filtros |
| `/api/catalog/cards/:id` | GET | Obtener carta específica |
| `/api/inventory/stock` | GET | Verificar stock e inventario |
| `/api/telemetry/clickstream` | POST | Registrar eventos de usuario |
| `/api/preorders` | POST | Crear intención de compra |
| `/api/captcha/verify` | POST | Validar verificación CAPTCHA |

## 🎨 Configuración de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000

# Analytics (opcional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# WhatsApp Business
NEXT_PUBLIC_WHATSAPP_PHONE=51900000000
NEXT_PUBLIC_WHATSAPP_BUSINESS_ID=123456789

# Modo desarrollo
NODE_ENV=development
```

### Variables Importantes

- **`NEXT_PUBLIC_API_URL`**: URL base del backend (por defecto: `http://localhost:5000`)
  - En desarrollo: `http://localhost:5000`
  - En staging: `https://api-staging.wijutopia.com`
  - En producción: `https://api.wijutopia.com`

- **`NODE_ENV`**: `development | production`

## 📊 Telemetría & Analytics

El catálogo registra **eventos clickstream** automáticamente:

```typescript
export interface ClickstreamEvent {
  eventType: 'PAGE_VIEW' | 'DETAIL_CLICK' | 'ADD_TO_WISHLIST';
  cardId?: string;
  timestamp: string;      // ISO 8601
  sessionToken: string;   // Agrupa eventos por sesión
}
```

### Flujo de Telemetría

1. Usuario abre catálogo → **PAGE_VIEW registrado**
2. Usuario hace clic en carta → **DETAIL_CLICK registrado**
3. Usuario agrega a deseos → **ADD_TO_WISHLIST registrado**
4. Los eventos se envían al backend via `POST /api/telemetry/clickstream`

### Tabla de Base de Datos Esperada

```sql
CREATE TABLE clickstream_telemetry (
  id UUID PRIMARY KEY,
  event_type VARCHAR(50),
  card_id UUID REFERENCES cards_metadata(id),
  session_token VARCHAR(255),
  user_ip INET,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_session (session_token),
  INDEX idx_created (created_at)
);
```

## 🐳 Deployment con Docker

### Build Local

```bash
# Build de la imagen Docker
docker build -f frontend/Dockerfile -t wijutopia-catalog:latest .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:5000 \
  wijutopia-catalog:latest
```

### Docker Compose

```bash
# Levantar solo el frontend
docker-compose up frontend

# Nota: El docker-compose.yml incluye solo frontend por ahora
```

### Deployment en Vercel (Recomendado)

El proyecto está optimizado para **Vercel** (creador de Next.js):

```bash
# 1. Subir a GitHub
git push origin main

# 2. Conectar en Vercel (https://vercel.com)
# - Seleccionar repo
# - Variables de entorno:
#   NEXT_PUBLIC_API_URL: https://api.wijutopia.com

# 3. Desplegar automáticamente
vercel deploy
```

## 🔐 Seguridad

### Prácticas Actuales

✅ **Type-safe**: TypeScript en todas partes  
✅ **Validación**: Zod/Yup listos para implementar  
✅ **Rate Limiting**: Preparado para backends  
✅ **CORS**: Configurado en `next.config.js`  
✅ **CSP Headers**: Listos para Vercel  

### CAPTCHA (Próximo)

El flujo de preventa debe validar con CAPTCHA:

```typescript
// Placeholder en apiService.ts
export async function verifyCaptcha(token: string): Promise<boolean> {
  // TODO: Implementar cuando el backend tenga servicio de CAPTCHA
  return true; // MOCK
}
```

## 📈 Roadmap

### Fase 1 (Actual) ✅
- [x] Frontend catálogo con datos MOCK
- [x] API service layer con placeholders
- [x] Componentes responsivos
- [x] Telemetría clickstream (local)

### Fase 2 (Próximo)
- [ ] Conectar a backend real (Express.js)
- [ ] Implementar CAPTCHA
- [ ] Autenticación de usuario (Entra ID / OAuth)
- [ ] Carrito persistente

### Fase 3
- [ ] Pagos con Stripe/Mercado Pago
- [ ] Notificaciones email
- [ ] Dashboard de preferencias de usuario
- [ ] Recomendaciones ML

### Fase 4
- [ ] App móvil nativa (React Native)
- [ ] Soporte offline
- [ ] PWA completo

## 🧪 Testing

```bash
# Unit tests
npm run test

# Tests con coverage
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e
```

## 🤝 Contribuir

1. **Fork** el proyecto
2. **Crea una rama** (`git checkout -b feature/awesome-feature`)
3. **Commit** cambios (`git commit -m 'Add awesome feature'`)
4. **Push** a la rama (`git push origin feature/awesome-feature`)
5. **Abre un Pull Request**

## 📚 Documentación

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🐛 Reporte de Bugs

Abre una [GitHub Issue](https://github.com/relicarioliraly/wijutopia-catalog-web/issues/new) con:

- Descripción clara del bug
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots/videos (si aplica)
- Versión de Node.js y navegador

## 📝 Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para el historial de versiones.

## 📄 Licencia

Este proyecto está bajo licencia **MIT**. Ver [LICENSE](LICENSE) para detalles.

## 👤 Autor

Desarrollado para **Wijutopia TCG** — Tienda de trading cards en Trujillo, Perú.

- **Email**: relicarioliraly@gmail.com
- **GitHub**: [@relicarioliraly](https://github.com/relicarioliraly)

## 🙏 Agradecimientos

- Equipo de Wijutopia por la visión del proyecto
- Comunidad React y Next.js por herramientas excelentes
- Tailwind Labs por Tailwind CSS

---

## 🚢 Stack Técnico Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Este Proyecto)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Next.js 14 + React 18 + TypeScript + Tailwind CSS     │  │
│  │ - UI responsiva (mobile-first)                        │  │
│  │ - Dark mode automático                               │  │
│  │ - SSR/SSG optimizado                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↓↑                                   │
│         API Service Layer (apiService.ts)                     │
│         - MOCK data (ahora)                                   │
│         - Real backend (pronto)                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Por Conectar)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Express.js + Node.js + MongoDB                         │  │
│  │ - REST API                                            │  │
│  │ - Autenticación                                       │  │
│  │ - Gestión de inventario                              │  │
│  │ - Telemetría & Analytics                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

**¡Listo para compartir en GitHub!** 🚀

Para subirlo a tu repositorio:

```bash
git init
git add .
git commit -m "Initial commit: Wijutopia Catalog Web - Frontend puro"
git branch -M main
git remote add origin https://github.com/relicarioliraly/wijutopia-catalog-web.git
git push -u origin main
```

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
