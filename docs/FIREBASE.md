# Google, Firestore y Cloudflare Turnstile

La web usa la configuración pública de Firebase de `harmony-heights-41e77`.
El formulario necesita una sesión de Google y una verificación Turnstile válida.
Los registros se crean en una Cloud Function; el navegador solo puede leer el
panel cuando su usuario figura en `admins`.

## 1. Configurar Firebase

1. En Firebase Console, abre el proyecto `harmony-heights-41e77`.
2. Crea Cloud Firestore Standard con identificador `(default)` en modo producción.
3. En Authentication → Métodos de acceso, habilita **Google** y elige el correo de
   soporte. Correo/contraseña es opcional para administradores.
4. En Authentication → Configuración → Dominios autorizados, añade `localhost`
   y `leninasto.github.io`. Añade cualquier nuevo dominio donde alojes la web.
5. Las Cloud Functions requieren un proyecto con plan **Blaze** y facturación
   habilitada. Revisa sus cuotas y configura alertas de presupuesto.

## 2. Configurar el widget Cloudflare

1. En Cloudflare → Turnstile, abre el widget y selecciona el modo **Managed**.
2. Autoriza `leninasto.github.io`, `localhost` y `127.0.0.1` si usas esa dirección
   para desarrollo. Los dominios se introducen sin esquema, puerto ni ruta.
3. La clave pública ya está conectada en `docs/js/firebase-config.js` mediante
   `turnstileSiteKey`. Cambia ese valor si creas otro widget.
4. **Regenera la clave secreta que apareció en la captura compartida.** No la
   escribas en HTML, JavaScript, GitHub, un ZIP ni en el chat.
5. Guarda la nueva clave secreta en Firebase Secret Manager con el comando de
   despliegue del siguiente apartado. El comando la solicita de forma segura.

El widget usa la acción `contacto`. La función verifica con Cloudflare el token,
la acción y el dominio. Los tokens vencen a los cinco minutos y son de un solo
uso; la web reinicia el widget después de cada intento de envío al servidor.
El CAPTCHA puede resolverse sin mostrar un desafío visual, según Cloudflare.

## 3. Instalar y desplegar el servidor

En tu equipo, instala Node.js **22** y Firebase CLI, y ejecuta desde la raíz:

```sh
npm --prefix functions ci
npm --prefix functions test
npm install -g firebase-tools
firebase login
firebase functions:secrets:set TURNSTILE_SECRET_KEY --project harmony-heights-41e77
firebase deploy --only functions:submitRegistration,firestore:rules --project harmony-heights-41e77
```

La función se llama `submitRegistration` y se despliega en `us-central1`.
`docs/js/firebase-config.js` contiene la misma región. Firebase CLI ejecuta los
tests antes del despliegue. Si la consola pide habilitar APIs necesarias,
completa ese paso en tu cuenta.

`TURNSTILE_HOSTNAMES` es un parámetro no secreto de la función, con valor inicial
`leninasto.github.io,localhost,127.0.0.1`. Para añadir un dominio, actualiza ese
parámetro, la lista `cors` de `functions/index.js`, los dominios autorizados de
Authentication y los dominios del widget. Vuelve a desplegar después.

Si configuraste el cumplimiento obligatorio de Firebase App Check siguiendo la
versión anterior de este proyecto, desactívalo para **Cloud Firestore**: el panel
actual usa Google y reglas de lectura; el formulario usa Turnstile en la función.
El despliegue de esta versión no modifica ese ajuste de la consola.

Publica también `firestore.rules`: las escrituras directas del cliente quedan
prohibidas para que no se pueda omitir Turnstile. El Admin SDK de la función
escribe únicamente tras validar sesión, campos, día, horario y verificación.
No publiques solo el frontend: necesita esta función y estas reglas.

## 4. Publicar la web y la presentación

El workflow `.github/workflows/pages.yml` publica `docs` al subir los cambios a
`main`. Selecciona GitHub → Settings → Pages → Source → **GitHub Actions**.
El despliegue de Pages es independiente del despliegue de Firebase anterior.

Para servir la web localmente:

```sh
python3 -m http.server 8000
```

Abre `/docs/`, `/docs/contacto.html` y `/docs/presentacion.html` en ese servidor.
Los módulos requieren HTTP. Google, Cloudflare y la función necesitan conexión.

## 5. Autorizar un administrador

1. Entra con Google en contacto para que Firebase cree tu usuario, o crea una
   cuenta de correo/contraseña en Firebase Authentication.
2. Copia el UID en Authentication → Usuarios.
3. Crea manualmente el documento `admins/UID` en Firestore con un campo `nombre`.
4. Entra en `registros.html` con esa cuenta. Las cuentas sin ese documento no
   pueden leer las solicitudes; iniciar sesión con Google no concede ese permiso.

El panel consulta hasta 500 solicitudes recientes, busca, filtra y exporta CSV.
Los datos anteriores con horarios generales siguen siendo legibles.

## 6. Comprobación final en tu proyecto

1. En contacto, accede con Google y completa datos ficticios, programa, día,
   horario y consentimiento.
2. Completa el widget y envía una sola vez. Debe aparecer el código de registro.
3. Comprueba el documento en Firestore → `solicitudes` y en el panel autorizado.
4. Comprueba que solicitudes sin sesión, sin token o con token inválido no se
   guardan. Las escrituras directas a Firestore deben rechazarse.
5. Prueba el cierre de sesión, el cambio de tema, la expiración del widget y la
   exportación CSV. Nunca publiques tokens de depuración ni secretos.

Los 35 tests locales comprueban la validación y el flujo del servidor usando
respuestas de Cloudflare y almacenamiento simulados. No sustituyen esta prueba
contra tu Firebase y tu widget desplegados.

## Horarios y límites

Se ofrecen franjas de 90 minutos: lunes a viernes 09:00–10:30, 11:00–12:30,
15:00–16:30 y 17:00–18:30; sábados las dos franjas de mañana; domingos sin atención.
Son preferencias sujetas a confirmación, no reservas ni disponibilidad en tiempo
real. Mantén `docs/js/horarios.js` y `functions/registration.js` coordinados al
modificarlas.

Turnstile y Google reducen envíos automatizados, pero no garantizan eliminar el
spam ni reemplazan cuotas, alertas y seguimiento de abuso. Define también la
política de privacidad y conservación de datos de la academia.

## Referencias

- [Turnstile en el cliente](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Verificación obligatoria en el servidor](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Secretos de Firebase Functions](https://firebase.google.com/docs/functions/config-env#secret_parameters)
- [Acceso con Google](https://firebase.google.com/docs/auth/web/google-signin)
