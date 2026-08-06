# Nexo

Centro digital para Chrome con bóveda cifrada, autocompletado, renovaciones,
automatizaciones, relojes internacionales y recordatorios.

## Desarrollo

```bash
npm install
npm run build
```

Carga la carpeta `dist` desde `chrome://extensions/` usando **Cargar descomprimida**.

## Cambiar el icono

El diseño maestro está en `public/icons/icon-source.svg`. Para reemplazarlo sin
modificar el manifest ni la estructura del proyecto:

1. Edita o reemplaza `public/icons/icon-source.svg` manteniendo un `viewBox`
   cuadrado, preferiblemente `0 0 128 128`.
2. Ejecuta `npm run icons`.
3. Ejecuta `npm run build`.
4. Recarga la extensión desde `chrome://extensions/`.

El comando genera automáticamente:

- `public/icons/icon16.png`
- `public/icons/icon48.png`
- `public/icons/icon128.png`

No cambies esos nombres porque son las rutas estables utilizadas por el manifest.

## Sesión de la bóveda

La contraseña maestra permanece únicamente en `chrome.storage.session`. La bóveda
continúa desbloqueada mientras el navegador siga abierto y se bloquea cuando:

- pulsas el botón **Bloquear bóveda**;
- cierras la última ventana de Chrome.

La contraseña maestra no se guarda en `chrome.storage.local`.

## Importar y exportar

Desde el icono de respaldo en la cabecera puedes:

- exportar un archivo `nexo-backup-AAAA-MM-DD.json`;
- importar un respaldo compatible y reemplazar la bóveda actual.

El formato incluye un identificador y una versión para poder migrarlo en futuras
versiones. Las credenciales permanecen cifradas y, después de restaurarlas, debes
usar la contraseña maestra con la que se creó el respaldo.

## Renovaciones y borradores

- Cada acceso puede registrar la fecha real del último cambio y un periodo de
  renovación en meses.
- Chrome muestra un recordatorio genérico siete días antes y al vencer; los
  detalles solo se ven dentro de la bóveda desbloqueada.
- Los formularios incompletos se guardan cifrados y se recuperan después de
  cerrar el popup o reiniciar Chrome.

## Tecnología

React, TypeScript, Tailwind CSS, Web Crypto API y Chrome Manifest V3.

## Automatizaciones de clics

El botón con el cursor en la cabecera permite crear automatizaciones asociadas a
una URL:

1. Indica un nombre y la URL, y pulsa **Empezar a grabar clics**.
2. Realiza los clics en la página y pulsa **Terminar y guardar** en la barra flotante.
3. Abre de nuevo el módulo: la secuencia aparecerá en **Secuencias guardadas**.
4. Usa **Ejecutar** para probarla o **Programar** para definir su franja horaria.

Al finalizar se muestra una notificación y se reproduce un aviso. Solo se
registran clics y tiempos entre ellos; no se capturan teclas ni valores escritos.
Los cambios importantes en la estructura HTML de una página pueden requerir
volver a grabar la secuencia.

La grabación funciona también dentro de `iframe`, como los usados por Power
Apps. Para cada control se conservan varios selectores alternativos y su frame
de origen. Después de actualizar la extensión, recarga por completo la página
antes de iniciar una nueva grabación.

La grabación se activa desde la pulsación física del puntero, por lo que también
cuenta controles deshabilitados. Durante la ejecución se espera hasta 15
segundos a que el control vuelva a estar habilitado antes de marcar el paso como
fallido.

El reloj flotante conserva el mismo tamaño físico y la misma posición relativa
en todas las pestañas, incluso cuando usan niveles de zoom distintos. Su tarjeta
rectangular muestra siempre el día, la fecha y los datos horarios completos. Al
moverlo, la posición se sincroniza con las demás páginas abiertas.

## Horarios y recordatorios

El botón del reloj abre un panel con la hora de Lima (`America/Lima`) y Madrid
(`Europe/Madrid`). La zona de Madrid aplica automáticamente el cambio entre CET
y CEST. Al crear una alerta puedes elegir si la fecha y hora corresponden a
Perú o España; Nexo muestra la equivalencia en el otro país antes de guardarla.
Chrome muestra la notificación aunque el popup esté cerrado.
