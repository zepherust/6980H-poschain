const Transaction = require('./transaction');
const { TRANSACTION_THRESHOLD } = require("../config");

class TransactionPool{
    /*
    Transaction pool to keep the records of transactions, when it hits the TRANSACTION_THRESHOLD,
    election will triggered
    */
    constructor(){
        this.transactions = [];
    }

    addTransaction(transaction) {
    /*
    add transaction to the pool
    input:
        transaction: Transaction object
    output:
        boolean result(if false, which means election will start) 
        
    */
        // promise the tx is valid
        if (!Transaction.verifyTransaction(transaction)){
            console.log(`${transaction.id} is invalid`);
            return false;
        }

        if (this.transactions.length >= TRANSACTION_THRESHOLD) {
            console.log(`The pool size if over ${TRANSACTION_THRESHOLD}`);
            this.transactions.push(transaction);
            return false;
        }
        else{
            console.log(`${transaction.id} added to the pool`);
            this.transactions.push(transaction);
            return true;
            } 
    }

    // verify each transaction, return array of invalid transactions
    validTransactions() {
        return this.transactions.filter(invalidtransaction => {
          if (!Transaction.verifyTransaction(transaction)) {
            console.log(`Invalid signature from ${transaction.data.from}`);
            return;
          }

          // return array of invalid transactions
          return invalidtransaction;
        });
    }

    // judge the transaction exist or not,return boolean
    transactionExists(transaction) {
        let exists = this.transactions.find(t => t.id === transaction.id);
        return exists;
    }

    // once transactions executed, clear the pool
    clear() {
        let end = TRANSACTION_THRESHOLD>this.transactions.length ? this.transactions.length:TRANSACTION_THRESHOLD;
        this.transactions = this.transactions.slice(end);
    }
}

module.exports = TransactionPool;