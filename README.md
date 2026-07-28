# Password Vault

Gestor de contraseñas para Chrome con cifrado local y autocompletado.

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

## Tecnología

React, TypeScript, Tailwind CSS, Web Crypto API y Chrome Manifest V3.
