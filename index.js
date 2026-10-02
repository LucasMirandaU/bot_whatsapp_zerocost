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
app.use(express.json({ limit: '50mb' }));

// Servir la interfaz web desde la carpeta "public"
app.use(express.static('public'));

// Endpoint de la API REST para enviar mensajes
app.post('/api/enviar', async (req, res) => {
    const { mensaje, mediaUrl, mediaBase64, mediaMime, mediaName, destinatariosOverride } = req.body;
    
    if (!mensaje && !mediaUrl && !mediaBase64) {
        return res.status(400).json({ error: 'Debes enviar al menos un "mensaje", un "mediaUrl" o un archivo.' });
    }

    // Usar los destinatarios que vienen del frontend, o caer en los del .env si no enviaron nada
    let targets = DESTINATARIOS;
    if (destinatariosOverride) {
        targets = destinatariosOverride.split(',').map(id => {
            let t = id.trim();
            if (t.length > 0 && !t.includes('@')) {
                t += '@c.us';
            }
            return t;
        }).filter(id => id.length > 0);
    }

    if (targets.length === 0) {
        return res.status(500).json({ error: 'No hay destinatarios configurados en .env ni en el formulario.' });
    }

    try {
        let media = null;
        // Soporte multimedia (Archivo local o URL)
        if (mediaBase64 && mediaMime) {
            media = new MessageMedia(mediaMime, mediaBase64, mediaName || 'archivo');
        } else if (mediaUrl) {
            media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true });
        }

        let enviados = 0;
        for (const chatId of targets) {
            // Validar si el número existe usando getNumberId (más estable que isRegisteredUser)
            if (chatId.includes('@c.us')) {
                console.log(`🔍 Verificando registro del número: ${chatId}...`);
                const numberId = await client.getNumberId(chatId);
                if (!numberId) {
                    throw new Error(`El número ${chatId.replace('@c.us', '')} no existe o no está registrado en WhatsApp.`);
                }
                console.log(`✅ Número válido verificado.`);
            }

            console.log(`📤 Enviando mensaje a ${chatId}... (Media: ${media ? 'SI' : 'NO'})`);
            if (media) {
                let options = {};
                if (mensaje) {
                    options.caption = mensaje;
                }
                await client.sendMessage(chatId, media, options);
            } else {
                await client.sendMessage(chatId, mensaje);
            }
            enviados++;
        }

        res.json({ success: true, enviados });
    } catch (e) {
        const errorMsg = e.message || String(e);
        console.error('❌ Error enviando mensaje via API:', errorMsg);
        res.status(500).json({ error: errorMsg });
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

// Limpieza automática de procesos zombis en Windows antes de iniciar
const { execSync } = require('child_process');
try {
    if (process.platform === 'win32') {
        execSync(`powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter 'Name = ''chrome.exe''' | Where-Object { $_.CommandLine -match '.wwebjs_auth' } | Invoke-CimMethod -MethodName Terminate"`, { stdio: 'ignore' });
    }
} catch (e) {
    // Silencioso si falla
}

client.initialize();

// Manejo de cierre limpio (Evita que queden procesos zombis de Chrome al apretar Ctrl+C)
process.on('SIGINT', async () => {
    console.log('\n⚠️ Apagando el bot de forma segura (cerrando Chrome)...');
    try {
        await client.destroy();
        console.log('✅ Navegador cerrado correctamente.');
    } catch (e) {
        // Ignoramos errores si ya estaba cerrado
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    try {
        await client.destroy();
    } catch (e) {}
    process.exit(0);
});
