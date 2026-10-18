# Activar Firebase paso a paso

La web tiene incorporada la configuración pública de `harmony-heights-41e77`. Aún debes habilitar los servicios y publicar las reglas desde tu cuenta. Tener la configuración no activa la base de datos.

## 1. Crear Firestore

1. Abre https://console.firebase.google.com/project/harmony-heights-41e77/overview.
2. En Compilación → Firestore Database, crea una base de datos Cloud Firestore Standard con identificador `(default)`.
3. Elige la región adecuada y empieza en modo de producción.
4. Abre la pestaña Reglas, sustituye su contenido por el archivo `firestore.rules` de la raíz de este proyecto y pulsa Publicar.

Las reglas permiten crear solicitudes con campos y valores válidos a usuarios autenticados. Los visitantes usarán una sesión anónima. Solo las cuentas autorizadas en `admins` pueden leer solicitudes. El navegador no puede crear administradores, modificar registros ni eliminarlos.

## 2. Habilitar Authentication

1. En Compilación → Authentication, pulsa Comenzar.
2. En Método de acceso, habilita Anónimo.
3. Habilita Correo electrónico/contraseña. No necesitas el acceso mediante enlace de correo.
4. Revisa Configuración → Dominios autorizados. Añade `localhost` para las pruebas y el dominio que utilices al publicar.

## 3. Autorizar tu cuenta administrativa

1. En Authentication → Usuarios → Añadir usuario, crea tu cuenta con tu correo y una contraseña propia. No compartas la contraseña por chat ni la pongas en el código.
2. Copia el UID de ese usuario.
3. Ve a Firestore Database → Datos → Iniciar colección.
4. Nombre de colección: `admins`. ID del documento: el UID exacto que copiaste.
5. Añade un campo `nombre`, de tipo string, con tu nombre, y guarda el documento.

La existencia de ese documento concede permiso de lectura. Un usuario registrado sin ese documento no puede consultar las solicitudes. Crea este permiso únicamente para personas autorizadas.

## 4. Probar el recorrido

1. Ejecuta `python -m http.server 8000 --directory docs` desde la raíz del proyecto.
2. Abre http://localhost:8000/contacto.html.
3. Completa una solicitud con datos ficticios, acepta el consentimiento y envía una sola vez.
4. Espera el mensaje de éxito y el código del registro. Si falla, revisa el mensaje y conserva los datos para reintentar.
5. Comprueba el documento en Firestore → Datos → `solicitudes`.
6. Abre http://localhost:8000/registros.html e ingresa con tu cuenta autorizada.
7. Busca, filtra y pulsa Exportar CSV. Si Excel no separa las columnas, usa Datos → Desde texto/CSV y selecciona UTF-8 y coma.
8. En Google Sheets, usa Archivo → Importar → Subir y selecciona el CSV.
9. Cierra sesión al terminar.

## Errores frecuentes

| Mensaje o síntoma | Qué revisar |
| --- | --- |
| Acceso anónimo no habilitado | Authentication → Método de acceso → Anónimo. |
| Firebase rechazó el envío | Reglas publicadas en la base `(default)`, campos y valores válidos. |
| No se pudo iniciar sesión | Cuenta creada, contraseña correcta y proveedor Correo/contraseña habilitado. |
| Cuenta sin permiso | Documento `admins/UID` con el UID exacto del usuario. |
| La página no funciona al abrir el HTML | Usar un servidor HTTP; no abrir con `file://`. |
| El panel no tiene registros | Revisar filtros y confirmar que se envió a este mismo proyecto Firebase. |

## Configuración y límites

El objeto `firebaseConfig` es público por diseño; los permisos los controlan Authentication y las reglas. Nunca agregues una clave privada o un archivo de cuenta de servicio al frontend.

Las sesiones de acceso se conservan durante la sesión del navegador. El panel carga como máximo los 500 registros más recientes y exporta los resultados filtrados, con fecha de Lima y protección contra fórmulas en campos de texto. No modifica registros ni crea hojas de cálculo automáticamente.

Antes de abrir el formulario al público, configura Firebase App Check, revisa cuotas y alertas de uso y establece una política de privacidad y conservación de datos. La autenticación anónima y las reglas validan acceso y datos, pero no equivalen a un límite de envíos ni impiden por sí solas el spam.

El backend PHP es una alternativa independiente: para usarlo cambia `storageMode` a `"php"`. Los errores de Firebase nunca cambian automáticamente de proveedor ni guardan copias locales.

## Referencias oficiales

- [Registrar una aplicación web](https://firebase.google.com/docs/web/setup).
- [Authentication](https://firebase.google.com/docs/auth/web/start).
- [Reglas de Cloud Firestore](https://firebase.google.com/docs/firestore/security/get-started).
- [App Check](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider).
