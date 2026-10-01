# 👶 Guía para Principiantes

¡Bienvenido! Si nunca programaste o es tu primera vez usando Node.js, no te preocupes. Este bot es fácil de usar y te servirá para automatizar mensajes sin pagar nada. Seguí estos pasos detallados:

## Paso 1: Instalar los programas necesarios
1. Descargá e instalá **Node.js** desde su página oficial: [https://nodejs.org/](https://nodejs.org/) (Elegí la versión que dice "LTS").
2. Descargá este proyecto. Arriba a la derecha en GitHub, tocá el botón verde **"Code"** y luego **"Download ZIP"**. 
3. Descomprimí la carpeta descargada en tu computadora (por ejemplo, en tus Documentos o Escritorio).

## Paso 2: Preparar la configuración
1. Entrá a la carpeta del bot que acabas de descomprimir.
2. Buscá el archivo llamado `.env.example`.
3. Renombralo para que se llame solamente `.env` (asegurate de que no quede como `.env.txt`, si Windows te oculta las extensiones, tené cuidado con esto).
4. Podés abrir este archivo con el Bloc de notas si querés ver qué tiene adentro, pero por ahora no toques nada.

## Paso 3: Instalar el bot
1. Abrí la carpeta del bot. 
2. Arriba de todo, en la barra de direcciones de la carpeta (donde dice la ruta completa como `C:\Usuarios\...`), hacé un clic, borrá todo, escribí la palabra `cmd` y apretá Enter. Esto abrirá una pantalla negra (la consola).
3. En la consola negra, escribí el siguiente comando y apretá Enter:
   ```bash
   npm install
   ```
   *Esto descargará todas las piezas necesarias para que el bot funcione. Puede tardar un par de minutos, paciencia.*

## Paso 4: Encender y Vincular tu WhatsApp
1. Una vez que termine de instalar, en la misma consola escribí:
   ```bash
   npm start
   ```
2. Vas a ver que la consola muestra un mensaje de inicio y, tras unos segundos, aparecerá un **código QR gigante**.
3. Abrí WhatsApp en tu celular, andá a la configuración de **Dispositivos Vinculados** y escaneá ese código (tal cual como cuando iniciás sesión en WhatsApp Web).
4. ¡Listo! La consola dirá "WhatsApp conectado exitosamente".

## Paso 5: Obtener el ID de tu Grupo
Para que el bot sepa a dónde enviar los mensajes, necesita un ID.
1. Con el bot encendido y la consola negra abierta, andá a cualquier chat o grupo en tu celular y escribí el mensaje: `!vincular`
2. El bot te va a responder por WhatsApp y, además, en la consola negra aparecerá un código largo (ej: `123456789@g.us`).
3. Copiá ese código, abrí tu archivo `.env` (con el Bloc de notas) y pegalo adentro de las comillas donde dice `WHATSAPP_GRUPO_ID=""`.
4. Cerrá la consola negra para apagar el bot.
5. Volvé a abrir la consola y escribí `npm start` para prenderlo de nuevo. ¡Ahora el bot ya sabe a dónde enviar los mensajes!

## Paso 6: ¿Cómo le mando mensajes al bot para que los reenvíe?
El bot funciona como un "servidor" en tu computadora. Para pedirle que envíe un mensaje, otros programas de tu PC deben enviarle una señal.
Si usás sistemas de facturación o gestores ERP, podés pedirle a tu técnico que envíe una petición `POST` a la dirección `http://localhost:3000/api/enviar`. ¡El bot se encargará de reenviarlo al instante a WhatsApp!
