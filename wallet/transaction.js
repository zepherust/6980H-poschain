
const ChainUtil = require("../util/chain-util");
const { TRANSACTION_FEE } = require("../config");
const { TRANSACTION_FEE_RATIO } = require("../config");


class Transaction {
  // Transaction object
  constructor() {
    /*
    4 major field consists of Transaction object
    id: unique id
    type: generally 4 types of transaction
      1. stake
      2. transaction
    input: timestamp, sender public key and signature 
    */
    this.id = ChainUtil.id();
    this.type = null;
    this.input = null;
    this.output = null;
  }

  static newTransaction(senderWallet, to, amount, type) {
    if (amount + TRANSACTION_FEE > senderWallet.balance) {
      console.log(`Not enough balance`);
      return;
    }

    return Transaction.generateTransaction(senderWallet, to, amount, type);
  }

  static generateTransaction(senderWallet, to, amount, type) {
    // generate the transaction
    /*
    input: 
      senderWallet: wallet object
      to: to address(public key)
      amount: how much money send
      type: the type of transaction
    output:
      Transaction object

    */
    const transaction = new this();
    transaction.type = type;
    // depends on what kinds of transactions
    let fee;
    switch(type){
      case "STAKE":
        fee = amount;
        break;
      case "TRANSACTION":
      // in this simple case, we just use integer
        fee = Math.floor(amount/TRANSACTION_FEE_RATIO);
        break;
    }
    // if the transaction is stake, to = "0"

    transaction.output = {
      to: to,
      amount: amount - fee,
      fee: fee
    };
    // sign the signature, put in the output field
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }


  static signTransaction(transaction, senderWallet) {
    /* sign the transaction, noted that sender sign the transaction output field out transaction
    input:
      transaction: Transaction object
      senderWallet: wallet object of sender
    output:
      none
    */
    transaction.input = {
      timestamp: Date.now(),
      from: senderWallet.publicKey,
      // sign the output 
      signature: senderWallet.sign(ChainUtil.hash(transaction.output))
    };
  }

  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.from,
      transaction.input.signature,
      ChainUtil.hash(transaction.output)
    );
  }
}

module.exports = Transaction;