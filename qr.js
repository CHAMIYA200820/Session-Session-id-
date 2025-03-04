const { exec } = require("child_process");
const { upload } = require('./mega');
const express = require('express');
let router = express.Router();
const pino = require("pino");
let { toBuffer } = require("qrcode");
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");

const MESSAGE = process.env.MESSAGE || `
*𝙋𝙄𝙉𝙆 𝙌𝙐𝙀𝙀𝙉 𝙈𝘿 𝙒𝙝𝙖𝙨 𝙖𝙥𝙥 𝘽𝙊𝙏 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 SUCCESSFULY* ✅

*Gɪᴠᴇ ᴀ ꜱᴛᴀʀ ᴛᴏ ʀᴇᴘᴏ ꜰᴏʀ ᴄᴏᴜʀᴀɢᴇ* 🌟
*Sᴜᴘᴘᴏʀᴛ channel ꜰᴏʀ ϙᴜᴇʀʏ* 💭
:- https://whatsapp.com/channel/0029Vb0rCUr72WU3uq0yMg42

*Yᴏᴜ-ᴛᴜʙᴇ ᴛᴜᴛᴏʀɪᴀʟꜱ* 🪄 
:- https://youtube.com/@pinkqueenmd?si=1rET_h_GijRWIryA

*𝘾𝙊𝙉𝙏𝘼𝘾𝙏 𝙈𝙀*
:- https://wa.me/94783314361

*𝗣𝗜𝗡𝗞 𝗤𝗨𝗘𝗘𝗡 𝗠𝗗-WHATTSAPP-BOT* 🥀
`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    const { default: SuhailWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason } = require("@whiskeysockets/baileys");

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys');

        try {
            let Smd = SuhailWASocket({
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
                auth: state
            });

            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) {
                    if (!res.headersSent) {
                        res.setHeader('Content-Type', 'image/png');
                        try {
                            const qrBuffer = await toBuffer(qr);
                            res.end(qrBuffer);
                            return;
                        } catch (error) {
                            console.error("Error generating QR Code buffer:", error);
                            return;
                        }
                    }
                }

                if (connection === "open") {
                    await delay(3000);
                    let user = Smd.user.id;

                    // ✅ **Session ID එකේ මුලට "PINk QUEEN MD -" එකතු කරයි**
                    function randomMegaId(length = 6, numberLength = 4) {
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        let result = '';
                        for (let i = 0; i < length; i++) {
                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                        return `PINk QUEEN MD - ${result}${number}`;
                    }

                    const auth_path = './auth_info_baileys/';
                    const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);

                    const Scan_Id = `PINk QUEEN MD - ${mega_url.replace('https://mega.nz/file/', '')}`;

                    console.log(`
====================  SESSION ID  ==========================                   
SESSION-ID ==> ${Scan_Id}
-------------------   SESSION CLOSED   -----------------------
`);

                    // ✅ **Send Image Before Session ID**
                    let imageMessage = await Smd.sendMessage(user, { 
                        image: { url: "https://raw.githubusercontent.com/chamindu20081403/Chaminduimgandsanda/refs/heads/main/High%20contrast%2C%20low-key%20lighting.jpg" }, 
                        caption: "PINk QUEEN MD 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 SUCCESSFULLY ✅"
                    });

                    // ✅ **Send Session ID (Reply to Image)**
                    let sessionMessage = await Smd.sendMessage(user, { text: Scan_Id }, { quoted: imageMessage });

                    // ✅ **Send Main MESSAGE (Reply to Session ID)**
                    await Smd.sendMessage(user, { text: MESSAGE }, { quoted: sessionMessage });

                    await delay(1000);
                    try { await fs.emptyDirSync(__dirname + '/auth_info_baileys'); } catch (e) { }
                }

                Smd.ev.on('creds.update', saveCreds);

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
                        process.exit(0);
                    }
                }
            });

        } catch (err) {
            console.log(err);
            exec('pm2 restart qasim');
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
        }
    }

    SUHAIL().catch(async (err) => {
        console.log(err);
        await fs.emptyDirSync(__dirname + '/auth_info_baileys');
        exec('pm2 restart qasim');
    });

    return await SUHAIL();
});

module.exports = router;
