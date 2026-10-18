# Verificación de esta revisión

Se realizaron pruebas locales con Chromium, Playwright, axe-core y los emuladores de Firebase. Los datos empleados fueron ficticios y no se enviaron al proyecto Firebase real.

## Resultados

- Siete páginas revisadas en escritorio de 1440 px y móvil de 390 px: menú, ausencia de desbordamiento horizontal y un título principal por página.
- Filtros de catálogo y preselección de programa desde la URL comprobados.
- Validación del formulario, patrón de teléfono y edad entera comprobados.
- Envío y confirmación de guardado comprobados con Authentication y Firestore emulados.
- Acceso autorizado, rechazo de cuenta sin permiso, búsqueda, CSV y cierre de sesión comprobados.
- El contenido recibido se muestra como texto; se comprobaron textos con HTML y fórmulas en la exportación.
- Ante un fallo simulado, el formulario conservó los campos, reactivó el botón y no guardó datos personales en localStorage.
- Preferencias de accesibilidad persistentes y restablecimiento comprobados.
- 23 comprobaciones de reglas de Firestore superadas: creación válida, rechazo de valores inválidos, UID, fecha, campos adicionales, lectura privada y bloqueo de cambios de permisos.
- Sin errores de JavaScript en el recorrido de extremo a extremo.
- Sin infracciones detectadas por la regla automatizada `color-contrast` de axe-core en las siete páginas, con el panel de accesibilidad abierto, en modo normal y alto contraste. Esto no equivale a una auditoría completa de accesibilidad.
- Enlaces locales, atributos alt y ausencia de IDs duplicados comprobados en las siete páginas y la presentación.
- Capturas de Inicio, Contacto normal, Contacto con contraste y Registros guardadas en `evidencias`.

## Pendiente en la cuenta del propietario

Crear o habilitar los servicios, publicar las reglas y autorizar un administrador siguiendo `FIREBASE.md`. Después, realizar un envío ficticio contra el proyecto real. Las pruebas emuladas no verifican la configuración de la cuenta ni un despliegue público.

PHP se conserva como alternativa y no se ejecutó porque no está instalado en este equipo. La integración principal probada utiliza Firebase.
