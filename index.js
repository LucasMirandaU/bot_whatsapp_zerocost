/**
 * WhatsApp Bot Zero-Cost
 * Desarrollado por Lucatoons
 */
require('dotenv').config();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');
const { execSync } = require('child_process');
const { version } = require('./package.json');

// Configuración inicial
const PORT = process.env.PORT || 3000;
// Soporte para múltiples destinatarios separados por coma
const DESTINATARIOS = process.env.WHATSAPP_GRUPO_ID 
    ? process.env.WHATSAPP_GRUPO_ID.split(',').map(id => id.trim()).filter(id => id.length > 0)
    : [];

console.log(`🤖 Iniciando Bot de WhatsApp (Zero-Cost) v${version} - by Lucatoons...`);

// Estado en memoria para sincronización en tiempo real con el Panel Web
let botState = {
    status: 'INITIALIZING', // 'INITIALIZING' | 'QR_READY' | 'AUTHENTICATING' | 'READY' | 'DISCONNECTED'
    qrDataUrl: null,
    user: null,
    destinatariosConfigurados: DESTINATARIOS.length
};

// Limpieza automática de procesos zombis de Chrome en Windows
function killZombieProcesses() {
    try {
        if (process.platform === 'win32') {
            execSync(`powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = 'chrome.exe'\\" | Where-Object { \\$_.CommandLine -match '.wwebjs_auth' } | Invoke-CimMethod -MethodName Terminate"`, { stdio: 'ignore' });
        }
    } catch (e) {
        // Silencioso si no hay procesos huérfanos
    }
}

// Inicializar Express (Microservicio y Panel Web Always-On)
const app = express();
app.use(express.json({ limit: '50mb' }));

// Servir la interfaz web desde la carpeta "public"
app.use(express.static('public'));

// Endpoint para consultar el estado del bot y el código QR en tiempo real
app.get('/api/estado', (req, res) => {
    res.json({
        status: botState.status,
        qrDataUrl: botState.qrDataUrl,
        user: botState.user,
        destinatariosConfigurados: DESTINATARIOS.length,
        version: version,
        port: PORT
    });
});

// Endpoint para desvincular el celular actual y solicitar nuevo QR desde la web
app.post('/api/desvincular', async (req, res) => {
    console.log('🔄 Solicitud de desvinculación recibida desde el Panel Web...');
    try {
        botState.status = 'INITIALIZING';
        botState.qrDataUrl = null;
        botState.user = null;

        if (client) {
            try {
                await client.logout();
                console.log('🚪 Sesión de WhatsApp cerrada exitosamente.');
            } catch (err) {
                console.log('Aviso al desloguear:', err.message);
            }
            try {
                await client.destroy();
                console.log('🛑 Navegador anterior cerrado.');
            } catch (err) {
                console.log('Aviso al destruir cliente:', err.message);
            }
        }

        killZombieProcesses();

        // Reiniciar el cliente para generar un nuevo código QR
        setTimeout(() => {
            initClient();
        }, 1500);

        res.json({ success: true, message: 'Sesión cerrada. Generando nuevo código QR...' });
    } catch (e) {
        console.error('❌ Error al desvincular:', e);
        res.status(500).json({ error: e.message || String(e) });
    }
});

// Endpoint de la API REST para enviar mensajes
app.post('/api/enviar', async (req, res) => {
    if (botState.status !== 'READY') {
        return res.status(503).json({ 
            error: 'El bot aún no está listo. Asegurate de escanear el código QR o aguardar a que se conecte a WhatsApp.' 
        });
    }

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

// Levantar el servidor Express de forma inmediata (Always-On)
app.listen(PORT, () => {
    console.log(`🚀 Panel Web y API REST escuchando en http://localhost:${PORT}`);
    console.log(`   Ingresá desde el navegador para ver el estado, escanear el QR o enviar mensajes.`);
});

// Manejador del cliente de WhatsApp
let client = null;

function initClient() {
    botState.status = 'INITIALIZING';
    botState.qrDataUrl = null;
    botState.user = null;

    killZombieProcesses();

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { 
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        }
    });

    client.on('qr', async (qr) => {
        console.log('📲 ESCANEÁ ESTE CÓDIGO QR CON LA APP DE WHATSAPP O DESDE EL PANEL WEB:');
        qrcodeTerminal.generate(qr, { small: true });

        try {
            botState.qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
            botState.status = 'QR_READY';
        } catch (err) {
            console.error('Error generando QR para la web:', err);
        }
    });

    client.on('authenticated', () => {
        console.log('🔐 Sesión autenticada correctamente.');
        botState.status = 'AUTHENTICATING';
        botState.qrDataUrl = null;
    });

    client.on('auth_failure', (msg) => {
        console.error('❌ Fallo de autenticación en WhatsApp:', msg);
        botState.status = 'DISCONNECTED';
        botState.qrDataUrl = null;
    });

    client.on('ready', async () => {
        console.log('✅ ¡WhatsApp conectado exitosamente!');
        botState.status = 'READY';
        botState.qrDataUrl = null;
        
        let nombreUsuario = 'Conectado';
        try {
            if (client.info) {
                nombreUsuario = client.info.pushname || client.info.wid?.user || 'Conectado';
            }
        } catch (e) {}
        botState.user = nombreUsuario;

        if (DESTINATARIOS.length === 0) {
            console.log('\n⚠️ ATENCIÓN: No configuraste ningún WHATSAPP_GRUPO_ID en tu archivo .env');
            console.log('Para averiguar el ID de tu grupo, mandá el mensaje "!vincular" adentro del chat.');
            console.log('El bot está escuchando ahora mismo...\n');
        } else {
            console.log(`📡 Destinatarios configurados: ${DESTINATARIOS.length}`);
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
        botState.status = 'DISCONNECTED';
        botState.qrDataUrl = null;
        botState.user = null;

        console.log('Reintentando conexión automáticamente en 5 segundos...');
        setTimeout(() => {
            initClient();
        }, 5000);
    });

    client.initialize();
}

// Iniciar el cliente de WhatsApp por primera vez
initClient();

// Manejo global para evitar caídas del servidor web
process.on('uncaughtException', (err) => {
    console.error('⚠️ Aviso del sistema (uncaughtException):', err.message || err);
    if (botState.status !== 'READY') {
        botState.status = 'INITIALIZING';
        botState.qrDataUrl = null;
        setTimeout(() => {
            initClient();
        }, 4000);
    }
});

process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Aviso del sistema (unhandledRejection):', reason);
});

// Manejo de cierre limpio (Evita que queden procesos zombis de Chrome al apretar Ctrl+C)
process.on('SIGINT', async () => {
    console.log('\n⚠️ Apagando el bot de forma segura (cerrando Chrome)...');
    try {
        if (client) await client.destroy();
        console.log('✅ Navegador cerrado correctamente.');
    } catch (e) {}
    process.exit(0);
});

process.on('SIGTERM', async () => {
    try {
        if (client) await client.destroy();
    } catch (e) {}
    process.exit(0);
});
