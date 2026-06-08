# 📤 Instrucciones para Publicar en GitHub

Este documento es un **paso a paso** para publicar el proyecto **Wijutopia Catalog Web** en tu cuenta de GitHub (@relicarioliraly).

## ✅ Prerequisitos

1. ✅ Cuenta en GitHub: [@relicarioliraly](https://github.com/relicarioliraly)
2. ✅ Git instalado en tu máquina
3. ✅ SSH keys configuradas en GitHub (opcional pero recomendado)

## 🚀 Pasos para Publicar

### 1️⃣ Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Llena los datos:
   - **Repository name:** `wijutopia-catalog-web`
   - **Description:** `Catálogo Web Público de Wijutopia TCG - Frontend con Next.js + React 18`
   - **Visibility:** Public (para que otros lo vean)
   - **Add .gitignore:** No necesario (ya lo tenemos)
   - **Add README:** No necesario (ya lo tenemos)
   - **Choose a license:** MIT (recomendado)
3. Click en **"Create repository"**

### 2️⃣ Preparar el Repositorio Local

```bash
# Ir al directorio del proyecto
cd /home/andersson/Desktop/Examen-de-prueba-Wijutopia-web-main

# Inicializar git (si no está hecho)
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit: Wijutopia Catalog Web - Frontend puro con Next.js"

# Ver status
git status
```

### 3️⃣ Conectar con GitHub

```bash
# Opción A: Con HTTPS (más simple)
git remote add origin https://github.com/relicarioliraly/wijutopia-catalog-web.git

# Opción B: Con SSH (más seguro)
git remote add origin git@github.com:relicarioliraly/wijutopia-catalog-web.git

# Verificar conexión
git remote -v
```

### 4️⃣ Enviar a GitHub

```bash
# Renombrar rama a 'main' (estándar actual)
git branch -M main

# Enviar por primera vez
git push -u origin main

# De ahora en adelante: solo `git push`
```

### 5️⃣ Verificar en GitHub

1. Ve a https://github.com/relicarioliraly/wijutopia-catalog-web
2. Verifica que:
   - ✅ README.md se ve correctamente
   - ✅ Todos los archivos están presentes
   - ✅ La estructura de carpetas es correcta
   - ✅ El .gitignore está activo (node_modules no aparece)

---

## 📋 Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Git inicializado localmente
- [ ] Remote origen configurado
- [ ] Primer commit enviado
- [ ] README visible en GitHub
- [ ] Package.json visible
- [ ] frontend/ y archivos de config presentes
- [ ] No hay archivos sensibles (.env, node_modules)

---

## 🔄 Flujo de Trabajo Futuro

### Hacer cambios locales

```bash
# Editar archivos...

# Ver cambios
git status

# Agregar cambios
git add .

# Commit descriptivo
git commit -m "feat: add dark mode toggle"

# Enviar a GitHub
git push
```

### Crear ramas para nuevas features

```bash
# Crear rama
git checkout -b feature/my-feature

# Hacer cambios y commits...

# Enviar rama
git push -u origin feature/my-feature

# Crear Pull Request en GitHub (manual en web)
```

### Ver historial

```bash
# Últimos commits
git log --oneline -10

# Ver cambios
git diff HEAD~1

# Ver rama actual
git branch
```

---

## 🎯 Próximos Pasos (Después de Publicar)

### 1. Agregar Topics (Etiquetas)

En GitHub, en la página del repo:
1. Click en "⚙️ Settings"
2. Ir a "About" (arriba a la derecha)
3. Agregar topics:
   - `next-js`
   - `react`
   - `tcg`
   - `ecommerce`
   - `catalog`

### 2. Agregar Badges en README

Ya incluidos en el README.md actual ✅

### 3. Configurar Deploy Automático

Para Vercel:
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login y deploy
vercel
```

Para Railway:
1. Ve a https://railway.app
2. Click "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway en tu GitHub
5. Selecciona `wijutopia-catalog-web`

### 4. Agregar Actions (Opcional)

Crear `.github/workflows/lint.yml` para CI automático:

```yaml
name: Lint & Build

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 24
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

### 5. Crear LICENSE

Ya está en la estructura, pero git lo agregará automáticamente.

---

## 📞 Soporte

Si encuentras problemas:

1. **Git no funciona:**
   ```bash
   git config --global user.email "relicarioliraly@gmail.com"
   git config --global user.name "Relicario"
   ```

2. **Remote url incorrecta:**
   ```bash
   # Ver actual
   git remote -v
   
   # Cambiar
   git remote set-url origin https://github.com/relicarioliraly/wijutopia-catalog-web.git
   ```

3. **Conflictos en merge:**
   ```bash
   git merge --abort  # Cancelar merge
   git pull --rebase  # Pull con rebase
   ```

4. **Recuperar commits:**
   ```bash
   git reflog  # Ver historial completo
   git reset --hard <commit>  # Volver a commit
   ```

---

## 🎉 ¡Listo!

Tu proyecto está en GitHub en:
```
https://github.com/relicarioliraly/wijutopia-catalog-web
```

Comparte el link en:
- LinkedIn: "Catálogo Web Público de Wijutopia TCG..."
- Twitter: "#NextJS #React #TCG"
- Portafolio personal
- CV

---

**Última actualización:** Junio 2026  
**Preparado por:** Copilot Assistant  
**Para:** Wijutopia TCG Project
