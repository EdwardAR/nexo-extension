# Nexo

Nexo es una extensión de navegador centrada en la privacidad para organizar
contraseñas, autocompletar accesos y recibir recordatorios desde una bóveda local
cifrada.

> La versión actual es `1.16.0`. Nexo está en desarrollo y todavía no se distribuye
> desde Chrome Web Store.

<p align="center">
<img width="395" height="600" alt="Pantalla principal de Nexo" src="https://github.com/user-attachments/assets/25d1987f-ade2-46ca-9694-46f7c8b72e37" />
</p>

## ¿Qué incluye?

- Bóveda local cifrada para guardar accesos y datos sensibles.
- Desbloqueo protegido por contraseña maestra, sin cuenta ni autenticación remota.
- Perfil local con nombre o alias y saludo personalizado.
- Autocompletado de credenciales en páginas compatibles.
- Renovaciones y borradores cifrados para reducir la pérdida accidental de datos.
- Horarios de Lima, Madrid y Casablanca, reloj flotante y recordatorios configurables.
- Reloj flotante configurable con una, dos o tres ciudades y ciudad principal elegible.
- Notificaciones de Chrome y anuncio por voz cuando el navegador lo permite.
- Importación y exportación de copias de seguridad cifradas.

## Privacidad y seguridad

- La bóveda se cifra localmente mediante Web Crypto API.
- La contraseña maestra permanece en `chrome.storage.session` mientras la bóveda está
  desbloqueada; no se guarda en texto plano ni se transmite.
- El nombre de usuario es solo un alias local para personalizar la interfaz.
- Nexo no usa cuentas, autenticación remota, analítica ni telemetría.
- Los iconos de los sitios se representan localmente con la inicial del dominio; no
  se consulta a Google ni a otro servicio externo para mostrar favicons.
- La extensión solicita permisos amplios de página para detectar formularios y
  ofrecer autocompletado. Revisa los permisos antes de instalar una copia de prueba.

## Compatibilidad

Nexo usa Chrome Manifest V3 y APIs de extensiones Chromium.

| Navegador | Estado | Nota |
| --- | --- | --- |
| Google Chrome | Objetivo principal | Probado mediante carga local de `dist/`. |
| Microsoft Edge | Compatible esperado | Usa la arquitectura Chromium y Manifest V3. |
| Brave, Vivaldi y Opera | Compatible esperado | Puede requerir validación manual por versión. |
| Firefox | No declarado compatible | Requiere una adaptación y pruebas específicas. |
| Safari | No compatible actualmente | No se ofrece un paquete para Safari. |

La compatibilidad indicada para navegadores Chromium distintos de Chrome es una
expectativa técnica; Chrome sigue siendo el entorno principal de desarrollo.

## Instalación para probar la extensión

La instalación actual se realiza como extensión sin empaquetar:

1. Instala [Node.js](https://nodejs.org/) en una versión LTS.
2. Clona el repositorio o descarga el código fuente.
3. Instala las dependencias y genera la extensión:

   ```bash
   npm install
   npm run build
   ```

4. Abre `chrome://extensions/`.
5. Activa **Modo desarrollador**.
6. Pulsa **Cargar descomprimida** y selecciona la carpeta `dist/`.
7. Fija Nexo en la barra del navegador y abre el popup para crear o desbloquear la
   bóveda.

## Desarrollo

```bash
npm install
npm run dev
npm run build
npm run preview
npm run icons
```

La carpeta `dist/` es una salida generada por Vite. No debe editarse directamente.
Para regenerar los iconos, reemplaza `public/icons/icon-source.svg`, ejecuta
`npm run icons` y vuelve a ejecutar `npm run build`.

## Sitio web

El sitio informativo de Nexo está en [`docs/`](docs/). Para publicarlo con GitHub
Pages:

1. Abre **Settings → Pages** en el repositorio.
2. En **Build and deployment**, selecciona **Deploy from a branch**.
3. Elige la rama `main` y la carpeta `/docs`.
4. Guarda la configuración y espera a que GitHub Pages genere el sitio.

La URL esperada será `https://edwardar.github.io/nexo-extension/` cuando el
repositorio sea público y GitHub Pages esté habilitado.

## Estructura

- `src/popup/`: interfaz, componentes, hooks, estilos y utilidades de la bóveda.
- `src/background/`: ciclo de vida, recordatorios y notificaciones.
- `src/content/`: autocompletado y elementos inyectados en páginas.
- `src/shared/`: helpers compartidos entre contextos.
- `public/icons/`: SVG fuente y tamaños de iconos.
- `docs/`: sitio informativo para GitHub Pages.
- `dist/`: salida generada para cargar la extensión en Chrome.

## Versionado

Cada cambio solicitado incrementa la siguiente versión menor y mantiene sincronizados
`package.json`, `package-lock.json` y `manifest.json`. Esta actualización pasa de
`1.15.0` a `1.16.0`; el siguiente cambio será `1.17.0`.

## Tecnología

React, TypeScript, Vite, Tailwind CSS, Web Crypto API, Chrome Manifest V3,
Lucide React e Inter con alternativas del sistema.
