const bcrypt = require('bcrypt');
const saltRounds = process.env.SALT_ROUNDS || 10;

const getHash = async (plaintextPassword) => {
    return new Promise((resolve, reject)=>{
    bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
        if(err){
            reject(`INTERNAL HASHING ERROR: ${err}`)
        }
        resolve(hash.toString())
    });});
};

const verifyHash = async (hashPassword, plaintextPassword) => {
    return new Promise((resolve, reject)=>{
    bcrypt.compare(plaintextPassword, hashPassword, function(err, result) {
        if(err){
            reject(`INTERNAL HASHING ERROR: ${err}`)
        }
        resolve(result)
    });});
}

module.exports = { getHash, verifyHash }