const cloudinary = require('./src/config/cloudinary');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  const testFile = path.join(__dirname, 'test.txt');
  fs.writeFileSync(testFile, 'This is a test file for Cloudinary upload.');

  try {
    console.log('Attempting to upload test file...');
    const result = await cloudinary.uploader.upload(testFile, {
      folder: 'test_uploads',
      resource_type: 'auto',
      timeout: 60000
    });
    console.log('Upload successful!');
    console.log('URL:', result.secure_url);
  } catch (error) {
    console.error('Upload failed:', error);
  } finally {
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
  }
}

testUpload();
