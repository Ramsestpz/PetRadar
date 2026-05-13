# PetRadar API - Demostración

## ✅ Lo que se ha implementado

### 1. Redis (Caché en endpoints GET)
- ✅ Instalado `@nestjs/cache-manager` y `cache-manager-redis-store`
- ✅ Configurado en `app.module.ts` con TTL de 5 minutos
- ✅ Endpoints GET con caché:
  - `GET /lost-pets` - Lista mascotas perdidas activas
  - `GET /found-pets` - Lista mascotas encontradas

### 2. Application Insights (Monitoreo)
- ✅ Integrado en `main.ts`
- ✅ Auto-recopila requests, performance, y excepciones
- ✅ Configurable vía `APPLICATIONINSIGHTS_CONNECTION_STRING`

### 3. Docker
- ✅ `Dockerfile` con multi-stage build optimizado
- ✅ `.dockerignore` configurado
- ✅ `docker-compose.yml` actualizado con PostgreSQL + PostGIS + Redis

### 4. GitHub Actions
- ✅ Workflow `.github/workflows/docker-build.yml`
- ✅ Construye y pushea automáticamente a GHCR
- ✅ Soporta ramas y tags

### 5. Búsqueda por Radio (Funcionalidad Central)
- ✅ Al crear mascota encontrada (POST /found-pets):
  - Busca mascotas perdidas activas en radio de 500m
  - Usa ST_DWithin de PostGIS con::geography para distancias en metros
  - Envía notificaciones por email
  - Retorna cantidad de coincidencias encontradas

## 🧪 Pruebas Realizadas

### Test 1: Verificar endpoints GET
```bash
curl http://localhost:3000/lost-pets
curl http://localhost:3000/found-pets
```
✅ Ambos retornan 200 OK con arrays (vacíos o con datos)

### Test 2: Crear mascota perdida
```bash
curl -X POST http://localhost:3000/lost-pets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Firulais",
    "species": "Perro",
    "breed": "Labrador",
    "color": "Marrón",
    "size": "Grande",
    "description": "Perro marrón con mancha blanca",
    "owner_name": "Juan Pérez",
    "owner_email": "juan@example.com",
    "owner_phone": "+34 123 456 789",
    "lat": 40.4168,
    "lng": -3.7038,
    "address": "Calle Principal 123",
    "lost_date": "2024-05-12T10:00:00Z"
  }'
```
✅ Registra correctamente

### Test 3: Crear mascota encontrada (Trigger búsqueda por radio)
```bash
curl -X POST http://localhost:3000/found-pets \
  -H "Content-Type: application/json" \
  -d '{
    "species": "Perro",
    "breed": "Labrador",
    "color": "Marrón",
    "size": "Grande",
    "description": "Perro encontrado en el parque",
    "finder_name": "María García",
    "finder_email": "maria@example.com",
    "finder_phone": "+34 987 654 321",
    "lat": 40.4170,
    "lng": -3.7036,
    "address": "Parque Central",
    "found_date": "2024-05-13T15:00:00Z"
  }'
```
**Respuesta:**
```json
{
  "message": "Mascota registrada",
  "matches_found": 5
}
```
✅ Búsqueda por radio funcionando! Encontró 5 mascotas perdidas dentro de 500m

## 🚀 Construir y ejecutar en producción

### Opción 1: Local con Docker
```bash
# Construir imagen
docker build -t pet-radar-api:latest .

# Ejecutar con docker-compose
docker-compose up -d

# Acceder en http://localhost:3000
```

### Opción 2: Publicar a GHCR
```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build y push
docker build -t ghcr.io/USERNAME/pet-radar-api:latest .
docker push ghcr.io/USERNAME/pet-radar-api:latest

# Ejecutar desde GHCR
docker run -p 3000:3000 \
  -e DB_HOST=postgres \
  -e REDIS_HOST=redis \
  ghcr.io/USERNAME/pet-radar-api:latest
```

## 📦 Variables de Entorno

Ver `.env.example` y `.env` para configuración completa:
- `DB_*` - Configuración PostgreSQL
- `REDIS_*` - Configuración Redis
- `APPLICATIONINSIGHTS_CONNECTION_STRING` - Azure Application Insights
- `MAILER_*` - Configuración de email
- `MAPBOX_TOKEN` - Token para mapas

## 📊 Commits Realizados

1. ✅ `feat: Implement Redis caching, Application Insights, Docker, GitHub Actions and search by radius`
   - Agregó dependencias
   - Configuró Redis y Application Insights
   - Creó Dockerfile y docker-compose actualizado
   - Agregó GitHub Actions workflow

2. ✅ `fix: Simplify email handling and fix encoding issues`
   - Corrigió manejo de errores en emails
   - Simplificó HTML del email para evitar problemas de encoding

## 🔗 GitHub Repository
- https://github.com/Ramsestpz/PetRadar

## 🎬 Video Demo
El video debe mostrar:
1. ✅ Commit y push a GitHub
2. ✅ Build automático en GitHub Actions
3. ✅ Imagen publicada en GHCR
4. ✅ Requests al endpoint de búsqueda por radio con matches encontrados
