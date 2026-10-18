# Backend PHP alternativo

El modo principal utiliza Firebase. Este endpoint se conserva para demostrar un envío POST y validación en el servidor.

Cambia `storageMode` a `"php"` en `../js/firebase-config.js`, instala PHP 8 con mbstring y ejecuta `php -S localhost:8000` desde docs.

El servidor valida los campos y guarda cada solicitud como una línea JSON en `data/solicitudes.jsonl`. No guarda copias en el navegador.

El panel `registros.html` consulta exclusivamente Firebase; no lee los archivos de PHP.

El archivo `.htaccess` restringe la carpeta de datos en Apache. El servidor de desarrollo PHP no aplica ese archivo: úsalo localmente con datos ficticios. Este almacenamiento no está preparado como backend de producción.
