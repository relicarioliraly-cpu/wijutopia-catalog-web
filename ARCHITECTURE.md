# 🏗️ Arquitectura - Catálogo Web Público Wijutopia

Documento que describe la **arquitectura actual** y el **diseño para expansión futura** con backend conectado.

## 📐 Diagrama General

```
┌────────────────────────────────────────────────────────────────┐
│                   NAVEGADOR DEL USUARIO                         │
│                  (Chrome, Safari, Firefox)                       │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │ (CORS habilitado)
                     ▼
     ┌───────────────────────────────────┐
     │   NEXT.JS 14 - FRONTEND PURO      │
     │ (Todo en el cliente - ISR/SSG)    │
     │                                   │
     │ ┌─────────────────────────────┐  │
     │ │  React 18 Components        │  │
     │ │  - ProductCard              │  │
     │ │  - CatalogPage              │  │
     │ │  - Filters                  │  │
     │ └─────────────────────────────┘  │
     │           ▲                      │
     │           │ Usa                  │
     │           │                      │
     │ ┌─────────────────────────────┐  │
     │ │  API Service Layer          │  │
     │ │  (apiService.ts)            │  │
     │ │                             │  │
     │ │  ✅ MODO ACTUAL: MOCK       │  │
     │ │  🔌 PRÓXIMAMENTE: REAL      │  │
     │ └─────────────────────────────┘  │
     │                                   │
     └───────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │ (PRÓXIMAMENTE)       │
         ▼                      ▼
    ┌─────────┐          ┌──────────────┐
    │ Express │          │   WhatsApp   │
    │ Backend │          │   Business   │
    │ (5000)  │          │   API        │
    └─────────┘          └──────────────┘
         │
         ▼
    ┌─────────────┐
    │   MongoDB   │
    │   Atlas     │
    └─────────────┘
```

---

## 📂 Estructura de Carpetas

```
wijutopia-catalog-web/
│
├── frontend/                          # 👈 ÚNICO DIRECTORIO (Full Frontend)
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── page.tsx               # Home / Landing
│   │   │   ├── client/
│   │   │   │   └── page.tsx           # 🎯 Catálogo Principal
│   │   │   ├── layout.tsx             # Layout raíz
│   │   │   └── globals.css            # Estilos globales
│   │   │
│   │   ├── components/                # Componentes React
│   │   │   ├── ProductCard.tsx        # Tarjeta de carta
│   │   │   ├── SiteNav.tsx            # Navegación
│   │   │   ├── BackendStatus.tsx      # Indicador de conexión
│   │   │   ├── Icons.tsx              # Sistema de iconos
│   │   │   └── ...
│   │   │
│   │   ├── lib/
│   │   │   ├── apiService.ts          # 🔌 SERVICE LAYER
│   │   │   │   # - Abstracción de API
│   │   │   │   # - MOCK data (actual)
│   │   │   │   # - Llamadas reales (futuro)
│   │   │   ├── api.ts                 # Legacy (deprecar)
│   │   │   └── catalogTaxonomy.ts     # Metadata estática
│   │   │
│   │   ├── hooks/
│   │   │   └── useTracker.ts          # Telemetría (legacy)
│   │   │
│   │   └── types/                     # TypeScript types
│   │       └── ...
│   │
│   ├── public/
│   │   ├── wijutopia-logo.svg
│   │   └── ...
│   │
│   ├── package.json                   # Dependencias frontend
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── Dockerfile
│
├── docker-compose.yml                 # Solo frontend (antes había backend)
├── .env.example                       # Variables de entorno template
├── .gitignore
├── package.json                       # Raíz (frontend puro)
├── README.md                          # 📖 Documentación principal
├── DEPLOYMENT.md                      # 🚀 Guía de deployment
├── GITHUB-PUBLISH.md                  # 📤 Instrucciones GitHub
├── ARCHITECTURE.md                    # Este archivo
└── LICENSE
```

---

## 🔌 API Service Layer (apiService.ts)

### Responsabilidades

El archivo `src/lib/apiService.ts` es el **único punto de contacto** entre React y el backend:

```typescript
// ✅ Interfaz consistente
export async function getAllCards(filters?: CatalogFilter): Promise<Card[]>
export async function getCardById(cardId: string): Promise<Card | null>
export async function createPreorderIntent(intent: PreorderIntent): Promise<string>
export async function logClickstreamEvent(event: ClickstreamEvent): Promise<void>
```

### Migración de MOCK a Real

**ANTES (MOCK):**
```typescript
export async function getAllCards(filters?: CatalogFilter): Promise<Card[]> {
  // Retorna MOCK_CARDS.filter(...)
  return MOCK_CARDS;
}
```

**DESPUÉS (Real):**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllCards(filters?: CatalogFilter): Promise<Card[]> {
  const response = await fetch(`${API_BASE_URL}/api/catalog/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });
  
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
```

**Ventaja:** Solo cambias **apiService.ts**. Todo el resto del proyecto sigue igual ✅

---

## 🗂️ Flujo de Datos

### Lectura de Datos (GET)

```
Usuario abre catálogo
    ↓
Page React (`client/page.tsx`) monta
    ↓
useEffect → getAllCards() → apiService.ts
    ↓
¿Modo MOCK? → Retorna MOCK_CARDS
¿Backend? → Fetch a Express backend
    ↓
setState(cards)
    ↓
Renderizar <ProductCard cards={...} />
    ↓
Usuario ve cartas en grid
```

### Escritura de Datos (POST)

```
Usuario hace clic en "Generar Preventa"
    ↓
handlePreorderClick()
    ↓
createPreorderIntent({ cardId, quantity, sessionToken })
    ↓
apiService.ts → POST /api/preorders
    ↓
¿Modo MOCK? → Retorna URL placeholder
¿Backend? → Backend genera WhatsApp link real
    ↓
window.open(whatsappUrl) → Abre WhatsApp
    ↓
Usuario ve conversación preformateada
```

### Telemetría (Fire and Forget)

```
Usuario interactúa (view, click, wishlist)
    ↓
trackPageView(), trackAddToWishlist()
    ↓
logClickstreamEvent() en apiService.ts
    ↓
¿Modo MOCK? → console.log()
¿Backend? → POST /api/telemetry/clickstream
    ↓
Base de datos registra evento
    ↓
Analytics dashboard actualiza en tiempo real
```

---

## 🔐 Seguridad & Validación

### Nivel Frontend

```typescript
✅ Tipado con TypeScript
✅ Zod/Yup para validación (ready)
✅ CORS headers (next.config.js)
✅ CSP headers (Vercel)
✅ XSS protection (React escapa HTML)
```

### Nivel Backend (Próximo)

```typescript
✅ JWT o sessions
✅ Rate limiting
✅ Input validation
✅ HTTPS only
✅ SQL injection prevention
```

---

## 📊 Telemetría & Eventos

### Estructura ClickstreamEvent

```typescript
interface ClickstreamEvent {
  eventType: 'PAGE_VIEW' | 'DETAIL_CLICK' | 'ADD_TO_WISHLIST';
  cardId?: string;              // ID de la carta (si aplica)
  timestamp: string;            // ISO 8601: 2026-06-08T10:30:45Z
  sessionToken: string;         // UUID para agrupar eventos
}
```

### Base de Datos Esperada (PostgreSQL)

```sql
CREATE TABLE clickstream_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Evento
  event_type VARCHAR(50) NOT NULL,
  card_id UUID REFERENCES cards_metadata(id) ON DELETE SET NULL,
  
  -- Usuario (anónimo)
  session_token VARCHAR(255) NOT NULL,
  user_ip INET,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Índices para queries rápidas
  INDEX idx_session (session_token),
  INDEX idx_event_type (event_type),
  INDEX idx_created (created_at)
);
```

### Analytics Dashboard (Futuro)

```
├── Vistas totales por día
├── Cartas más vistas
├── Clics por juego / rareza
├── Conversión: vista → preventa
├── Usuarios activos (unique sessions)
└── Horarios pico
```

---

## 🎯 Estados de Aplicación

### Global State (Próximo: Context API / Zustand)

```typescript
// Estado del usuario
{
  sessionToken: string;
  userId?: string;
  preferences?: UserPreferences;
  isAuthenticated: boolean;
}

// Estado del catálogo
{
  cards: Card[];
  filters: CatalogFilter;
  loading: boolean;
  error?: string;
}

// Estado de backend
{
  isConnected: boolean;
  apiUrl: string;
  isMockMode: boolean;
}
```

---

## 🚀 Phases de Implementación

### Phase 1: ACTUAL ✅ Catálogo Estático
- [x] Frontend con datos MOCK
- [x] API Service layer (placeholder)
- [x] Componentes responsivos
- [x] Telemetría local (console.log)

### Phase 2: Backend Conectado 🔌
- [ ] Conectar Express.js backend
- [ ] Implementar endpoints `/api/catalog/cards`
- [ ] Telemetría en PostgreSQL
- [ ] Autenticación (opcional)

### Phase 3: Ecommerce Real 💳
- [ ] Carrito persistente
- [ ] Pagos (Stripe/Mercado Pago)
- [ ] Checkout
- [ ] Órdenes

### Phase 4: Inteligencia 🤖
- [ ] Recomendaciones ML
- [ ] Búsqueda de cartas por imagen
- [ ] Predicción de demanda
- [ ] Precios dinámicos

---

## 🔄 Flujo de Deployment

```
Local Development
    ↓
git push → GitHub
    ↓
GitHub Actions: Lint + Build
    ↓
Deploy automático a Vercel
    ↓
Production: wijutopia-catalog-web.vercel.app
    ↓
Usuarios pueden usar
```

---

## 💡 Key Design Decisions

| Decisión | Razón |
|----------|-------|
| **Next.js 14** | SSR/SSG, Full-stack ready, Best for React |
| **API Service Layer** | Desacoplamiento, fácil migración MOCK→Real |
| **MOCK Data** | Desarrollo sin backend, testeable |
| **Vercel Deploy** | Creator de Next.js, mejor integración |
| **TypeScript** | Type safety, mejor DX |
| **Tailwind CSS** | Utility-first, rápido, responsive |
| **Monorepo (Frontend solo)** | Simplificidad, fácil de mantener |

---

## 🛠️ Stack Técnico Resumido

```
Frontend:
  ├── Runtime: Node.js 24+
  ├── Framework: Next.js 14
  ├── UI: React 18 + TypeScript
  ├── Styling: Tailwind CSS 3
  ├── Package Manager: npm
  └── Deploy: Vercel

Backend (Próximo):
  ├── Runtime: Node.js
  ├── Framework: Express.js
  ├── Database: MongoDB / PostgreSQL
  └── Deploy: Railway / AWS

Infrastructure:
  ├── Container: Docker
  ├── Registry: Docker Hub / GHCR
  └── Monitoring: Vercel Analytics
```

---

## 📚 Referencias Arquitectónicas

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [API Facade Pattern](https://en.wikipedia.org/wiki/Facade_pattern)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Última actualización:** Junio 2026  
**Autor:** Copilot Assistant  
**Proyecto:** Wijutopia TCG Catalog Web
