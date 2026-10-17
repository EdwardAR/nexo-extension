# Nexo

Centro digital para Chrome con bóveda cifrada local, autocompletado,
renovaciones, horarios internacionales y recordatorios.

Versión actual: `1.9.0`

<p align="center">
<img width="395" height="600" alt="image" src="https://github.com/user-attachments/assets/25d1987f-ade2-46ca-9694-46f7c8b72e37" />
</p>

## Funciones

- Bóveda local cifrada para guardar accesos y datos sensibles.
- Desbloqueo protegido por contraseña maestra, sin autenticación remota.
- Perfil local con nombre o alias y saludo personalizado en la pantalla principal.
- Edición del nombre desde `Ajustes de perfil`, sin crear una nueva bóveda.
- Autocompletado de credenciales en páginas compatibles.
- Renovaciones y borradores locales para reducir la pérdida accidental de datos.
- Horarios de Lima y Madrid, reloj flotante y recordatorios configurables.
- Notificaciones de Chrome y anuncio por voz cuando el navegador lo permite.
- Importación y exportación de copias de seguridad cifradas.

## Desarrollo

```bash
npm install
npm run dev
npm run build
npm run preview
```

Para probar la extensión en Chrome, carga la carpeta `dist/` como extensión sin
empaquetar desde `chrome://extensions/` con el modo desarrollador activado.

Para regenerar los iconos de la extensión:

```bash
npm run icons
```

Los PNG se generan en `public/icons/` y luego se copian a `dist/icons/` durante el
build. La carpeta `dist/` es salida generada y no debe editarse directamente.

## Perfil local

El nombre de usuario es un nombre simple o alias guardado localmente junto con la
configuración de la extensión. Se utiliza únicamente para personalizar la interfaz;
no es una cuenta ni se transmite a ningún servidor.

Si no existe un nombre guardado, la interfaz muestra el saludo genérico
`Bienvenido a Nexo`.

## Seguridad y sesión de la bóveda

La bóveda se cifra localmente usando Web Crypto API. La contraseña maestra solo vive
en `chrome.storage.session` mientras la bóveda está desbloqueada. No se guarda en
`chrome.storage.local`, no se incluye en copias de seguridad y no se transmite.

El botón `Bloquear` y el cierre de la última ventana limpian la sesión activa.

Las copias de seguridad exportadas están cifradas. Para restaurarlas se solicita la
contraseña maestra y el archivo se valida antes de reemplazar la bóveda local.

## Versionado

Cada cambio solicitado incrementa la siguiente versión menor y mantiene sincronizados
`package.json`, `package-lock.json` y `manifest.json`. Esta actualización pasa de
`1.8.0` a `1.9.0`; el siguiente cambio será `1.10.0`.

## Tecnología y estructura

React, TypeScript, Vite, Tailwind CSS, Web Crypto API, Chrome Manifest V3,
Lucide React e Inter con alternativas del sistema.

- `src/popup/`: interfaz, componentes, hooks, estilos y utilidades de la bóveda.
- `src/background/`: ciclo de vida de la extensión, recordatorios y notificaciones.
- `src/content/`: autocompletado y elementos inyectados en páginas.
- `src/shared/`: helpers compartidos entre contextos.
- `public/icons/`: SVG fuente y tamaños de iconos.
- `dist/`: salida generada para cargar la extensión en Chrome.

## Cambiar el icono

1. Reemplaza `public/icons/icon-source.svg`.
2. Ejecuta `npm run icons`.
3. Vuelve a ejecutar `npm run build`.
