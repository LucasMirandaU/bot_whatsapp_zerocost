# 👶 Guía para Principiantes y Operadores

¡Bienvenido! Esta guía está pensada para cualquier persona (empleados, dueños de negocio o administradores), **sin necesidad de tener ningún conocimiento previo de programación**. 

Con este bot vas a poder enviar mensajes automáticos y manuales de WhatsApp a costo $0.

---

## 🚀 Guía Rápida del Día a Día (Para usar en el local)

### ¿Cómo lo enciendo?
Hacé **doble clic en el archivo `Iniciar_Bot.bat`** dentro de la carpeta.
1. Se abrirá automáticamente una ventana en tu navegador web (por ejemplo Chrome o Edge) en la dirección del panel.
2. Se abrirá una ventana negra que mantiene el bot funcionando. **Dejala abierta o minimizada mientras quieras usar el panel**.

### ¿Cómo sé si está funcionando?
Mirá arriba a la derecha en la página web:
* 🟢 **Verde ("Conectado"):** El bot está listo y funcionando. Podés enviar mensajes o dejar que los sistemas automáticos lo usen.
* 🟡 **Amarillo ("Requiere Escaneo de QR"):** Falta vincular el teléfono. En el centro de la pantalla verás el código QR listo para escanear.
* 🔴 **Rojo ("Servidor desconectado"):** El bot está apagado. Hacé doble clic en `Iniciar_Bot.bat` para prenderlo.

### ¿Cómo cambio de teléfono celular?
Si en el local cambiaron de celular o se desconectó la sesión:
1. Abrí el panel web en tu navegador.
2. Tocá el botón que dice **"Cambiar Teléfono"**.
3. Confirmá el mensaje en pantalla. El sistema cerrará la sesión anterior y te mostrará un **código QR nuevo al instante**.
4. Abrí WhatsApp en el nuevo teléfono > **Dispositivos vinculados** > **Vincular un dispositivo** y escaneá la pantalla. ¡Listo!

---

## 🛠️ Instalación Inicial (Paso a Paso desde Cero)

Si es la primera vez que se instala el bot en esta computadora, seguí estos pasos una sola vez:

### Paso 1: Instalar Node.js
1. Descargá e instalá **Node.js** desde su página oficial: [https://nodejs.org/](https://nodejs.org/) (elegí la versión recomendada que dice "LTS").

### Paso 2: Preparar la configuración
1. Entrá a la carpeta del bot.
2. Buscá el archivo llamado `.env.example`.
3. Cambiale el nombre para que se llame solamente `.env` (sin `.example` al final).

### Paso 3: Instalar las dependencias
1. En la carpeta del bot, hacé clic en la barra de direcciones de arriba (donde dice la ruta de carpetas), escribí `cmd` y apretá Enter.
2. En la consola negra escribí el siguiente comando y apretá Enter:
   ```bash
   npm install
   ```
   *(Esto descargará las librerías necesarias. Solo se hace la primera vez).*

### Paso 4: Encender y Vincular tu WhatsApp
1. Hacé doble clic en el archivo **`Iniciar_Bot.bat`**.
2. Tu navegador se abrirá mostrando el código QR.
3. En el celular del negocio, abrí **WhatsApp**, tocá los **tres puntos ⋮** (o **Ajustes** en iPhone), entrá en **Dispositivos vinculados** y tocá **Vincular un dispositivo**.
4. Apuntá con la cámara al código QR de la pantalla.
5. ¡Listo! La pantalla se pondrá en verde diciendo **"Conectado"**.

### Paso 5: Averiguar el ID de tu Grupo o Destinatario
Para que el bot sepa a qué grupo enviar las alertas:
1. Con el bot encendido, andá al grupo de WhatsApp desde el celular y mandá el mensaje: `!vincular`
2. El bot te va a responder por WhatsApp y en la consola negra con un código largo (ej: `120363421076147703@g.us`).
3. Abrí el archivo `.env` con el Bloc de notas y pegá ese código adentro de las comillas en:
   ```env
   WHATSAPP_GRUPO_ID="tu_codigo_aqui"
   ```
4. Guardá el archivo. ¡El bot ya sabe a dónde mandar los mensajes!

---

## 💬 ¿Cómo enviar mensajes?

El bot ofrece dos opciones:

### Opción A: Desde el Panel Web (Manual y visual 🖥️)
Entrás al navegador a la dirección del bot (por ejemplo `http://localhost:3005`):
1. Escribís tu mensaje en el casillero de texto.
2. (Opcional) Si querés adjuntar un comprobante, foto o PDF, hacés clic en **"Adjuntar Archivo"**.
3. (Opcional) Podés escribir un número puntual en "Destinatarios" si no querés enviarlo al grupo por defecto.
4. Tocás **"Enviar Mensaje Ahora"**. ¡El bot lo envía al instante!

### Opción B: Automático desde tu Sistema o ERP ⚙️
Si tenés un software de gestión (como un ERP o sistema de taller):
* Tu sistema puede mandar alertas automáticas haciendo peticiones a `http://localhost:3005/api/enviar`.
* **Auto-Arranque:** Los scripts integrados (como la alerta diaria de taller) son capaces de encender el bot en segundo plano si estaba apagado, enviar el mensaje y dejar todo funcionando sin intervención humana.

---

## ❓ Preguntas Frecuentes y Solución de Dudas

**1. ¿Tengo que escanear el código QR cada vez que prendo la computadora?**  
No. La sesión queda guardada de forma segura en la computadora. Cada vez que abras el bot se conectará solo en segundos, sin pedirte el QR. Solo te pedirá QR si cambian de celular o si cerrás la sesión desde el WhatsApp del teléfono.

**2. ¿Qué pasa si reinicio la computadora?**  
No pasa nada. Los sistemas automáticos lo encienden solos cuando lo necesitan, o podés hacer doble clic en `Iniciar_Bot.bat` para abrir el panel cuando quieras.

**3. ¿Qué pasa si el teléfono se queda sin batería o sin internet?**  
WhatsApp Web necesita que el celular tenga conexión para sincronizar. Apenas el teléfono vuelva a tener internet o batería, el bot se reconecta automáticamente sin que tengas que hacer nada.

**4. ¿Puedo mandar fotos y PDFs?**  
Sí, desde el panel web podés adjuntar fotos o documentos PDF y mandarlos con o sin texto acompañante.
