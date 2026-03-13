/**
 * RS256 Key Pair Generator
 * Tạo RSA key pair mỗi lần khởi động server (key mới = token cũ invalid)
 */
let crypto = require('crypto');

let privateKey = null;
let publicKey = null;

function generateKeys() {
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
    console.log('RS256 key pair generated successfully');
}

// Generate keys on module load
generateKeys();

module.exports = {
    getPrivateKey: function () {
        return privateKey;
    },
    getPublicKey: function () {
        return publicKey;
    }
};
