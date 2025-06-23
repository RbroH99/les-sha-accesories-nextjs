# Configuración de Base de Datos

Este proyecto está configurado para usar PlanetScale como base de datos principal, con un sistema de fallback a datos en memoria para propósitos demostrativos.

## Configuración de PlanetScale

### 1. Crear cuenta en PlanetScale
1. Ve a [PlanetScale](https://planetscale.com) y crea una cuenta
2. Crea una nueva base de datos
3. Obtén la cadena de conexión desde el dashboard

### 2. Configurar variables de entorno
1. Copia `.env.example` a `.env.local`
2. Configura `DATABASE_URL` con tu cadena de conexión de PlanetScale

### 3. Ejecutar scripts de configuración
1. Ejecuta el script `scripts/create-planetscale-schema.sql` en la consola de PlanetScale
2. Ejecuta el script `scripts/seed-planetscale-data.sql` para poblar datos iniciales

### 4. Configurar Drizzle (Opcional)
\`\`\`bash
npm run db:generate  # Generar migraciones
npm run db:push      # Aplicar cambios al esquema
npm run db:studio    # Abrir Drizzle Studio
\`\`\`

## Arquitectura del Sistema

### Repositorios
- `lib/repositories/`: Contiene la lógica de acceso a datos
- Cada repositorio maneja una entidad específica (productos, usuarios, etc.)
- Incluye métodos de fallback para datos en memoria

### Servicios
- `lib/services/database.ts`: Servicio principal que coordina el acceso a datos
- Maneja automáticamente el fallback entre base de datos real y datos en memoria

### Esquema
- `lib/schema.ts`: Define el esquema de la base de datos usando Drizzle ORM
- Incluye todas las tablas, relaciones e índices necesarios

## Modo Demostración

Si no configuras `DATABASE_URL`, la aplicación funcionará en "modo demostración":
- Usa datos en memoria predefinidos
- Todas las operaciones CRUD funcionan normalmente
- Los datos se pierden al reiniciar la aplicación
- Se muestra una alerta indicando el modo actual

## Testing de Conexión

### API Endpoint
- `GET /api/test-db`: Prueba la conexión y retorna estadísticas

### Componente de Estado
- `<DatabaseStatus />`: Muestra el estado actual de la conexión
- Se puede incluir en cualquier página para mostrar información al usuario

## Migración de Datos

Para migrar de datos en memoria a base de datos real:
1. Configura la conexión a PlanetScale
2. Los repositorios automáticamente comenzarán a usar la base de datos
3. Los datos en memoria seguirán disponibles como fallback

## Estructura de Datos

### Tablas Principales
- `categories`: Categorías de productos
- `tags`: Etiquetas para productos
- `products`: Productos principales
- `discounts`: Sistema de descuentos
- `users`: Usuarios del sistema
- `orders`: Pedidos de clientes
- `contact_messages`: Mensajes de contacto

### Relaciones
- Productos ↔ Categorías (muchos a uno)
- Productos ↔ Tags (muchos a muchos)
- Productos ↔ Descuentos (muchos a muchos)
- Usuarios ↔ Pedidos (uno a muchos)
- Pedidos ↔ Items (uno a muchos)

## Monitoreo y Logs

- Todos los errores de base de datos se registran en consola
- Los fallbacks se activan automáticamente en caso de error
- El estado de conexión se puede verificar en tiempo real
