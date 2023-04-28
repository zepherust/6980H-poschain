
class Stake {
  constructor() {
    this.addresses = [
    '162fb44c8fb1c344ddd3091b11be2b0a60c1da373e4cd3eec33dac0c7caa3cbe'
    ];
    this.balance = {
      '162fb44c8fb1c344ddd3091b11be2b0a60c1da373e4cd3eec33dac0c7caa3cbe':0
    };

  }

  // prevent temper by malicious node
  initialize(address) {
    /*
    init the timeer and address
    */
    if (this.balance[address] == undefined) {
      this.balance[address] = 0;
      this.addresses.push(address);
    }
  }

  addStake(from, amount) {
    /*
    Add the stake to become the validator within timer
    */
    this.initialize(from);
    this.balance[from] += amount;
  }

  getStake(address) {
    this.initialize(address);
    return this.balance[address];
  }


  // CORE OF PROOF OF STAKE
  selectLeader(addresses){
    /*
    return the public key of leader to create the block
    input:
      addresses: bunch of public key want to become block creator
    output:
      the creator public key
    */

    return this.getMax(addresses);
  }

  // return the public key of leader
  getMax() {
    /*
    one way to select leader by max stake
    input:
      addresses: public key
    output:
      maxStaker
    */
    let balance = 0;
    let leader = "162fb44c8fb1c344ddd3091b11be2b0a60c1da373e4cd3eec33dac0c7caa3cbe"; // genesis 
    this.addresses.forEach(address => {
      if (this.getStake(address) > balance) {
        leader = address;
      }
    });
    return leader;
  }

  update(transaction) {
    let amount = transaction.output.amount;
    let from = transaction.input.from;
    this.addStake(from, amount);
  }

  // clear the stake for successful elect one leader
  clear(){
    this.addresses = [
    '162fb44c8fb1c344ddd3091b11be2b0a60c1da373e4cd3eec33dac0c7caa3cbe'
    ];
    this.balance = {
      '162fb44c8fb1c344ddd3091b11be2b0a60c1da373e4cd3eec33dac0c7caa3cbe':0
    };

  }
}

module.exports = Stake;