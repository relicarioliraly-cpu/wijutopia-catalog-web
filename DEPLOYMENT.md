# 🚀 Guía de Deployment - Wijutopia Catalog Web

Este documento cubre las opciones de deployment para el Catálogo Web Público de Wijutopia.

## 📌 Tabla de Contenidos

1. [Vercel (Recomendado)](#vercel-recomendado)
2. [Docker](#docker)
3. [Railway](#railway)
4. [Netlify](#netlify)
5. [Variables de Entorno](#variables-de-entorno)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Vercel (Recomendado)

**Vercel** es la plataforma oficial creada por Vercel (creadores de Next.js). Ideal para proyectos Next.js.

### Setup en Vercel

1. **Ir a [vercel.com](https://vercel.com)** y crear cuenta con GitHub
2. **Importar proyecto:**
   - Click en "Import Project"
   - Seleccionar repositorio `wijutopia-catalog-web`
3. **Configurar variables de entorno:**
   - En Project Settings → Environment Variables
   - Agregar `NEXT_PUBLIC_API_URL`:
     - **Development**: `http://localhost:5000`
     - **Preview**: `https://api-staging.wijutopia.com`
     - **Production**: `https://api.wijutopia.com`
4. **Deploy automático:**
   - Cada push a `main` despliega automáticamente
   - Las PRs generan preview deployments

### Build Settings (Automático)

```
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### URL Resultante

```
https://frontend-nine-psi-97.vercel.app
```

> Nota: Este despliegue actual se vinculó al proyecto Vercel `relicarioliraly-cpus-projects/frontend`.

---

## 🐳 Docker

### Build Local

```bash
cd /path/to/wijutopia-catalog-web

# Build de imagen
docker build -f frontend/Dockerfile -t wijutopia-catalog:latest .

# Verificar imagen
docker images | grep wijutopia-catalog
```

### Ejecutar Contenedor

```bash
docker run \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000 \
  wijutopia-catalog:latest
```

Acceder a: http://localhost:3000

### Docker Compose (Frontend Solo)

```bash
# Levantar solo frontend
docker-compose up frontend

# Parar contenedor
docker-compose down

# Ver logs
docker-compose logs -f frontend
```

### Push a Container Registry

```bash
# Ejemplo: Docker Hub
docker tag wijutopia-catalog:latest YOUR_DOCKER_USERNAME/wijutopia-catalog:latest
docker push YOUR_DOCKER_USERNAME/wijutopia-catalog:latest

# Ejemplo: GitHub Container Registry
docker tag wijutopia-catalog:latest ghcr.io/relicarioliraly/wijutopia-catalog:latest
docker push ghcr.io/relicarioliraly/wijutopia-catalog:latest
```

---

## 🚂 Railway

Railway es una alternativa a Vercel para deployments simplificados.

### Setup en Railway

1. **Ir a [railway.app](https://railway.app)** y crear cuenta
2. **Conectar GitHub:**
   - Crear nuevo proyecto
   - Seleccionar repositorio
3. **Configurar:**
   - Root directory: `.` (raíz del proyecto)
   - Build command: `npm run build`
   - Start command: `npm start`
4. **Variables de entorno:**
   - `NEXT_PUBLIC_API_URL=https://api.wijutopia.com`
   - `NODE_ENV=production`
5. **Deploy:**
   - Railway auto-despliega en cada push

### URL Resultante

```
https://wijutopia-catalog-web.railway.app
```

---

## 🌐 Netlify

Alternativa simplificada, aunque menos optimizada para Next.js.

### Setup en Netlify

1. **Ir a [netlify.com](https://netlify.com)**
2. **Conectar GitHub:**
   - "New site from Git"
   - Seleccionar repo
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Variables de entorno:**
   - Build variables:
     - `NEXT_PUBLIC_API_URL=https://api.wijutopia.com`
5. **Deploy automático en push**

### URL Resultante

```
https://wijutopia-catalog-web.netlify.app
```

---

## 🔑 Variables de Entorno

### Configuración por Ambiente

#### Development (`dev`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NODE_ENV=development
```

#### Staging (`stage`)
```env
NEXT_PUBLIC_API_URL=https://api-staging.wijutopia.com
NODE_ENV=production
```

#### Production (`prod`)
```env
NEXT_PUBLIC_API_URL=https://api.wijutopia.com
NODE_ENV=production
```

### Variables Soportadas

| Variable | Requerido | Valor por Defecto | Descripción |
|----------|-----------|-------------------|-------------|
| `NEXT_PUBLIC_API_URL` | ❌ | `http://localhost:5000` | URL base del backend |
| `NEXT_PUBLIC_NODE_ENV` | ❌ | `production` | Ambiente de ejecución |
| `NODE_ENV` | ✅ | - | `development` o `production` |
| `PORT` | ❌ | `3000` | Puerto del servidor |

---

## 🐛 Troubleshooting

### Build falla con "Module not found"

```bash
# Limpiar caché
rm -rf node_modules .next
npm install
npm run build
```

### API no responde en producción

```env
# Verificar que NEXT_PUBLIC_API_URL esté correctamente configurada
# Las variables NEXT_PUBLIC_* son visibles en el cliente

NEXT_PUBLIC_API_URL=https://api.wijutopia.com
```

### Tiempo de build excesivo

```bash
# Analizar bundle
npm run build -- --analyze

# Optimizar imports
# - Usar dynamic imports para componentes pesados
# - Code splitting automático en Next.js 14
```

### CORS errors en producción

```javascript
// En tu backend, agregar headers CORS:
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://wijutopia-catalog-web.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

---

## ✅ Checklist Pre-Deployment

- [ ] Todas las variables de entorno están configuradas
- [ ] `npm run build` se ejecuta sin errores
- [ ] `npm run lint` pasa todas las validaciones
- [ ] Tests pasan (si hay): `npm run test`
- [ ] README está actualizado
- [ ] `.env.local` NO está en git
- [ ] Versión en `package.json` está actualizada
- [ ] Git commit y push antes de deployar

---

## 📊 Monitoreo Post-Deployment

### Vercel Analytics

```javascript
// En next.config.js
module.exports = {
  analytics: {
    vercelWebVitals: {
      projectId: 'YOUR_PROJECT_ID'
    }
  }
};
```

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

## 🔄 CI/CD con GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 24
      - run: npm ci
      - run: npm run build
      - run: npm run lint

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v5
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📚 Referencias

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices)
- [Railway Docs](https://docs.railway.app)
- [Netlify Docs](https://docs.netlify.com)

---

**Última actualización:** Junio 2026
**Maintainer:** [@relicarioliraly](https://github.com/relicarioliraly)
