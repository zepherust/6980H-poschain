// This module is about block
// 

const ChainUtil = require('../util/chain-util');


class Block {
  /*
  THe basic block consists of :
    time stamp: when the block created
    lasthash: previous block hash
    hash: the hash of this block
    data: data(transactions)
    validator: who(public key) sign the block
    signature: signature of this block

  */
  constructor(timestamp, lastHash, hash, data, validator, signature) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.validator = validator;
    this.signature = signature;
  }

  toString() {
    return `Block - 
        Timestamp : ${this.timestamp}
        Last Hash : ${this.lastHash}
        Hash      : ${this.hash}
        Data      : ${this.data}
        Validator : ${this.validator}
        Signature : ${this.signature}`;
  }

  static genesis() {
    /*
    the very first block(burn in)
    output:
      block object
    */

    return new this(`genesis time`, "----", "genesis-hash", [], 
      '162fb44c8fb1c344ddd3091b11be2b0a60c1da373e4cd3eec33dac0c7caa3cbe', //LiFeihong6980H 
      '0685626CAA7D8A236A54E1875692EFF5EE8212A53EAEA011883913FF9699CCDF194598618DA72087629785BB6C4BE4F23D4BDA63A3EF26DBF1E628A5CA819108');
  }

  // Use hash function to hash block(CORE)
  static blockHash(timestamp,lastHash,data){
    /*
    hash (timestamp+lasthash+data)
    */
        return ChainUtil.hash(`${timestamp}${lastHash}${data}`);
  }

  // Create Block function, take the last block and data
  // data is the transactions
  static createBlock(lastBlock, data, wallet) {
    /*
    input:
      lastBlock: Block object
      data: list of transactions
      wallet: wallet object
    output:
      block object
    */
    let timestamp = Date.now();
    const lastHash = lastBlock.hash;

    const datahash = Block.blockHash(timestamp,lastHash,data);
    console.log(datahash);
    // get the public key
    const publicKey = wallet.getPublicKey();

    // sign the block
    const signature = wallet.sign(datahash);

    return new Block(timestamp, lastHash, datahash, data, publicKey ,signature);
  }

  // verify the leader 
  static verifyLeader(block,validator){
    /*
    input:
      block: block object
      suggestLeader: 
    output:
      boolean result 
    */
    return block.validator == validator;
  }

  static verifyBlock(block){
    /*
    verify the block
    input: 
      block : block object
    output:
      boolean result
    */
    //const datahash = ChainUtil.hash(`${block.timestamp}${block.lastHash}${block.data}`);
    return ChainUtil.verifySignature(
      block.validator,
      block.signature,
      Block.blockHash(block.timestamp,block.lastHash,block.data)
    );
  }

}
module.exports = Block;