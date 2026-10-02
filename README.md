# 🤖 WhatsApp Bot Zero-Cost (Alternativa a n8n)

Este es un template para crear un **Bot de WhatsApp totalmente gratuito** utilizando `Node.js` y `whatsapp-web.js`. 

Muchas veces la comunidad recomienda plataformas como *n8n* o *Make*, o pagar por la costosa API oficial de WhatsApp Cloud para enviar alertas automatizadas desde tu sistema o base de datos. ¡No hace falta! Con este pequeño script podés correr tus propias automatizaciones a costo **$0**.

## ✨ Características
- **Cero suscripciones:** No necesitás pagar mensualidades ni costos por mensaje.
- **Microservicio API REST (Nuevo):** Incluye Express.js integrado. Podés enviarle peticiones POST locales para disparar mensajes desde cualquier otro sistema.
- **Múltiples Destinatarios (Nuevo):** Permite enviar la misma alerta a múltiples grupos o números al mismo tiempo.
- **Soporte Multimedia (Nuevo):** Envío de imágenes, documentos y PDFs.
- **Comandos Interactivos (Nuevo):** Responde a comandos como `!ping`, `!estado` y `!vincular`.
- **Reconexión Automática (Nuevo):** Se recupera solo si la sesión de WhatsApp se desconecta.
- **Autosanación de Librería (Nuevo):** Incluye parche automatizado (`patch-package`) que soluciona bugs nativos y recientes de `whatsapp-web.js` con las nuevas actualizaciones de memoria de WhatsApp Web.
- **Asistente de Configuración:** Si no sabés el ID de un grupo, el bot tiene un listener integrado (`!vincular`) que te lo escupe por consola.

## 🛠️ Desarrollo y Versionado
**Fuente de la verdad:** En Node.js, por convención y como buena práctica en este proyecto, el archivo `package.json` es la fuente de la verdad para el control de versiones. Al modificar la propiedad `"version"` allí, el cambio se refleja automáticamente en los logs de la consola del bot.

## 🌍 Compatibilidad Multiplataforma
Este bot está programado en Node.js, por lo que **funciona perfectamente en Windows, macOS y Linux**.
*Nota para servidores Linux sin entorno gráfico (VPS/Ubuntu):* Puppeteer requiere descargar Chromium para funcionar. Si experimentás errores al iniciar en Linux, es posible que necesites instalar las dependencias básicas de Chromium ejecutando: `sudo apt-get install -y libnss3 libnspr4 libgbm1 libasound2`.

## 📚 Guías de Instalación y Uso
Para que todos puedan aprovechar esta herramienta, dividimos las instrucciones en dos guías. ¡Elegí la que mejor se adapte a vos!

- 👶 **[Guía para Principiantes](./docs/PRINCIPIANTES.md):** Paso a paso detallado desde cero, sin términos técnicos. ¡Cualquiera puede hacerlo!
- 🤓 **[Guía para Expertos / Desarrolladores](./docs/EXPERTOS.md):** Comandos rápidos, endpoints de la API REST, payloads y despliegue en servidores Linux.

## 💡 Licencia
MIT - ¡Hacelo tuyo, modificalo y sumalo a tus proyectos!
