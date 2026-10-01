# 🤓 Guía para Expertos / Desarrolladores

Si ya tenés experiencia con Node.js, APIs REST y despliegues, esta guía te muestra cómo integrar rápidamente el bot en tu stack.

## 🚀 Quick Start
1. Cloná el repositorio:
   ```bash
   git clone https://github.com/LucasMirandaU/bot_whatsapp_zerocost.git
   ```
2. Entrá a la carpeta e instalá las dependencias:
   ```bash
   cd bot_whatsapp_zerocost
   npm install
   ```
3. Copiá el archivo de entorno y configurá tus IDs de grupo (soportan múltiples IDs separados por coma):
   ```bash
   cp .env.example .env
   ```
4. Iniciá el microservicio (idealmente con PM2 en producción):
   ```bash
   npm start
   # O en prod: pm2 start index.js --name "whatsapp-bot"
   ```

## 📡 Uso de la API REST Integrada
El bot levanta automáticamente un servidor Express en el puerto definido en `.env` (`PORT=3000` por defecto).

### Enviar un mensaje de texto
Hacé un POST request a `/api/enviar`:

```bash
curl -X POST http://localhost:3000/api/enviar \
     -H "Content-Type: application/json" \
     -d '{"mensaje": "Alerta desde el sistema de monitoreo"}'
```

### Enviar contenido multimedia
El endpoint soporta un campo `mediaUrl`. El bot descargará el archivo desde la URL y lo enviará como documento o imagen (ideal para enviar PDFs de facturas, reportes o imágenes de comprobantes).

```bash
curl -X POST http://localhost:3000/api/enviar \
     -H "Content-Type: application/json" \
     -d '{
           "mensaje": "Aquí está el reporte mensual",
           "mediaUrl": "https://midominio.com/reportes/abril.pdf"
         }'
```

## ⚙️ Despliegue en Producción (VPS / Linux)
Como el bot utiliza `puppeteer` bajo el capó (a través de `whatsapp-web.js`), si lo vas a desplegar en un servidor Ubuntu/Debian **sin interfaz gráfica**, vas a necesitar instalar las dependencias base de Chromium para evitar que falle al intentar lanzar el *headless browser*:

```bash
sudo apt-get update
sudo apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```

## 🔄 Comandos Interactivos Integrados
El bot tiene un listener escuchando directamente en los grupos configurados para comandos básicos de mantenimiento:
- `!ping`: Responde para confirmar que el bot sigue vivo y que Puppeteer no se colgó.
- `!estado`: Devuelve la versión actual (leída desde `package.json`) y el puerto donde la API está escuchando.
- `!vincular`: Retorna el ID exacto del grupo o chat para copiarlo al `.env`.
