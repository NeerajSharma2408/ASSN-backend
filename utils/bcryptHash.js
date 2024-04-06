const bcrypt = require('bcrypt');
const saltRounds = Number(process.env.SALT_ROUNDS) || 2;

const getHash = async (plaintextPassword) => {
    // ASYNC APPROACH
    return new Promise((resolve, reject)=>{
    bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
        if(err){
            reject(`INTERNAL HASHING ERROR: ${err}`)
        }
        resolve(hash?.toString());
        console.log(hash?.toString())
    });});

    // SYNC APPROACH
    // const hash = bcrypt.hashSync(plaintextPassword, saltRounds);
    // return (hash).toString() ?? new Error(`INTERNAL HASHING ERROR: ${hash}`) 
};

const verifyHash = async (hashPassword, plaintextPassword) => {
    // ASYNC APPROACH
    return new Promise((resolve, reject)=>{
    bcrypt.compare(plaintextPassword, hashPassword, function(err, result) {
        if(err){
            reject(`INTERNAL HASHING ERROR: ${err}`)
        }
        resolve(result);
    });});

    // SYNC APPROACH
    // const result = bcrypt.compareSync(plaintextPassword, hashPassword);
    // return result ?? new Error(`INTERNAL HASHING ERROR: ${hash}`); 
}

module.exports = { getHash, verifyHash }