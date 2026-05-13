# PetRadar API

Una API NestJS para gestionar mascotas perdidas y encontradas con búsqueda por radio geográfico usando PostGIS.

## 🎯 Características

- **Búsqueda por Radio**: Detecta automáticamente mascotas perdidas dentro de 500 metros cuando se registra una mascota encontrada usando PostGIS
- **Caché con Redis**: Endpoints GET con caché de 5 minutos para optimizar consultas
- **Monitoreo con Application Insights**: Telemetría y monitoreo de la API
- **Contenerización Docker**: Imagen optimizada para producción con multi-stage build
- **CI/CD con GitHub Actions**: Construcción y publicación automática en GHCR
- **Notificaciones por Email**: Alertas automáticas cuando se encuentra una coincidencia

## 🚀 Stack Tecnológico

- **Framework**: NestJS 11
- **Base de Datos**: PostgreSQL con PostGIS
- **Caché**: Redis
- **ORM**: TypeORM
- **Monitoreo**: Azure Application Insights
- **Contenedorización**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Email**: Nodemailer

## 📋 Requisitos Previos

- Node.js 22+
- pnpm o npm
- Docker & Docker Compose
- Variables de entorno configuradas

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TU_USUARIO/pet-radar-api.git
   cd pet-radar-api
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales
   ```

4. **Levantar servicios con Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 🏃 Ejecución

### Desarrollo
```bash
pnpm run start:dev
```

### Producción
```bash
pnpm run build
pnpm run start:prod
```

### Docker
```bash
docker-compose up
```

## 📚 API Endpoints

### GET Endpoints (con caché Redis)

```bash
# Obtener mascotas perdidas activas
GET /lost-pets

# Obtener mascotas encontradas
GET /found-pets
```

### POST Endpoints

```bash
# Registrar mascota perdida
POST /lost-pets
Content-Type: application/json

{
  "name": "Firulais",
  "species": "Perro",
  "breed": "Labrador",
  "color": "Marrón",
  "size": "Grande",
  "description": "Perro marrón con mancha blanca en el pecho",
  "photo_url": "https://example.com/photo.jpg",
  "owner_name": "Juan Pérez",
  "owner_email": "juan@example.com",
  "owner_phone": "+34 123 456 789",
  "address": "Calle Principal 123",
  "lat": 40.4168,
  "lng": -3.7038,
  "lost_date": "2024-05-12T10:00:00Z"
}

# Registrar mascota encontrada
POST /found-pets
Content-Type: application/json

{
  "species": "Perro",
  "breed": "Labrador",
  "color": "Marrón",
  "size": "Grande",
  "description": "Perro marrón encontrado en el parque",
  "photo_url": "https://example.com/photo.jpg",
  "finder_name": "María García",
  "finder_email": "maria@example.com",
  "finder_phone": "+34 987 654 321",
  "address": "Parque Central",
  "lat": 40.4170,
  "lng": -3.7036,
  "found_date": "2024-05-12T15:00:00Z"
}
```

## 🔍 Búsqueda por Radio

Cuando registras una mascota encontrada (POST /found-pets), el sistema automáticamente:

1. Busca en la base de datos todas las mascotas perdidas activas (is_active = true)
2. Usa la función ST_DWithin de PostGIS para encontrar coincidencias dentro de 500 metros
3. Envía emails de notificación a los propietarios de las mascotas coincidentes
4. Devuelve la cantidad de coincidencias encontradas

**Nota**: La búsqueda usa `::geography` para que las distancias se calculen en metros.

## 🐳 Docker & GHCR

### Construir imagen localmente
```bash
docker build -t pet-radar-api:latest .
```

### Ejecutar contenedor
```bash
docker run -p 3000:3000 \
  -e DB_HOST=postgres \
  -e REDIS_HOST=redis \
  pet-radar-api:latest
```

### Imagen en GitHub Container Registry
```bash
# Login
echo $GH_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Push
docker push ghcr.io/USERNAME/pet-radar-api:latest
```

## 📊 Monitoreo con Application Insights

Configura la variable `APPLICATIONINSIGHTS_CONNECTION_STRING` en tu `.env`:

```env
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxx...
```

La API automáticamente reportará:
- Requests HTTP
- Performance metrics
- Excepciones
- Dependencias

## ✅ Tests

```bash
# Unit tests
pnpm run test

# Test coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e
```

## 📝 Licencia

Este proyecto está bajo licencia UNLICENSED.

## 👨‍💻 Autor

Pet Radar API - Solución para conectar mascotas perdidas y encontradas.

$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
