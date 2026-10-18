# Datos que guarda el formulario en Firebase

El formulario, la función y el panel ya utilizan los mismos nombres de campos.
No debes crear tablas ni columnas manualmente. Firestore creará la colección
`solicitudes` y sus documentos cuando se guarde la primera solicitud válida.

## 1. Preparar la base de datos

Abre [Firestore del proyecto](https://console.firebase.google.com/project/harmony-heights-41e77/firestore).

- Si aparece **Crear base de datos**, crea una base Cloud Firestore Standard con
  identificador **`(default)`**, elige su región y selecciona modo producción.
- Si ya hay una base `(default)`, utiliza esa misma. No hace falta crear otra.
- Despliega las reglas incluidas en el proyecto y la función según el apartado 3.
  No abras las reglas a todo el mundo para intentar que funcione el formulario.

## 2. Estructura de cada solicitud

Ubicación: `solicitudes/{identificador automático}`.

| Campo | Tipo Firestore | Procedencia y validación |
| --- | --- | --- |
| `nombre` | string | Nombre completo, entre 3 y 80 caracteres. |
| `correo` | string | Correo de contacto válido, hasta 120 caracteres. |
| `telefono` | string | Teléfono, entre 7 y 20 caracteres. Conservar como texto para admitir `+51`. |
| `edad` | number (entero) | Edad del estudiante, de 5 a 99. |
| `programa` | string | `musica`, `danza`, `escena` u `orientacion`. |
| `dia` | string | `lunes`, `martes`, `miercoles`, `jueves`, `viernes` o `sabado`. |
| `horario` | string | `09:00-10:30`, `11:00-12:30`, `15:00-16:30` o `17:00-18:30`. Sábados solo mañana. |
| `mensaje` | string | Objetivo opcional, hasta 500 caracteres; puede estar vacío. |
| `consentimiento` | string | `acepto`. |
| `uid` | string | Lo añade la función desde la sesión de Google verificada. |
| `createdAt` | timestamp | Fecha y hora que añade el servidor; no escribir una fecha como texto. |

El identificador del documento es automático y se muestra como código de
registro al confirmar el envío. El panel lo obtiene del documento; no hace falta
añadir otro campo `id`. El correo de contacto puede ser distinto al de Google;
la identidad autenticada se vincula mediante `uid`.

No guardamos en el documento contraseñas, la clave secreta ni tokens de Turnstile.
La verificación se procesa antes de guardar los datos.

## 3. Activar el guardado real

La web de GitHub Pages necesita el backend desplegado. Crear la colección a mano
no sustituye ese paso. Sigue [FIREBASE.md](FIREBASE.md) para habilitar Google,
autorizar dominios y configurar Turnstile.

Con Node.js 22 y Firebase CLI instalados, ejecuta desde la carpeta del proyecto:

```sh
npm --prefix functions ci
firebase login
firebase functions:secrets:set TURNSTILE_SECRET_KEY --project harmony-heights-41e77
firebase deploy --only functions:submitRegistration,firestore:rules --project harmony-heights-41e77
```

Introduce la nueva clave secreta únicamente en la petición segura de Firebase CLI.
Regenera primero la que apareció en la captura. No la copies al código ni al chat.
Cloud Functions requiere el plan Blaze. El despliegue debe terminar correctamente
y mostrar la función `submitRegistration` en la consola del proyecto.

## 4. Verificar el resultado

1. Abre la página pública de contacto e inicia sesión con Google.
2. Completa una solicitud con datos ficticios, elige día y horario, acepta el
   consentimiento y completa Turnstile.
3. Envía una sola vez y espera el mensaje de confirmación con el código.
4. En Firestore → Datos → `solicitudes`, comprueba el documento correspondiente.
5. Para verlo en `registros.html`, autoriza tu cuenta administrativa como indica
   [FIREBASE.md](FIREBASE.md#5-autorizar-un-administrador).

Si la función no aparece, el envío devuelve un error o no se crea el documento,
conserva el texto exacto del error para diagnosticarlo. No hace falta introducir
registros personales manualmente ni cambiar los nombres de los campos.
