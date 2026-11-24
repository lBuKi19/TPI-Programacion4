# TP Integrador - Programación IV

Aplicación web para gestión de una tienda online de alimentos.

# Video de demostración
enlace al video:

```text
https://www.youtube.com/watch?v=bvaAo11vejY
```

## Tecnologías

### Backend

- Python 3.12
- FastAPI
- SQLModel
- PostgreSQL

### Frontend

- React
- TypeScript
- Vite
- Zustand
- TanStack Query
- Tailwind CSS

---

# Requisitos

- Python 3.12+
- PostgreSQL
- Node.js 20+
- pnpm

---

# Backend

Ubicarse en la carpeta:

```bash
cd backend
```

Crear y activar entorno virtual:

```bash
python -m venv .venv
source .venv/bin/activate
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

## Variables de entorno

Crear `backend/.env` a partir de `backend/.env.example`.

Ejemplo:

```env
DATABASE_URL=postgresql+psycopg://USUARIO:PASSWORD@localhost:5432/fastapi_productos

SECRET_KEY=CLAVE_SEGURA

ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

COOKIE_NAME=access_token
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

FRONTEND_ORIGIN=http://localhost:5173

INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_EMAIL=admin@foodstore.com
INITIAL_ADMIN_PASSWORD=Admin1234!
INITIAL_ADMIN_FULL_NAME=Administrador Food Store
```

## Base de datos

Crear la base:

```sql
CREATE DATABASE fastapi_productos;
```

## Seed inicial

Carga:

- usuario administrador
- categorías
- productos

```bash
python -m app.db.seed
```

## Usuario administrador

```text
Usuario: admin
Contraseña: Admin1234!
```

## Ejecutar backend

```bash
uvicorn app.main:app --reload
```

Swagger:

```text
http://localhost:8000/docs
```

---

# Frontend

Ubicarse en:

```bash
cd frontend
```

Instalar dependencias:

```bash
pnpm install
```

## Variables de entorno

Crear `frontend/.env` a partir de `frontend/.env.example`.

Contenido:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Verificar compilación

```bash
pnpm build
```

## Ejecutar frontend

```bash
pnpm dev
```

Aplicación:

```text
http://localhost:5173
```

---

# Funcionalidades

### Usuario

- Registro e inicio de sesión
- Catálogo de productos
- Carrito persistente
- Checkout
- Gestión de pedidos

### Administrador

- Resumen del negocio
- Gestión de categorías
- Gestión de productos
- Gestión de pedidos
- Gestión de usuarios

---


