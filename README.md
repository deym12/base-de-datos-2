# Portafolio Digital · Base de Datos II · UPLA

Portafolio web estático de Dilmer Yupanqui. Conserva el fondo, el logo UPLA, la foto de perfil, el nombre y las cuatro unidades del portafolio original. Los trabajos aparecen leyendo JPG directamente desde este repositorio público; la página no tiene carga de archivos local ni inicio de sesión.

## Archivos del proyecto

- `index.html`: estructura y contenido de las páginas.
- `styles.css`: estilos originales y ajustes adaptables a móviles.
- `app.js`: navegación, lectura de JPG, vista previa, actualización y descarga.
- `config.js`: usuario, nombre del repositorio y rama de GitHub.
- `logo upla.png`, `deym.png` y `goku-4k-ultra-hd-on-white-wall-pwsjrujt5i0hwjqr.jpg`: imágenes del diseño original; cópialas a la raíz con **estos mismos nombres**.
- `trabajos/semana-01/` … `trabajos/semana-16/`: carpeta de cada semana para los JPG.

> Las imágenes originales de logo, perfil y fondo no venían adjuntas con `index.html`; cópialas de tu portafolio anterior a la raíz del repositorio. Si sus nombres exactos difieren, cambia las rutas en `index.html` y `styles.css`.

## Cómo agregar una actividad semanal

1. Abre la carpeta `trabajos` del repositorio.
2. Usa el número de semana del curso, no el número de semana dentro de la unidad. Por ejemplo: `Semana 05` va en `trabajos/semana-05/` y `Semana 13` en `trabajos/semana-13/`.
3. Sube ahí uno o varios archivos `.jpg`, `.jpeg` o `.JPG`. Puedes elegir cualquier nombre descriptivo, por ejemplo `modelo-entidad-relacion.jpg`.
4. Cuando el cambio quede publicado en la rama configurada, la página detectará automáticamente las imágenes al entrar a la unidad. Pulsa **Actualizar** si ya tenías abierta la página.

Las carpetas se ordenan así: Unidad I = semanas 01–04; Unidad II = semanas 05–08; Unidad III = semanas 09–12; Unidad IV = semanas 13–16. No es necesario editar la lista del portafolio al añadir una imagen.

## Usar el repositorio y activar GitHub Pages

1. Usa el repositorio `deym12/base-de-datos-2` y mantenlo público para que la página pueda leer los JPG sin credenciales.
2. Sube al repositorio todo el contenido de esta carpeta, incluidas las tres imágenes del diseño original.
3. En GitHub, abre **Settings → Pages** y elige desplegar desde la rama `main`, carpeta `/ (root)`.
4. Conserva el repositorio público: la página usa la API pública de GitHub para enumerar los JPG sin requerir tokens, contraseñas ni una base de datos.

Los trabajos se almacenan en `trabajos/semana-NN/`. La vista previa y descarga abren el JPG alojado en GitHub. Si el navegador bloquea una descarga entre dominios, se abre la imagen para guardarla desde el propio navegador.
