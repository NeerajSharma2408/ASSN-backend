const crypto = require('crypto');

const cryptoHash = (string) => {
    const hash = crypto.createHash('sha256');
    hash.update(string);
    const hashValue = hash.digest('hex');

    return hashValue.toString();
}

module.exports = cryptoHash