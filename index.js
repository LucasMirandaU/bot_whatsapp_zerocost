/**
 * WhatsApp Bot Zero-Cost
 * Desarrollado por Lucatoons
 */
require('dotenv').config();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const { version } = require('./package.json');

// Configuración inicial
const PORT = process.env.PORT || 3000;
// Soporte para múltiples destinatarios separados por coma
const DESTINATARIOS = process.env.WHATSAPP_GRUPO_ID 
    ? process.env.WHATSAPP_GRUPO_ID.split(',').map(id => id.trim()).filter(id => id.length > 0)
    : [];

console.log(`🤖 Iniciando Bot de WhatsApp (Zero-Cost) v${version} - by Lucatoons...`);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
      // Descomentar y ajustar según tu sistema operativo si Puppeteer no encuentra Chrome:
      // Windows: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      // Mac: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      // Linux: '/usr/bin/google-chrome-stable'
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

// Inicializar Express (Microservicio)
const app = express();
app.use(express.json());

// Pantalla de bienvenida para el navegador
app.get('/', (req, res) => {
    res.send('🤖 <b>Bot de WhatsApp Zero-Cost funcionando correctamente.</b><br><br>Para enviar mensajes, debés hacer una petición POST a <code>/api/enviar</code>.');
});

// Endpoint de la API REST para enviar mensajes
app.post('/api/enviar', async (req, res) => {
    const { mensaje, mediaUrl } = req.body;
    
    if (!mensaje && !mediaUrl) {
        return res.status(400).json({ error: 'Debes enviar al menos un "mensaje" o una "mediaUrl".' });
    }

    if (DESTINATARIOS.length === 0) {
        return res.status(500).json({ error: 'No hay destinatarios configurados en .env' });
    }

    try {
        let media = null;
        // Soporte multimedia (descarga desde URL si se provee)
        if (mediaUrl) {
            media = await MessageMedia.fromUrl(mediaUrl);
        }

        let enviados = 0;
        for (const chatId of DESTINATARIOS) {
            if (media) {
                await client.sendMessage(chatId, media, { caption: mensaje || '' });
            } else {
                await client.sendMessage(chatId, mensaje);
            }
            enviados++;
        }

        res.json({ success: true, enviados });
    } catch (e) {
        console.error('❌ Error enviando mensaje via API:', e.message);
        res.status(500).json({ error: e.message });
    }
});

client.on('qr', (qr) => {
    console.log('📲 ESCANEÁ ESTE CÓDIGO QR CON LA APP DE WHATSAPP');
    qrcode.generate(qr, { small: true });
});

let serverStarted = false;
client.on('ready', async () => {
    console.log('✅ ¡WhatsApp conectado exitosamente!');
    
    if (DESTINATARIOS.length === 0) {
        console.log('\n⚠️ ATENCIÓN: No configuraste ningún WHATSAPP_GRUPO_ID en tu archivo .env');
        console.log('Para averiguar el ID de tu grupo, mandá el mensaje "!vincular" adentro del chat.');
        console.log('El bot está escuchando ahora mismo...\n');
    } else {
        console.log(`📡 Destinatarios configurados: ${DESTINATARIOS.length}`);
    }

    // Levantar el servidor Express una vez que WhatsApp está listo, asegurándonos de que solo lo haga una vez
    if (!serverStarted) {
        app.listen(PORT, () => {
            console.log(`🚀 API REST escuchando en http://localhost:${PORT}`);
            console.log(`   Ejemplo POST a /api/enviar con JSON: { "mensaje": "Hola mundo" }`);
        });
        serverStarted = true;
    }
});

// Comandos interactivos y listener
client.on('message_create', async msg => {
    // Comando para vincular grupos
    if (msg.body === '!vincular') {
        console.log(`\n✅ ¡Comando recibido! El ID de este chat es: ${msg.from}`);
        console.log(`Agregá este ID a tu archivo .env separándolo por comas si hay más de uno.`);
        msg.reply(`✅ *Vinculación exitosa*\nTu ID de chat es:\n\`${msg.from}\``);
    }
    
    // Comando ping
    if (msg.body === '!ping') {
        msg.reply('🏓 Pong! El bot está activo y esperando instrucciones.');
    }

    // Comando estado
    if (msg.body === '!estado') {
        msg.reply(`✅ *Estado del Sistema*\nVersión: v${version}\nMotor: Node.js\nAPI: Corriendo en puerto ${PORT}`);
    }
});

// Reconexión automática
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp se desconectó. Razón:', reason);
    console.log('Reiniciando el cliente automáticamente en 5 segundos...');
    setTimeout(() => {
        client.initialize();
    }, 5000);
});

client.initialize();
