const ChainUtil = require('../util/chain-util');
const Transaction = require('./transaction');

/*
For test purpose
*/
const {INITAL_BALANCE} = require('../config');


class Wallet {
  /*
  Wallet object, contains 
    the balance(is different to traditional blockchain, to simplify the problem),
    keypair: private key
    publickey: create by 

  */
  constructor(secret,blockchain) {
    // for test
    this.balance = this.getBalance(blockchain);
    this.keyPair = ChainUtil.genKeyPair(secret);
    // this public key is just a string like 
    this.publicKey = this.keyPair.getPublic("hex");
  }

  toString() {
    return `Wallet - 
        publicKey: ${this.publicKey.toString()}
        balance  : ${this.balance}`;
  }

  sign(dataHash){
    /*
    sign the hashed data
    input:
      hashed data
    output:
      hex string signature
    */
    return this.keyPair.sign(dataHash).toHex();
  }

  // get balance of this account
  getBalance(blockchain) {
    console.log("Search your balance...");
    return blockchain.getBalance(this.getPublicKey());
    
    
  }

  getPublicKey() {
    return this.publicKey;
  }

  // create transaction
  createTransaction(to, amount, type, blockchain, transactionPool) {
    this.balance = this.getBalance(blockchain);
    if (amount > this.balance) {
      console.log(
        `Amount: ${amount} exceeds the current balance: ${this.balance}`
      );
      return;
    }
    let transaction = Transaction.newTransaction(this, to, amount,type);
    transactionPool.addTransaction(transaction);
    return transaction;
  }



}

module.exports = Wallet;

