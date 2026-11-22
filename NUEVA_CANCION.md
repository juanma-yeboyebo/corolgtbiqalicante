# Cómo añadir una canción nueva a la web del coro

Para que una canción aparezca en https://coro.entendemos.org hacen falta dos cosas: subir sus archivos y apuntarla en una lista. Todo se hace desde la web de GitHub, sin instalar nada, es copiar y pegar.

Es mejor hacerlo desde el ordenador. Desde el móvil se puede, pero es bastante más incómodo.

## Paso 1. Prepara la carpeta en tu ordenador

Crea una carpeta con el nombre de la canción, tal cual quieres que se vea en la web (por ejemplo, `Bohemian Rhapsody`). Mete dentro todo lo que tengas:

- La letra o el guión, en PDF.
- La partitura, en PDF.
- Los audios de cada cuerda, en MP3.

Un truco para que quede bonito: empieza el nombre de cada archivo por el nombre de la canción. Si el audio se llama `Bohemian Rhapsody CORO MORENAS.mp3`, en la web saldrá solo como «CORO MORENAS».

No hace falta que esté todo. Si una canción todavía no tiene partitura, por ejemplo, la pestaña de Partitura sencillamente no aparece.

## Paso 2. Sube la carpeta a GitHub

1. Entra en el proyecto y pulsa en la carpeta `canciones`. Verás las carpetas de las canciones que ya hay.
2. Arriba a la derecha, pulsa **Add file** y luego **Upload files**.
3. Arrastra tu carpeta entera desde el ordenador a la página. Arrastra la carpeta, no los archivos sueltos, para que se cree con su nombre.
4. Espera a que terminen de subir todos los archivos.
5. Baja hasta el final y pulsa el botón verde **Commit changes**. Sin este paso no se guarda nada.

Cada archivo puede pesar como mucho 25 MB. Un MP3 normal ronda los 4 MB, así que no debería darte problemas.

## Paso 3. Apunta la canción en la lista

Subir los archivos no basta: la web solo enseña las canciones que están apuntadas en el archivo `canciones.js`.

1. Vuelve a la portada del proyecto y abre el archivo `canciones.js`.
2. Pulsa el lápiz que hay arriba a la derecha del archivo para editarlo.
3. Copia esta plantilla justo antes de la última línea, la que pone `];`:

   ```
     {
       nombre: "Bohemian Rhapsody",
       carpeta: "Bohemian Rhapsody",
       letras: ["Bohemian Rhapsody LETRA.pdf"],
       audios: [
         "Bohemian Rhapsody CORO MORENAS.mp3",
         "Bohemian Rhapsody CORO RUBIAS.mp3",
       ],
       partituras: ["Bohemian Rhapsody PARTITURA.pdf"],
     },
   ```

4. Cambia los nombres por los tuyos. Pulsa **Commit changes** y otra vez **Commit changes** en la ventana que aparece.

Qué es cada línea:

- `nombre`: el título que se ve en la web.
- `carpeta`: el nombre de la carpeta que subiste en el paso 2.
- `letras`, `audios` y `partituras`: los nombres de los archivos, cada uno entre comillas y separados por comas. Si no tienes de algún tipo, déjalo vacío así: `[]`.

Los nombres tienen que ser _exactamente_ iguales a los de los archivos: mayúsculas, tildes, espacios y la extensión (`.pdf`, `.mp3`). Lo más seguro es copiarlos de GitHub en vez de escribirlos a mano.

Las canciones salen en la web en el mismo orden que en este archivo.

## Paso 4. Comprueba que sale

GitHub tarda un par de minutos en actualizar la web. Pasado ese rato, entra en https://coro.entendemos.org y recarga la página. Debería aparecer la canción nueva.

## Si algo no sale bien

| Lo que ves                                         | Lo que suele pasar                                                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| No sale ninguna canción, ni las de antes           | Hay un fallo al escribir en `canciones.js`: una coma o unas comillas de menos. Revísalo comparando con la plantilla. |
| La canción nueva no aparece                        | Han pasado menos de dos minutos, o faltó pulsar **Commit changes**. Espera un poco y recarga.                        |
| La canción sale, pero un PDF o un audio no se abre | El nombre en `canciones.js` no es idéntico al del archivo, o la carpeta no coincide.                                 |
