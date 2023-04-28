const EDDSA = require('elliptic').eddsa;
const eddsa = new EDDSA('ed25519');
const { v1: uuidv1 } = require('uuid');
const SHA256 = require('crypto-js/sha256');

class ChainUtil {
    // create the secret key based on secret
    static genKeyPair(secret) {
        return eddsa.keyFromSecret(secret);
    }

    // create identity
    static id(){
        return uuidv1();
    }

    // hash function
    static hash(data){
        return SHA256(JSON.stringify(data)).toString();
    }

    // CORE function of signature
    static verifySignature(publicKey,signature,dataHash){
        /*
        verify the hashed data and signature by public key
        input:
            public key: public key (hex value)
            signature: 
            dataHash: hashed data
        output:
            boolean result indicates if the verification succeed or not
        */
        let result = eddsa.keyFromPublic(publicKey).verify(dataHash,signature);
        //console.debug(`Verified: ${result}`);
        return result;
    }
}
module.exports = ChainUtil;