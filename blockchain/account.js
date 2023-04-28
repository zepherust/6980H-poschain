/*
Mimic merkel tree
need to record others balance
*/

class Account {
  constructor() {
    // genesis public key
    this.addresses = [
      '162fb44c8fb1c344ddd3091b11be2b0a60c1da373e4cd3eec33dac0c7caa3cbe'
    ];
    this.balance = {
      '162fb44c8fb1c344ddd3091b11be2b0a60c1da373e4cd3eec33dac0c7caa3cbe':1000
    };
  }

  initialize(address) {
    if (this.balance[address] == undefined) {
      this.balance[address] = 0;
      this.addresses.push(address);
    }
  }

  transfer(from, to, amount) {
    this.initialize(from);
    this.initialize(to);
    this.increment(to, amount);
    this.decrement(from, amount);
  }

  increment(to, amount) {
    this.balance[to] += amount;
  }

  decrement(from, amount) {
    this.balance[from] -= amount;
  }

  getBalance(address) {
    this.initialize(address);
    return this.balance[address];
  }

  update(transaction) {
    let amount = transaction.output.amount;
    let from = transaction.input.from;
    let to = transaction.output.to;
    this.transfer(from, to, amount);
  }
  // transfer fee to the miner
  // CORE REWARD
  transferFee(block, transaction) {
    let amount = transaction.output.fee;
    let from = transaction.input.from;
    let to = block.validator;
    this.transfer(from, to, amount);
  }

}

module.exports = Account;