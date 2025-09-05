# Lesha Accesorios - Proyecto de E-commerce

¡Bienvenido a Lesha Accesorios! Este es el repositorio de un proyecto de e-commerce full-stack desarrollado con Next.js, diseñado para una tienda de bisutería artesanal.

## Descripción

Esta aplicación permite a los clientes explorar un catálogo de productos, añadirlos al carrito, realizar pedidos y gestionar su cuenta de usuario. Incluye un panel de administración para gestionar productos, categorías, pedidos y configuraciones de la tienda.

## Características Principales

- **Catálogo de Productos:** Visualización de productos con imágenes, descripciones, precios y stock.
- **Carrito de Compras:** Funcionalidad completa para añadir, modificar y eliminar productos del carrito.
- **Proceso de Checkout:** Flujo de compra para que los clientes finalicen sus pedidos.
- **Autenticación de Usuarios:** Registro e inicio de sesión para clientes.
- **Perfil de Usuario:** Los clientes pueden ver su historial de pedidos y gestionar su información.
- **Notificaciones por Correo:** Envío automático de correos de confirmación de pedido vía SMTP.
- **Panel de Administración:** Interfaz para gestionar el contenido y las operaciones de la tienda.

## Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) y [Shadcn/ui](https://ui.shadcn.com/)
- **Envío de Correos:** [Nodemailer](https://nodemailer.com/) (vía SMTP)
- **Plantillas de Correo:** [React Email](https://react.email/)
- **Gestión de Imágenes:** [ImageKit](https://imagekit.io/)
- **Gestor de Paquetes:** [pnpm](https://pnpm.io/)

---

## Guía de Instalación y Configuración

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno de desarrollo local.

### 1. Prerrequisitos

Asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [pnpm](https://pnpm.io/installation)
- Una instancia de [PostgreSQL](https://www.postgresql.org/download/) en ejecución.

### 2. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd les-sha-accesories-nextjs
```

### 3. Instalar Dependencias

```bash
pnpm install
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto. Puedes copiar el archivo `.env.example` como plantilla:

```bash
cp .env.example .env.local
```

Ahora, abre `.env.local` y rellena las siguientes variables:

#### `DATABASE_URL`

La URL de conexión a tu base de datos PostgreSQL. Sigue el formato:
`postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_BASE_DE_DATOS`

#### `JWT_SECRET`

Una clave secreta para firmar los tokens de autenticación. Debe ser una cadena de texto larga y aleatoria. Puedes generar una fácilmente ejecutando el siguiente comando en tu terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### `SMTP_*`

Configuración para enviar correos a través de un servidor SMTP. **Se recomienda usar una cuenta de Gmail con una "Contraseña de Aplicación" por seguridad.**

1.  **Habilita la Verificación en 2 Pasos:**

    - Ve a la configuración de seguridad de tu cuenta de Google: [myaccount.google.com/security](https://myaccount.google.com/security).
    - Activa la "Verificación en 2 Pasos". Es un requisito indispensable.

2.  **Genera una Contraseña de Aplicación:**

    - En la misma página de seguridad, busca y haz clic en "Contraseñas de aplicaciones".
    - Selecciona "Correo" como la aplicación y "Otro (nombre personalizado)" como el dispositivo. Dale un nombre (ej. "Proyecto Lesha Next.js").
    - Google generará una contraseña de 16 caracteres. **Cópiala y guárdala bien, no podrás verla de nuevo.**

3.  **Rellena las variables en `.env.local`:**
    - `SMTP_HOST`: `"smtp.gmail.com"`
    - `SMTP_PORT`: `"587"`
    - `SMTP_SECURE`: `"false"`
    - `SMTP_USER`: Tu dirección de correo de Gmail.
    - `SMTP_PASS`: La contraseña de aplicación de 16 caracteres que generaste.
    - `SMTP_FROM_NAME`: El nombre que quieres que aparezca como remitente (ej. "Lesha Accesorios").
    - `SMTP_FROM_EMAIL`: Tu dirección de correo de Gmail (la misma que `SMTP_USER`).

#### `IMAGEKIT_*`

Estas credenciales son para el servicio de gestión de imágenes.

1.  **Crea una cuenta:** Regístrate en [imagekit.io](https://imagekit.io/).
2.  **Obtén las credenciales:** En el panel de control, ve a `Developer -> API Keys`.
3.  **Copia las claves:** Encontrarás tu `Public Key`, `Private Key` y `URL-endpoint`. Cópialas en las variables correspondientes.

#### `TELEGRAM_*` (Opcional)

Configuración para recibir notificaciones de nuevas órdenes en un chat de Telegram.

1.  **Crea un Bot:** Habla con el bot `@BotFather` en Telegram y sigue los pasos para crear un nuevo bot. Al final, te dará un **token de acceso**.
2.  **Obtén tu Chat ID:** Habla con el bot `@userinfobot` en Telegram. Te mostrará tu **Chat ID**.
3.  **Rellena las variables:**
    - `TELEGRAM_BOT_TOKEN`: El token de acceso que te dio `BotFather`.
    - `TELEGRAM_CHAT_ID`: Tu ID de chat.

#### `NEXT_PUBLIC_BASE_URL`

La URL base de tu aplicación. Para desarrollo local, déjala como `http://localhost:3000`.

### 5. Aplicar Migraciones de la Base de Datos

Para crear las tablas necesarias en tu base de datos, ejecuta el siguiente comando:

```bash
pnpm drizzle-kit push
```

_(Nota: El comando exacto puede variar según la configuración de `package.json`. Revisa los scripts si este no funciona)._

### 6. Poblar la Base de Datos (Opcional)

Puedes ejecutar los scripts SQL que se encuentran en la carpeta `/scripts` para llenar tu base de datos con datos de ejemplo (categorías, productos, configuraciones, etc.).

### 7. Ejecutar el Servidor de Desarrollo

¡Todo listo! Inicia la aplicación con el siguiente comando:

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el proyecto en funcionamiento.
