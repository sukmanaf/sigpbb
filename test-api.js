const https = require('https');

const SISMIOP_API_URL = 'https://bapenda.pasuruankota.go.id:5151/sismiop/sig_api';
const nop = '35.75.030.005.012.0023.0'; // From image

function makeHttpsRequest(url, nop) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const body = `--${boundary}\r\nContent-Disposition: form-data; name="NOP"\r\n\r\n${nop}\r\n--${boundary}--\r\n`;

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname,
            method: 'POST',
            rejectUnauthorized: false, // Ignore SSL certificate errors
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

makeHttpsRequest(`${SISMIOP_API_URL}/GetsPublicData/InformasiOp`, nop)
    .then(console.log)
    .catch(console.error);
