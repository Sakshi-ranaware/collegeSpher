const https = require('https');
const dns = require('dns');

console.log('--- Network Diagnostic Test ---');

// 1. DNS Lookup
console.log('1. Testing DNS lookup for api.cloudinary.com...');
dns.lookup('api.cloudinary.com', (err, address, family) => {
  if (err) {
    console.error('DNS Lookup Failed:', err);
  } else {
    console.log(`DNS Lookup Successful: ${address} (Family: ${family})`);
    
    // 2. HTTPS Connection
    console.log('2. Testing HTTPS connection to api.cloudinary.com...');
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: '/v1_1/dov7ose26/ping', // Just a test path
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      console.log(`HTTPS Connection Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      res.on('data', (d) => {
        // console.log(d.toString());
      });
    });

    req.on('error', (e) => {
      console.error('HTTPS Connection Error:', e);
    });

    req.setTimeout(5000, () => {
        console.error('HTTPS Connection Timed out after 5s');
        req.destroy();
    });

    req.end();
  }
});
