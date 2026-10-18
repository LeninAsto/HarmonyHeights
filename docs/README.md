# Harmony Heights

Sitio de música y artes escénicas con seis páginas públicas y un panel privado de solicitudes.

## Ejecutar

Desde la raíz: `python -m http.server 8000 --directory docs`.

Abre http://localhost:8000. Firebase utiliza módulos JavaScript: usa un servidor HTTP en lugar de abrir el HTML con doble clic.

## Firebase

Para publicar, consulta [GitHub Pages](GITHUB_PAGES.md). El sitio se publica con GitHub Actions y utiliza Firebase para el formulario.

La configuración pública ya está incorporada. Sigue [FIREBASE.md](FIREBASE.md) para activar Firestore, Authentication y tu administrador.

El formulario guarda solicitudes en Firestore. El panel `registros.html` permite consultar las 500 más recientes, buscar, filtrar y exportar CSV para Excel o Google Sheets. No hay sincronización automática con Google Sheets.

Si un envío falla, conserva los campos y muestra el error. Solo las preferencias de accesibilidad se guardan en localStorage.

## Código organizado

| Archivo | Función |
| --- | --- |
| `js/script.js` | Navegación, año, programa desde la URL y filtros. |
| `js/accesibilidad.js` | Preferencias, volver arriba y reproductor. |
| `js/formulario.js` | Validación, envío y mensajes. |
| `js/firebase-config.js` | Configuración pública y proveedor. |
| `js/firebase.js` | Conexión y guardado. |
| `js/registros.js` | Acceso privado, tabla y exportación. |
| `css/styles.css` | Diseño responsive y contraste. |

Los controles se encuentran en el HTML y JavaScript les da comportamiento. La melodía del proyecto nunca se reproduce automáticamente.

Se conserva PHP como alternativa para demostrar POST. Consulta [backend/README.md](backend/README.md), [INFORME_TECNICO.md](INFORME_TECNICO.md) y [GUIA_EXPOSICION.md](GUIA_EXPOSICION.md).
