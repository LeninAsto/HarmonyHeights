# Publicar en GitHub Pages

El sitio utiliza HTML, CSS y JavaScript sin un framework de compilación. No necesita `npm install` ni `npm run build`. El trabajo `build` prepara los archivos y el trabajo `deploy` los publica.

## Activación inicial

1. Sube todos los cambios del proyecto al repositorio `LeninAsto/HarmonyHeights`, en la rama `main`, incluido `.github/workflows/pages.yml`.
2. En GitHub, abre el repositorio → Settings → Pages.
3. En Build and deployment → Source, selecciona **GitHub Actions**.
4. Abre Actions → Publicar Harmony Heights → Run workflow y selecciona `main`. Esto permite ejecutar de nuevo la publicación si el primer push ocurrió antes de habilitar Pages.
5. Espera a que terminen `build` y `deploy`. El trabajo de despliegue mostrará la URL confirmada.

Con el nombre actual del repositorio y sin un dominio personalizado, la dirección esperada es:

https://leninasto.github.io/HarmonyHeights/

Cada nuevo push a `main` volverá a publicar el sitio. También puedes ejecutar el flujo manualmente desde Actions. Esta preparación local no activa la opción Pages en GitHub ni confirma un despliegue.

## Qué publica el flujo

El flujo copia `docs` a `_site`, excluye la carpeta `backend` y sube el resultado como artefacto de Pages. Publica las páginas, estilos, scripts, audio, capturas y documentación de `docs`. El PHP permanece en el repositorio como alternativa académica, pero no se distribuye con el sitio.

Las rutas actuales son relativas, por ejemplo `css/styles.css` y `js/firebase.js`, por lo que funcionan bajo `/HarmonyHeights/`. Mantén ese formato al añadir páginas y recursos; una ruta como `/css/styles.css` apuntaría a la raíz del dominio y omitiría el nombre del repositorio.

## Firebase en la dirección pública

1. En Firebase Authentication → Configuración → Dominios autorizados, añade `leninasto.github.io`. Introduce solo el dominio, sin `https://` ni `/HarmonyHeights/`.
2. Completa la creación de Firestore, habilita Anónimo y Correo/contraseña, publica las reglas y autoriza tu UID según [FIREBASE.md](FIREBASE.md).
3. Mantén `storageMode = "firebase"` en `js/firebase-config.js`.
4. Desde la web publicada, envía una solicitud ficticia y comprueba el documento en Firestore.
5. Ingresa en `https://leninasto.github.io/HarmonyHeights/registros.html` con la cuenta autorizada y prueba la tabla y el CSV.

La web se aloja en GitHub Pages y la base de datos en Firebase. No necesitas Firebase Hosting para este flujo. La configuración web de Firebase es pública por diseño; las reglas controlan quién puede leer y guardar datos. No subas contraseñas ni claves de cuentas de servicio al repositorio.

Publicar con GitHub Actions no publica las reglas de Firestore. Si cambias `firestore.rules`, debes aplicarlas también en Firebase. La página de acceso administrativo es pública, mientras que los registros requieren autenticación y permiso en Firestore.

## Si falla

| Síntoma | Revisar |
| --- | --- |
| Falla Configurar Pages | Settings → Pages → Source → GitHub Actions. |
| No se ejecuta al subir cambios | Rama `main`, archivo del workflow subido y Actions habilitado. |
| El despliegue espera aprobación | Reglas del entorno `github-pages` del repositorio. |
| Página sin estilos | Respetar mayúsculas/minúsculas y rutas relativas al repositorio. |
| Error al enviar formulario | Servicios de Firebase, reglas y mensaje mostrado por el formulario. |
| Cambios en reglas sin efecto | Publicar las reglas en Firebase; el workflow solo publica archivos web. |

## Referencias

- [Flujos oficiales de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Configuración de claves de Firebase](https://firebase.google.com/docs/projects/api-keys).
