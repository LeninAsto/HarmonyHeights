# Harmony Heights

Proyecto académico de música y artes escénicas con seis páginas públicas, formulario con Google y Cloudflare Turnstile y panel privado de registros.

## Abrir localmente

Desde la raíz del proyecto:

```powershell
python -m http.server 8000
```

- Web: http://localhost:8000/docs/
- Presentación: http://localhost:8000/docs/presentacion.html

Usa el servidor HTTP para que funcionen los módulos JavaScript de Firebase.

## Publicar en GitHub Pages

El workflow `.github/workflows/pages.yml` se ejecuta con cada push a `main`. Prepara `docs`, incluida la presentación HTML; no requiere npm ni un framework de compilación.

En GitHub, selecciona una vez **Settings → Pages → Source → GitHub Actions**. Después del despliegue:

- Web: https://leninasto.github.io/HarmonyHeights/
- Exposición: https://leninasto.github.io/HarmonyHeights/presentacion.html

El trabajo `deploy` muestra la dirección confirmada. La presentación incluye una diapositiva con la web pública incrustada y un enlace para abrirla en otra pestaña.

## Firebase

Sigue [la configuración de Firebase](docs/FIREBASE.md) para activar Firestore, los métodos de acceso y tu administrador. Autoriza `leninasto.github.io` en Authentication. Publicar la web no publica las reglas: aplícalas también en Firebase cuando cambien.

El formulario guarda las solicitudes en Firebase mediante una función que verifica Turnstile. El panel `registros.html` permite consultar las 500 solicitudes más recientes, buscar, filtrar y exportar CSV para Excel o Google Sheets. No hay sincronización automática con hojas de cálculo.

## Música

Las cuatro pistas de `docs/audio` se comparten entre la web y la presentación. El reproductor intenta iniciar al 12 %; si el navegador bloquea el audio automático, espera la primera interacción o el botón Reproducir. Permite pausar, cambiar de pista, ajustar el volumen y abrirse desde el botón de música. Conserva los ajustes y la posición durante la sesión; al navegar reanuda cuando el navegador lo permite. La web incrustada no inicia un segundo reproductor.

## Archivos principales

| Archivo | Función |
| --- | --- |
| `docs/js/script.js` | Navegación, año y filtros. |
| `docs/js/accesibilidad.js` | Preferencias y volver arriba. |
| `docs/js/reproductor.js` | Lista de música y controles. |
| `docs/js/formulario.js` | Validación y envío. |
| `docs/js/firebase.js` | Conexión y guardado. |
| `docs/js/firebase-config.js` | Configuración pública de Firebase. |
| `docs/js/registros.js` | Acceso privado, tabla y CSV. |
| `docs/js/turnstile.js` | Widget, vencimiento y reintentos. |
| `functions/registration.js` | Validación de datos y Turnstile en el servidor. |
| `firestore.rules` | Lectura administrativa y bloqueo de escrituras directas. |

Los PDF permanecen en `trabajo final`; la presentación está en `docs/presentacion.html`. El [informe técnico](docs/INFORME_TECNICO.md) y las capturas de `docs/evidencias` sirven para la entrega académica.

El reproductor permanece oculto hasta pulsar el botón de música. En móvil, Solicitar información permanece encima de las herramientas flotantes. El enlace a la presentación está al final del pie de página.

## Contacto y tema visual

El formulario permite elegir día y franja horaria (hora de Lima), exige acceso
con Google y utiliza Cloudflare Turnstile con validación en una Cloud Function. Para activar
estas integraciones, sigue la sección correspondiente de `docs/FIREBASE.md`:
requieren activar Google, guardar la clave secreta en Firebase y desplegar la función y las reglas. La clave pública del widget ya está conectada.

El botón de tema cambia entre claro y oscuro en el sitio y la presentación.
Respeta la preferencia del sistema hasta que el usuario elige un tema y guarda
su elección localmente. La presentación incluye idea, un collage de seis maquetas ampliables e
implementación, además de una demostración del sitio local.

## Entrega y backend

Empieza por [LEEME-ENTREGA.md](LEEME-ENTREGA.md). El ZIP contiene el código de la
web, el servidor, las reglas y las instrucciones; las claves secretas se
configuran por separado. El frontend se publica en GitHub Pages y el servidor
en Firebase Cloud Functions (plan Blaze). Una página estática no puede validar
por sí sola el token de Turnstile de forma segura.

Para instalar y probar el backend con Node.js 22:

```sh
npm --prefix functions ci
npm --prefix functions test
```

## Detalles de programas y presentación

En Programas, **Ver detalles** abre una ventana con el contenido del programa.
En móvil se convierte en un panel inferior: arrastra su barra hacia abajo para
cerrarlo, o utiliza el botón de cierre. También admite Escape y cierre desde el
fondo. Al salir, conserva el filtro seleccionado y devuelve el foco a la tarjeta.

La presentación tiene 17 diapositivas, con objetivos previos y el proceso de
publicación y verificación en GitHub. La maquetación muestra las seis imágenes
originales en un collage: al pulsarlas, un visor enseña la imagen completa,
permite recorrer las demás y abrir el archivo original.
