const dns = require('dns');
const https = require('https');

console.log('--- Custom DNS Test ---');

try {
    console.log('Setting DNS servers to Google (8.8.8.8)...');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('DNS Servers set:', dns.getServers());
} catch (e) {
    console.error('Failed to set DNS servers:', e.message);
}

console.log('Testing lookup for api.cloudinary.com...');
dns.lookup('api.cloudinary.com', (err, address, family) => {
    if (err) {
        console.error('DNS Lookup Failed even with Google DNS:', err);
    } else {
        console.log(`DNS Lookup SUCCESS with Google DNS: ${address}`);
        
        console.log('Attempting simple HTTPS connect to prove connectivity...');
        const req = https.request({
            hostname: 'api.cloudinary.com',
            path: '/v1_1/dov7ose26/ping',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            console.log(`HTTPS Connect Success! Status: ${res.statusCode}`);
        });
        
        req.on('error', (e) => console.error('HTTPS Connect Error:', e.message));
        req.on('timeout', () => { req.destroy(); console.error('HTTPS Timeout'); });
        req.end();
    }
});
