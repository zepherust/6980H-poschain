
class Validators {
  constructor() {
    this.list = [
      
    ];

  }

  // transact to specified address to become validator
  update(transaction) {
    /*
    transfer to address is "0", get burn
    input:
      transaction: transaction objet(json)
    output:
      boolean result

    */
    if (transaction.to == "0") {
      this.list.push(transaction.from);
      console.log(`${transaction.from} want become validator`);
      return true;
    }
    return false;
  }

  // clear the validator list when leader successful elected
  clear(){
    this.list = [];
    this.startTime = Date.now();
  }

  // validate
}

module.exports = Validators;