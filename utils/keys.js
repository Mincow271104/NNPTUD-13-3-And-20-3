/**
 * RS256 Key Pair Generator
 * Tạo RSA key pair và lưu vào thư mục 'keys' để tái sử dụng
 */
let crypto = require('crypto');
let fs = require('fs');
let path = require('path');

let privateKey = null;
let publicKey = null;

let keysDir = path.join(__dirname, '../keys');
let privateKeyPath = path.join(keysDir, 'private.pem');
let publicKeyPath = path.join(keysDir, 'public.pem');

function loadOrGenerateKeys() {
    // Tạo folder nếu chưa có
    if (!fs.existsSync(keysDir)) {
        fs.mkdirSync(keysDir);
    }

    // Nếu đã có sẵn file thì đọc lên
    if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
        privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        publicKey = fs.readFileSync(publicKeyPath, 'utf8');
        console.log('RS256 keys loaded from file');
        return;
    }

    // Nếu chưa có thì generate mới
    let keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    privateKey = keyPair.privateKey;
    publicKey = keyPair.publicKey;

    // Lưu ra file
    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);
    console.log('RS256 key pair generated and saved to keys folder');
}

// Generate/Load keys on module load
loadOrGenerateKeys();

module.exports = {
    getPrivateKey: function () {
        return privateKey;
    },
    getPublicKey: function () {
        return publicKey;
    }
};
