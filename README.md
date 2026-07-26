# Password Vault

Un gestor de contraseñas para Chrome que guarda tus claves de forma segura y las rellena automáticamente en los sitios web.

## ¿Cómo funciona?

1. **Creas una contraseña maestra** — es la única que tendrás que recordar. Sin ella, nadie puede ver tus claves.
2. **Guardas tus contraseñas** — añade usuario y contraseña de cada sitio donde tengas cuenta.
3. **Todo se cifra** — tus datos se encriptan con AES-256 (el mismo estándar que usan bancos) y solo se descifran con tu contraseña maestra.
4. **Autocompletado** — cuando entras a un sitio, aparece un botón morado junto al campo de contraseña. Un clic y se rellena solo.

## Funcionalidades

- **Cifrado total** — tus contraseñas nunca salen de tu navegador. Ni siquiera nosotros podemos verlas.
- **Autofill inteligente** — botón flotante que detecta formularios de login y sugiere tus credenciales guardadas.
- **Búsqueda instantánea** — encuentra cualquier contraseña en segundos.
- **Modo oscuro y claro** — se adapta automáticamente a tu sistema.
- **Copiado rápido** — un clic para copiar usuario o contraseña al portapapeles.

## Instalación

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el **Modo desarrollador** (esquina superior derecha)
3. Haz clic en **Cargar descomprimida**
4. Selecciona la carpeta `dist` de este proyecto
5. Listo — aparece el icono del escudo en la barra de herramientas

## Primeros pasos

1. Haz clic en el icono de Password Vault
2. Crea tu **contraseña maestra** (la que usarás para desbloquear el vault)
3. Empieza a guardar tus contraseñas con el botón **Add Password**
4. Al visitar un sitio con formulario de login, verás un botón morado que te permite autocompletar

## Tecnología

Construido con React, TypeScript, Tailwind CSS y Web Crypto API. Compatible con Chrome (Manifest V3).
