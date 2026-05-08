# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corregir todos los hallazgos críticos y altos del security review para dejar ImageCraft listo para producción.

**Architecture:** Fixes en capas: middleware de seguridad (helmet, rate-limit, CORS, error handler), lógica de auth y uploads, storage y DB hardening. Sin cambios de arquitectura JWT (eso es sprint separado).

**Tech Stack:** Node.js ESM, Express 4, multer, sharp, bcrypt, jsonwebtoken, Redis, SQLite/PostgreSQL

---

## Task 1: Remover .env del tracking y rotar credenciales

**Files:**
- Modify: `.gitignore`

- [ ] Advertencia manual: rotar AHORA en los providers:
  - AWS IAM: revocar `AKIAX2QKD2LCBLWEIBTJ`
  - Neon: cambiar password de `npg_Rte1niU2hZXM`
  - JWT_SECRET: generar nuevo: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

- [ ] Remover .env del tracking git:
```bash
git rm --cached .env
```

- [ ] Verificar que `.env` ya está en `.gitignore` (ya lo está).

- [ ] Commit:
```bash
git commit -m "Remove .env from git tracking"
```

---

## Task 2: Instalar dependencias de seguridad

- [ ] Instalar helmet y express-rate-limit:
```bash
npm install helmet express-rate-limit
```

---

## Task 3: Agregar helmet, rate-limit y body limit en app.js

**Files:**
- Modify: `app.js`

- [ ] Actualizar app.js con helmet, rate-limit y body size limit
- [ ] Commit: `git commit -m "Add helmet, rate limiting, and body size limit"`

---

## Task 4: Corregir multer (typo fileFilter, eliminar SVG)

**Files:**
- Modify: `middleware/upload.js`

- [ ] Corregir `fileName` → `fileFilter`, eliminar `image/svg+xml`
- [ ] Commit: `git commit -m "Fix multer fileFilter typo and remove SVG from allowed types"`

---

## Task 5: Corregir CORS (allowedHeaders, rechazar no-origin)

**Files:**
- Modify: `middleware/cors.js`

- [ ] Corregir key `headers` → `allowedHeaders`, rechazar requests sin Origin
- [ ] Commit: `git commit -m "Fix CORS config: allowedHeaders and reject no-origin requests"`

---

## Task 6: Sanitizar global error handler

**Files:**
- Modify: `middleware/globalErrorHandling.js`

- [ ] Ocultar `error.message` en producción, retornar mensaje genérico
- [ ] Commit: `git commit -m "Sanitize error handler to hide internals in production"`

---

## Task 7: Autenticar GET /images/:key

**Files:**
- Modify: `routes/image-routes.js`

- [ ] Agregar `authenticateJWT(["read"])` al endpoint GET /:key
- [ ] Agregar query `read` a los permisos de usuarios seed y default
- [ ] Commit: `git commit -m "Require authentication on GET /images/:key"`

---

## Task 8: Deshabilitar seeder en producción

**Files:**
- Modify: `database/DatabaseStrategy.js`

- [ ] Guard `NODE_ENV !== 'production'` en `seed()`
- [ ] Commit: `git commit -m "Disable database seeder in production environment"`

---

## Task 9: Habilitar TLS en PostgreSQL

**Files:**
- Modify: `database/DatabaseStrategy.js`

- [ ] `rejectUnauthorized: true` condicionado por `NODE_ENV`
- [ ] Commit: `git commit -m "Enable PostgreSQL TLS certificate verification"`

---

## Task 10: Corregir userId scoping en image-controller

**Files:**
- Modify: `controllers/image-controller.js`

- [ ] Siempre usar `req.user.userId`, no `null` para credentials
- [ ] Commit: `git commit -m "Fix image scoping: always enforce userId ownership"`

---

## Task 11: Agregar validación de inputs en register

**Files:**
- Modify: `controllers/auth-controller.js`

- [ ] Validar email, longitud de password (mín 8), formato de username
- [ ] Commit: `git commit -m "Add input validation for registration endpoint"`

---

## Task 12: Proteger path traversal en LocalStorageStrategy

**Files:**
- Modify: `services/storage-strategies.js`

- [ ] Agregar función `safeJoin` que valida que el path resuelto esté dentro de `storagePath`
- [ ] Commit: `git commit -m "Prevent path traversal in local storage strategy"`

---

## Task 13: Proteger sharp contra decompression bombs

**Files:**
- Modify: `services/image-service.js`

- [ ] Agregar `limitInputPixels: 25_000_000` a la instancia de sharp
- [ ] Commit: `git commit -m "Limit sharp input pixels to prevent decompression bombs"`

---

## Task 14: Reemplazar KEYS con SCAN en cache-service

**Files:**
- Modify: `services/cache-service.js`

- [ ] Usar SCAN con cursor en lugar de KEYS bloqueante
- [ ] Commit: `git commit -m "Replace blocking Redis KEYS with SCAN cursor"`

---

## Task 15: Limpieza final

**Files:**
- Delete: `services/database-old.js`
- Modify: `.gitignore`

- [ ] Eliminar `database-old.js`
- [ ] Agregar `dump.rdb` y `*.sqlite` a `.gitignore` y hacer `git rm --cached`
- [ ] Correr `npm audit fix`
- [ ] Commit final
