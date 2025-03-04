const express = require('express');
const fs = require('fs-extra');
const { exec } = require("child_process");
let router = express.Router();
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const MESSAGE = process.env.MESSAGE || `
*𝙋𝙄𝙉𝙆 𝙌𝙐𝙀𝙀𝙉 𝙈𝘿 𝙒𝙝𝙖𝙨 𝙖𝙥𝙥 𝘽𝙊𝙏 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 SUCCESSFULY* ✅

*Gɪᴠᴇ ᴀ ꜱᴛᴀʀ ᴛᴏ ʀᴇᴘᴏ ꜰᴏʀ ᴄᴏᴜʀᴀɢᴇ* 🌟
ලින්ක් එක පස්සේ😂🥺
*Sᴜᴘᴘᴏʀᴛ channel ꜰᴏʀ ϙᴜᴇʀʏ* 💭

:- https://whatsapp.com/channel/0029Vb0rCUr72WU3uq0yMg42

*Yᴏᴜ-ᴛᴜʙᴇ ᴛᴜᴛᴏʀɪᴀʟꜱ* 🪄 
:- https://youtube.com/@pinkqueenmd?si=1rET_h_GijRWIryA

*𝘾𝙊𝙉𝙏𝘼𝘾𝙏 𝙈𝙀*
:- https://wa.me/94783314361

*𝗣𝗜𝗡𝗞 𝗤𝗨𝗘𝗘𝗡 𝗠𝗗-WHATTSAPP-BOT* 🥀
`;

const { upload } = require('./mega');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");

// Ensure the directory is empty when the app starts
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

                        // Define randomMegaId function to generate random IDs
                        function randomMegaId(length = 6, numberLength = 4) {
                            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            let result = '';
                            for (let i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                            return `${result}${number}`;
                        }

                        // Upload credentials to Mega
                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const Id_session = mega_url.replace('https://mega.nz/file/', '');

                        // Add "PINK QUEEN MD-" prefix to session ID
                        const Scan_Id = `PINK-QUEEN-MD-${Id_session}`;

                        // Send Image and Session ID
                        let imageMessage = await Smd.sendMessage(user, { 
                            image: { url: "https://raw.githubusercontent.com/chamindu20081403/Chaminduimgandsanda/refs/heads/main/High%20contrast%2C%20low-key%20lighting.%20Warm%20terracotta%20and%20cool%20teal%20tones.%20%20A%20fierce%2C%20graceful%20Pink%20Queen%20with%20rose-gold%20hair%2C%20ethereal%20silk%20gown%2C%20golden%20armor%2C%20and%20pink%20crystal%20staff.%20%20She%20stands%20on%20a%20floating%20kingdom%20against%20a%20pink%20sky.%20Hyperrealistic%2C%20u.jpg" }, 
                            caption: "PINk QUEEN MD 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 SUCCESSFULLY ✅"
                        });

                        let sessionMessage = await Smd.sendMessage(user, { text: Scan_Id }, { quoted: imageMessage });
                        await Smd.sendMessage(user, { text: MESSAGE }, { quoted: sessionMessage });

                        await delay(1000);
                        try { await fs.emptyDirSync(__dirname + '/auth_info_baileys'); } catch (e) {}

                    } catch (e) {
                        console.log("Error during file upload or message send: ", e);
                    }

                    await delay(100);
                    await fs.emptyDirSync(__dirname + '/auth_info_baileys');
                }

                // Handle connection closures
                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection TimedOut!");
                    } else {
                        console.log('Connection closed with bot. Please run again.');
                        console.log(reason);
                        await delay(5000);
                        exec('pm2 restart qasim');
                    }
                }
            });

        } catch (err) {
            console.log("Error in SUHAIL function: ", err);
            exec('pm2 restart qasim');
            console.log("Service restarted due to error");
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
