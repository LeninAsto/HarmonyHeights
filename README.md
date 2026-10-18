# Harmony Heights

Proyecto académico de música y artes escénicas con seis páginas públicas, formulario Firebase y panel privado de registros.

## Abrir localmente

Desde la raíz del proyecto:

```powershell
python -m http.server 8000
```

- Web: http://localhost:8000/docs/
- Presentación: http://localhost:8000/trabajo%20final/presentacion.html

Usa el servidor HTTP para que funcionen los módulos JavaScript de Firebase.

## Publicar en GitHub Pages

El workflow `.github/workflows/pages.yml` se ejecuta con cada push a `main`. Prepara `docs` y la presentación HTML; no requiere npm ni un framework de compilación.

En GitHub, selecciona una vez **Settings → Pages → Source → GitHub Actions**. Después del despliegue:

- Web: https://leninasto.github.io/HarmonyHeights/
- Exposición: https://leninasto.github.io/HarmonyHeights/presentacion.html

El trabajo `deploy` muestra la dirección confirmada. La presentación incluye una diapositiva con la web pública incrustada y un enlace para abrirla en otra pestaña.

## Firebase

Sigue [la configuración de Firebase](docs/FIREBASE.md) para activar Firestore, los métodos de acceso y tu administrador. Autoriza `leninasto.github.io` en Authentication. Publicar la web no publica las reglas: aplícalas también en Firebase cuando cambien.

El formulario utiliza Firebase exclusivamente. El panel `registros.html` permite consultar las 500 solicitudes más recientes, buscar, filtrar y exportar CSV para Excel o Google Sheets. No hay sincronización automática con hojas de cálculo.

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
| `firestore.rules` | Validación y permisos de datos. |

Los PDF y la presentación original permanecen en `trabajo final`. El [informe técnico](docs/INFORME_TECNICO.md) y las capturas de `docs/evidencias` sirven para la entrega académica.

El reproductor permanece oculto hasta pulsar el botón de música. En móvil, Solicitar información permanece encima de las herramientas flotantes. El enlace a la presentación está al final del pie de página.
