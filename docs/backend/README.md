# Backend mínimo

`registro.php` recibe el formulario mediante `POST`, vuelve a validar los datos y guarda cada solicitud como una línea JSON en `data/solicitudes.jsonl`.

## Probar localmente

Requiere PHP 8 o superior. Desde la carpeta `docs`:

```bash
php -S localhost:8000
```

Luego abre `http://localhost:8000/contacto.html`. El archivo JSON se crea al recibir el primer registro.

Si se abre el sitio sin PHP (por ejemplo, GitHub Pages), JavaScript activa un modo de demostración y guarda un máximo de diez registros en `localStorage`, solo dentro del navegador. Ese modo no equivale a un envío real.

## Seguridad básica aplicada

- Solo se acepta el método `POST`.
- Se validan tipo, longitud y valores permitidos en el servidor.
- Hay un campo invisible tipo *honeypot* para bots simples.
- Se usa `LOCK_EX` para evitar escrituras simultáneas incompletas.
- `.htaccess` bloquea el acceso web al directorio de datos en Apache.

Para producción se debe usar una base de datos, HTTPS, protección CSRF, límite de solicitudes y una política de privacidad real.
