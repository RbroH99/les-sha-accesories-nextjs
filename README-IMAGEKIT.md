# 📸 Configuración de ImageKit.io

## 🚀 Configuración Inicial

### 1. Crear Cuenta en ImageKit.io
1. Ve a [ImageKit.io](https://imagekit.io)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Obtener Credenciales
En tu dashboard de ImageKit:
1. Ve a **Developer Options** → **API Keys**
2. Copia las siguientes credenciales:
   - **Public Key**
   - **Private Key** 
   - **URL Endpoint**

### 3. Configurar Variables de Entorno
Agrega a tu archivo `.env.local`:

\`\`\`env
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_xxx"
IMAGEKIT_PRIVATE_KEY="private_xxx"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/tu_id"
\`\`\`

## 🎯 Características Implementadas

### ✅ Subida de Imágenes
- **Drag & Drop**: Arrastra imágenes directamente
- **Búsqueda de Archivos**: Click para seleccionar
- **Múltiples Formatos**: JPG, PNG, WebP
- **Validación**: Tamaño máximo 5MB
- **Progreso Visual**: Barra de progreso en tiempo real

### ✅ Optimización Automática
- **Compresión**: Calidad 80% por defecto
- **Formato WebP**: Conversión automática
- **Responsive**: Diferentes tamaños según dispositivo
- **Lazy Loading**: Carga bajo demanda

### ✅ Gestión de Imágenes
- **Eliminación**: Borra imágenes de ImageKit
- **Organización**: Carpetas automáticas por categoría
- **Metadatos**: Tags y información adicional

## 🔧 Uso en Componentes

### Componente de Subida
\`\`\`tsx
<ImageUpload
  images={images}
  onImagesChange={setImages}
  maxImages={5}
  folder="products"
/>
\`\`\`

### Imagen Optimizada
\`\`\`tsx
<OptimizedImage
  src={imageUrl}
  alt="Producto"
  width={300}
  height={300}
  quality={90}
  format="webp"
/>
\`\`\`

## 📁 Estructura de Carpetas

\`\`\`
ImageKit Storage:
├── bisuteria/
│   ├── products/          # Imágenes de productos
│   ├── categories/        # Imágenes de categorías
│   ├── users/            # Avatares de usuarios
│   └── banners/          # Banners promocionales
\`\`\`

## 🛡️ Seguridad

- **Validación de Tipos**: Solo imágenes permitidas
- **Límite de Tamaño**: Máximo 5MB por imagen
- **Autenticación**: Tokens seguros para subida
- **Eliminación Segura**: Solo archivos propios

## 💰 Límites del Plan Gratuito

- **Almacenamiento**: 20GB
- **Ancho de Banda**: 20GB/mes
- **Transformaciones**: Ilimitadas
- **CDN Global**: Incluido

## 🚀 Optimizaciones Avanzadas

### Transformaciones Automáticas
- **Redimensionado**: Automático según dispositivo
- **Compresión**: Inteligente sin pérdida de calidad
- **Formato**: WebP para navegadores compatibles
- **Lazy Loading**: Carga progresiva

### CDN Global
- **Velocidad**: Entrega desde el servidor más cercano
- **Cache**: Almacenamiento en edge locations
- **Disponibilidad**: 99.9% uptime garantizado

## 🔍 Monitoreo

### Dashboard de ImageKit
- **Uso de Almacenamiento**: Espacio utilizado
- **Ancho de Banda**: Transferencia mensual
- **Estadísticas**: Imágenes más solicitadas
- **Rendimiento**: Tiempos de carga

### Logs de la Aplicación
- **Subidas Exitosas**: Confirmación de almacenamiento
- **Errores**: Fallos en la subida
- **Optimizaciones**: Transformaciones aplicadas
