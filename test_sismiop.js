const https = require('https');

function makeRequest(kdKec, kdKel) {
    const boundary = '----WebKitFormBoundary12345';
    let body = `--${boundary}\r\nContent-Disposition: form-data; name="KD_PROPINSI"\r\n\r\n35\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="KD_DATI2"\r\n\r\n75\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="KD_KECAMATAN"\r\n\r\n${kdKec}\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="KD_KELURAHAN"\r\n\r\n${kdKel}\r\n`;
    body += `--${boundary}--\r\n`;

    const options = {
        hostname: 'bapenda.pasuruankota.go.id',
        port: 5151,
        path: '/sismiop/sig_api/GetsPublicData/jenisTanah',
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': Buffer.byteLength(body),
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log(`Kec: ${kdKec}, Kel: ${kdKel} -> Status: ${res.statusCode}, Length: ${data.length}, Data: ${data.substring(0, 100)}`));
    });
    req.on('error', e => console.error(e));
    req.write(body);
    req.end();
}

// Test with full code vs empty kelurahan
makeRequest('010', '001'); // Specific Kelurahan
makeRequest('', '');       // All?
