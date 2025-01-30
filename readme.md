```
  _____                              ___           __ _   
  \_   \_ __ ___   __ _  __ _  ___  / __\ __ __ _ / _| |_ 
   / /\/ '_ ` _ \ / _` |/ _` |/ _ \/ / | '__/ _` | |_| __|
/\/ /_ | | | | | | (_| | (_| |  __/ /__| | | (_| |  _| |_ 
\____/ |_| |_| |_|\__,_|\__, |\___\____/_|  \__,_|_|  \__|
                        |___/                             
```
# ImageCraft

**ImageCraft** es una aplicación diseñada para la manipulación y almacenamiento eficiente de imágenes, combinando funcionalidad avanzada con un diseño centrado en el rendimiento y escalabilidad. Esta aplicación está diseñada para ofrecer una solución robusta que incluye carga, edición, optimización y almacenamiento de imágenes.

---

## Características

- **Carga eficiente de imágenes**: Soporta múltiples formatos de imagen (JPEG, PNG, etc.) utilizando `multer` para la carga de archivos.
- **Optimización de imágenes**: Reducción de tamaño y optimización del formato de imágenes con la librería `sharp`.
- **Almacenamiento múltiple**:
    - **En la nube**: Integra Amazon S3, utilizando `@aws-sdk/client-s3` y `@aws-sdk/lib-storage`, para un almacenamiento seguro y escalable.
    - **Almacenamiento local**: Permite guardar las imágenes directamente en el sistema de archivos local del servidor.
- **JWT-based Authentication**: Garantiza el acceso seguro al usar tokens JWT para gestionar usuarios y permisos de carga.
- **Gestión de permisos**: Implementa lógicas seguras para usuarios y administradores.
- **Configuración personalizable**: Gestión centralizada de configuraciones utilizando el paquete `dotenv`.

---

## Instalación

1. Clona el repositorio desde GitHub:
   ```bash
   git clone https://github.com/tuusuario/imagecraft.git
   cd imagecraft
   ```

2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   PORT=3000
   STORAGE_TYPE=local    # Cambia a "s3" para usar almacenamiento en Amazon S3
   LOCAL_UPLOAD_FOLDER=uploads/ # Carpeta para almacenamiento local
   AWS_ACCESS_KEY_ID=tu_access_key
   AWS_SECRET_ACCESS_KEY=tu_secret_key
   AWS_BUCKET_NAME=nombre_bucket
   JWT_SECRET=tu_jwt_secret
   REDIS_HOST=localhost
   REDIS_PORT=6379
   CORS_WHITELIST=http://localhost:5173,https://some-domain.org
   ```

4. (Opcional) Crea la carpeta de almacenamiento local (si usas almacenamiento local):
   ```bash
   mkdir uploads
   ```

5. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

---

## Dependencias

A continuación, las principales librerías utilizadas:

- **`express`**: Framework para construir la API.
- **`multer`**: Para la carga de archivos (imágenes).
- **`sharp`**: Optimización y procesamiento de imágenes.
- **`@aws-sdk/client-s3`**: Para interacciones con Amazon S3.
- **`redis`**: Sistema de almacenamiento en caché para mejorar el rendimiento.
- **`jsonwebtoken`**: Para la autenticación basada en tokens JWT.
- **`dotenv`**: Para la configuración de variables de entorno.
- **`eslint` + `eslint-config-prettier`**: Para garantizar código limpio y con buenas prácticas de estilo.

---

## Configuración de CORS

El middleware **CORS** (*Cross-Origin Resource Sharing*) está configurado en el proyecto para definir qué dominios pueden interactuar con la API de ImageCraft desde diferentes orígenes. Esto es importante para garantizar la seguridad y controlar qué clientes tienen permiso para hacer solicitudes al servidor.

### ¿Qué es CORS?

CORS es un mecanismo que permite controlar el acceso de recursos hospedados en un servidor desde dominios diferentes al propio. Esto es útil cuando las aplicaciones (como frontend y backend) se encuentran hospedadas en dominios distintos.

En este proyecto, utilizamos la librería [`cors`](https://www.npmjs.com/package/cors) para gestionar las políticas de CORS.

### Configuración en el Proyecto

La configuración de CORS se encuentra en el archivo `cors.js` dentro del proyecto. A continuación se describen los aspectos relevantes:

1. **Lista blanca de dominios (whitelist):**  
   Los dominios permitidos están definidos en la variable de entorno `CORS_WHITELIST` como una lista separada por comas. Si no se especifica, por defecto, solo están permitidos `http://localhost:5173` y `http://example.com`.

2. **Opciones de CORS:**
    - Solo se permite el acceso desde orígenes presentes en la lista blanca o solicitudes sin origen (por ejemplo, herramientas como Postman o cURL).
    - Métodos permitidos: `GET`, `HEAD`, `PUT`, `PATCH`, `POST`, `DELETE`.
    - Headers permitidos: `Content-Type` y `Authorization`.
    - Se habilita el envío de credenciales (como cookies o tokens de autenticación).

3. **Manejo de errores:**  
   Las solicitudes provenientes de dominios no autorizados reciben un error con el mensaje: `"No autorizado por política de CORS"`.

4. **Autenticación de clientes:**  
   Al utilizar credenciales o tokens JWT, se requiere que el cliente configure correctamente el uso de cookies o headers personalizados.

### Ejemplo de .env

Asegúrate de configurar la variable `CORS_WHITELIST` en tu archivo `.env`. Ejemplo:
```env
CORS_WHITELIST=http://localhost:5173,https://some-domain.org
```

### Ejemplo de Respuesta a Solicitudes No Permitidas

Si un cliente realiza una solicitud desde un origen no incluido en la lista blanca, recibirá una respuesta como la siguiente:
```json
{
  "error": "No autorizado por política de CORS"
}
```

### Personalización

Puedes personalizar los dominios permitidos editando el archivo **`.env`** o directamente modificando el archivo de configuración `cors.js`.

---

## Endpoints Principales

### Autenticación
- **POST /auth/login**  
  Genera un token de acceso para el usuario.

### Gestión de Imágenes
- **POST /images/upload**  
  Permite cargar y optimizar imágenes. Compatible tanto con almacenamiento local como en la nube.
- **GET /images/:id**  
  Recupera una imagen almacenada.
- **GET /images**  
  Lista todas las imágenes almacenadas, ya sea localmente o en Amazon S3.
- **DELETE /images/:id**  
  Elimina una imagen del repositorio.

---

## Almacenamiento

ImageCraft permite configurar dónde se almacenarán las imágenes:

1. **Almacenamiento en la Nube**:  
   Las imágenes se almacenan en un bucket de Amazon S3 (necesitarás configurar tus credenciales en `.env`).

2. **Almacenamiento Local**:  
   Las imágenes se guardan localmente en una carpeta especificada (la ruta se define en la variable `LOCAL_UPLOAD_FOLDER`).

Configura el tipo de almacenamiento cambiando el valor de la variable `STORAGE_TYPE` en tu archivo `.env`:
- **`local`**: Para almacenamiento local.
- **`s3`**: Para almacenamiento en la nube (Amazon S3).

---

## Scripts Disponibles

| Comando               | Descripción                              |
|-----------------------|------------------------------------------|
| `npm start`           | Inicia el servidor en producción.        |
| `npm run dev`         | Ejecuta el servidor en modo desarrollo.  |
| `npm run lint`        | Valida y corrige errores de estilo.      |
| `npm run build`       | Genera un build para producción.         |

---

## Cómo Contribuir

1. Haz un fork del repositorio.
2. Crea una nueva rama para tus cambios:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus cambios y confirma los commits:
   ```bash
   git commit -m "Agrega nueva funcionalidad"
   ```
4. Sube tus cambios a tu fork:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. Abre un Pull Request (PR) hacia la rama principal.

---

## Licencia

**ImageCraft** está licenciado bajo la [MIT License](LICENSE). Siéntete libre de usar, modificar y distribuir esta aplicación según los términos de la licencia.

---
