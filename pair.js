const { exec } = require("child_process");
const express = require('express');
const fs = require('fs-extra');
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const { upload } = require('./mega');
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers, DisconnectReason } = require("@whiskeysockets/baileys");
const { toBuffer } = require("qrcode");

const router = express.Router();
const MESSAGE = `
*𝙋𝙄𝙉𝙆 𝙌𝙐𝙀𝙀𝙉 𝙈𝘿 𝙒𝙝𝙖𝙨𝙖𝙥𝙥 𝘽𝙊𝙏 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 SUCCESSFULLY* ✅

💖 *Support Channel:*  
👉 https://whatsapp.com/channel/0029Vb0rCUr72WU3uq0yMg42  

📺 *YouTube Tutorials:*  
👉 https://youtube.com/@pinkqueenmd?si=1rET_h_GijRWIryA  

📩 *Contact Me:*  
👉 https://wa.me/94783314361  

🌟 *𝗣𝗜𝗡𝗞 𝗤𝗨𝗘𝗘𝗡 𝗠𝗗-WHATSAPP-BOT* 🥀
`;

// Clear session directory on startup
if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(`./auth_info_baileys`);
        try {
            let Smd = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!Smd.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Smd.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Smd.ev.on('creds.update', saveCreds);
            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        await delay(10000);
                        if (fs.existsSync('./auth_info_baileys/creds.json'));

                        const auth_path = './auth_info_baileys/';
                        let user = Smd.user.id;

                        function randomMegaId(length = 6, numberLength = 4) {
                            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            let result = '';
                            for (let i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                            return `${result}${number}`;
                        }

                        // Upload session file to Mega
                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const Id_session = mega_url.replace('https://mega.nz/file/', '');

                        // Final session ID with prefix
                        const Scan_Id = `PINk QUEEN MD - ${Id_session}`;

                        // Send a voice message first
                        const voiceMessage = { audio: { url: "https://example.com/futuristic-voice.mp3" }, mimetype: "audio/mp4" };
                        await Smd.sendMessage(user, voiceMessage);

                        // Send an image message next
                        const imageMessage = { image: { url: "https://raw.githubusercontent.com/chamindu20081403/Chaminduimgandsanda/main/image.jpg" }, caption: "🔥 𝙋𝙄𝙉𝙆 𝙌𝙐𝙀𝙀𝙉 𝙈𝘿 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 🔥" };
                        await Smd.sendMessage(user, imageMessage);

                        // Send the session ID
                        let msgsss = await Smd.sendMessage(user, { text: Scan_Id });
                        await Smd.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });

                        await delay(1000);
                        await fs.emptyDirSync(__dirname + '/auth_info_baileys');
                    } catch (e) {
                        console.log("Error: ", e);
                    }

                    await delay(100);
                    await fs.emptyDirSync(__dirname + '/auth_info_baileys');
                }

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection Timed Out!");
                    } else {
                        console.log('Connection closed with bot. Restarting...');
                        await delay(5000);
                        exec('pm2 restart qasim');
                    }
                }
            });

        } catch (err) {
            console.log("Error: ", err);
            exec('pm2 restart qasim');
            SUHAIL();
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
            if (!res.headersSent) {
                await res.send({ code: "Try After Few Minutes" });
            }
        }
    }

    await SUHAIL();
});

module.exports = router;
