```
  _____                              ___           __ _   
  \_   \_ __ ___   __ _  __ _  ___  / __\ __ __ _ / _| |_ 
   / /\/ '_ ` _ \ / _` |/ _` |/ _ \/ / | '__/ _` | |_| __|
/\/ /_ | | | | | | (_| | (_| |  __/ /__| | | (_| |  _| |_ 
\____/ |_| |_| |_|\__,_|\__, |\___\____/_|  \__,_|_|  \__|
                        |___/                             
```
# ImageCraft

**ImageCraft** es una aplicación diseñada para la manipulación y almacenamiento eficiente de imágenes, combinando funcionalidad avanzada con un diseño centrado en el rendimiento y escalabilidad. Se ofrecen características robustas como carga, edición, optimización y almacenamiento de imágenes en múltiples plataformas.

---

## Características

- **Carga eficiente de imágenes**: Soporta múltiples formatos de imagen (JPEG, PNG, etc.) utilizando `multer` para la carga de archivos.
- **Optimización de imágenes**: Reducción de tamaño y conversión a formato `.webp` con la librería `sharp`.
- **Almacenamiento múltiple**:
    - **En la nube**: Utiliza Amazon S3 con `@aws-sdk/client-s3` y `@aws-sdk/lib-storage` para un almacenamiento seguro.
    - **Almacenamiento local**: Permite guardar las imágenes directamente en el servidor.
- **JWT-based Authentication**: Garantiza la seguridad de la API con tokens JWT.
- **Gestión de permisos**: Implementa controles para acceso seguro entre administradores y usuarios.
- **Configuración personalizable**: Configuración centralizada mediante el uso de variables de entorno con `dotenv`.

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

A continuación, algunas de las principales librerías utilizadas:

- **`express`**: Framework para la creación del API.
- **`multer`**: Para la carga de archivos (imágenes).
- **`sharp`**: Para la optimización y procesamiento de imágenes.
- **`@aws-sdk/client-s3`**: Para trabajar con Amazon S3.
- **`redis`**: Sistema de almacenamiento en caché para mejorar el rendimiento.
- **`jsonwebtoken`**: Para usar tokens JWT como método de autenticación.
- **`dotenv`**: Para configurar variables de entorno.
- **`eslint` + `eslint-config-prettier`**: Para mantener un código limpio y con buenas prácticas.

---

## Configuración de CORS

El middleware **CORS** (*Cross-Origin Resource Sharing*) define qué dominios pueden interactuar con la API desde diferentes orígenes. En este proyecto, se usa la librería [`cors`](https://www.npmjs.com/package/cors).

### Configuración básica:
1. **Lista blanca (whitelist):**  
   Los dominios permitidos se definen en `CORS_WHITELIST` del archivo `.env`. Si no se configura, los valores por defecto son `http://localhost:5173` y `http://example.com`.

2. **Opciones principales:**
    - Métodos permitidos: `GET`, `HEAD`, `PUT`, `PATCH`, `POST`, `DELETE`.
    - Headers permitidos: `Content-Type`, `Authorization`.
    - Envío de credenciales habilitado para soportar cookies/tokens en solicitudes.

3. **Respuesta de Error:**  
   Solicitudes desde dominios no autorizados retornarán:
   ```json
   {
     "error": "No autorizado por política de CORS"
   }
   ```

### Personalización en `.env`:
```env
CORS_WHITELIST=http://localhost:5173,https://some-domain.org
```

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

## Parámetros para Servir Imágenes

El servicio procesa dinámicamente las imágenes solicitadas, permitiendo ajustar su tamaño, calidad y método de ajuste (*fit*) al momento de servirlas.

### Parámetros Disponibles:

1. **width (ancho):** Define el ancho de la imagen en píxeles.
2. **height (alto):** Define el alto de la imagen en píxeles.
3. **fit (ajuste):** Controla cómo ajustar la imagen:
    - `cover` (por defecto): Recorta para llenar el espacio.
    - `contain`: Ajusta la imagen sin recortarla.
    - `fill`: Rellena el espacio aunque haya distorsión.
    - `inside`: Encaja dentro de las dimensiones sin desbordar.
    - `outside`: Puede salir del espacio, pero conserva proporción.
4. **quality (calidad):** Calidad para imágenes `.webp` (1-100, por defecto **80**).

### Ejemplo de Uso:
Solicitud con parámetros:
```http
GET /images/example-image.webp?width=400&height=300&fit=contain&quality=70
```

### Comportamiento por Omisión:
- **width/height:** Si no se incluyen, no se aplica redimensionado.
- **fit:** Valor por defecto: `cover`.
- **quality:** Valor por defecto: `80`.

---

## Almacenamiento

### Opciones Disponibles:

1. **Almacenamiento en la Nube**:  
   Las imágenes se alojarán en Amazon S3 (necesita configuración en `.env`).

2. **Almacenamiento Local**:  
   Las imágenes se guardan en una carpeta local definida por `LOCAL_UPLOAD_FOLDER`.

Para configurar el tipo de almacenamiento, ajusta la variable en `.env`:
- `STORAGE_TYPE=local` para almacenamiento local.
- `STORAGE_TYPE=s3` para usar Amazon S3.

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
5. Abre un Pull Request hacia la rama principal.

---

## Licencia

**ImageCraft** está licenciado bajo la [MIT License](LICENSE). Puedes usar, modificar y distribuir esta aplicación según los términos de la licencia.

---

**GitHub**: [Repositorio Oficial](https://github.com/tuusuario/imagecraft)