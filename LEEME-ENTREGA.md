# Harmony Heights — entrega con Cloudflare Turnstile

Incluye días y horarios dependientes, acceso con Google, widget Turnstile,
validación de servidor, panel de registros, tema claro/oscuro y presentación
con idea, maquetación e implementación (15 diapositivas).

## Lo que debes completar para recibir formularios

1. Regenera la clave secreta que se compartió en la captura de Cloudflare.
2. Autoriza tus dominios en el widget Turnstile y en Firebase Authentication.
3. Activa Google en Firebase Authentication.
4. Habilita Firestore y el plan Blaze para desplegar Cloud Functions.
5. Sigue [docs/FIREBASE.md](docs/FIREBASE.md) para guardar la nueva clave en
   Secret Manager y desplegar `submitRegistration` junto con `firestore.rules`.
6. Publica la carpeta `docs` en GitHub Pages y realiza la prueba real del envío.

La clave pública del widget ya está incluida. La clave secreta no se incluye en
el código ni en el ZIP. Las credenciales y la configuración de tu cuenta se
hacen por separado; esta entrega no despliega ni publica por sí sola.

Consulta también [el esquema de datos de Firestore](docs/DATOS_FIRESTORE.md) para ver qué se guarda y cómo comprobar la primera solicitud.

## Probar visualmente

Desde la raíz del proyecto:

```sh
python3 -m http.server 8000
```

Abre `http://localhost:8000/docs/` para la web y
`http://localhost:8000/docs/presentacion.html` para las diapositivas.
Google, Turnstile y el envío necesitan acceso a sus servicios externos.

## Instalar y probar el backend

Con Node.js 22:

```sh
npm --prefix functions ci
npm --prefix functions test
```

Se incluyen tests de validación y de la comprobación de Cloudflare con servicios
simulados. El envío real debe comprobarse tras desplegar en tu proyecto.

## Archivos relevantes

- `docs/contacto.html`: formulario y widget.
- `docs/js/turnstile.js`: carga, expiración, errores y reinicio del widget.
- `docs/js/firebase-config.js`: configuración pública y clave pública Turnstile.
- `functions/index.js`: Cloud Function y enlace al secreto.
- `functions/registration.js`: validación de Google, datos y token en Siteverify.
- `firestore.rules`: lectura administrativa y bloqueo de escritura directa.
- `docs/FIREBASE.md`: instrucciones completas de configuración y despliegue.

Para subirlo a GitHub, publica estos archivos conservando las carpetas y el
workflow `.github/workflows/pages.yml`. Excluye `node_modules`, archivos `.env`,
secretos y el ZIP. El workflow publica la web; el backend se despliega por separado.
