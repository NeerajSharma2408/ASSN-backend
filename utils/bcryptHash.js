const bcrypt = require('bcrypt');
const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

const getHash = async (plaintextPassword) => {
    // return new Promise((resolve, reject)=>{
    // bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
    //     if(err){
    //         reject(`INTERNAL HASHING ERROR: ${err}`)
    //     }
    //     resolve(hash?.toString());
    //     console.log(hash?.toString())
    // });});

    const hash = bcrypt.hashSync(plaintextPassword, saltRounds);
    return (hash).toString() ?? new Error(`INTERNAL HASHING ERROR: ${hash}`) 
};

const verifyHash = async (hashPassword, plaintextPassword) => {
    // return new Promise((resolve, reject)=>{
    // bcrypt.compare(plaintextPassword, hashPassword, function(err, result) {
    //     if(err){
    //         reject(`INTERNAL HASHING ERROR: ${err}`)
    //     }
    //     resolve(result);
    // });});

    const result = bcrypt.compareSync(plaintextPassword, hashPassword);
    return result ?? new Error(`INTERNAL HASHING ERROR: ${hash}`); 
}

module.exports = { getHash, verifyHash }