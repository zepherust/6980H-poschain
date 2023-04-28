// This is module about chain

const Block = require('./block');
const Account = require('./account');
const Stake = require('./stake');
const Validators = require('./validators');
const {ELECTION_TIME} = require('../config')

const TRANSACTION_TYPE = {
chain: 'CHAIN',
transaction: 'TRANSACTION',
stake: 'STAKE',
block: 'BLOCK'
}

class Blockchain{
    /*
    By the reference of paper, within timer, by the distribution of stake, the waiting time should be different
    original paper just set the waiting time forcefully, more stake, less waiting time
    */
    constructor(){
        this.chain = [Block.genesis()];
        this.accounts = new Account();
        this.stakes = new Stake();
        this.validators = new Validators();
        this.electionTime = Date.now() + ELECTION_TIME; // election end time
    }


    timer(){
        return;
    }

    addBlock(transactions,wallet){
        /*
        CORE FUNCTION OF CREATOR
        input : 
            transactions: transaction in the pool
            wallet: validator, wallet object, so must be yourself
        return : 
            boolean result
        */
        const block = Block.createBlock(this.chain[this.chain.length-1],transactions,wallet);
        // THIS STEP IS IMPORTANT
        const new_block = this.executeBlock(block);
        return new_block;
    }

    createBlock(transactions, wallet) {
        // CORE OF POS
        /*
        input: 
            transactions: bunch of transactions
            wallet: wallet object
        output:
            block object

        */
        const block = Block.createBlock(
            this.chain[this.chain.length - 1],
            transactions,
            wallet
        );
      return block;
    }

    // Create the hash of block (To future verified)
    static blockHash(block){
        const { timestamp, lastHash, data } = block;
        return Block.blockHash(timestamp,lastHash,data);
    }

    // Verify if the block we adding is valid(not tempered)
    isValidChain(chain){
    /*
    Check if the chain is valid by loop, which means check every block in the chain,complexity = O(n);
    input:
        chain: list of block object
    output:
        boolean result
    */
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;
        // loop to check the whole chain
        for(let i = 1 ; i<chain.length; i++){
            const block = chain[i];
            if (!isValidBlock(block)){
                
                return false;
            }
        }

        return true;

    }

    // check if the block valid
    isValidBlock(block) {
        const lastBlock = this.chain[this.chain.length - 1];
      /**
       * check hash
       * check last hash
       * check signature
       * check leader
       */
        if (
            block.lastHash === lastBlock.hash &&
            block.hash === Blockchain.blockHash(block) &&
            Block.verifyBlock(block) &&
            Block.verifyLeader(block, this.getLeader())
        ) {
            return true;
        } else {

            return false;
        }
    }

    // If the receive chain is longer than the present chain, need to replace
    replaceChain(newChain){
        if(newChain.length <= this.chain.length){
            console.log("Received chain is not longer than the current chain");
            return;
        }else if(!this.isValidChain(newChain)){
            console.log("Received chain is invalid");
            return;
        }
        
        console.log("Replacing the current chain with new chain");
        this.chain = newChain; 
    }

    // Use public key to find balance
    getBalance(publicKey){
        return this.accounts.getBalance(publicKey);
    }

    // return the max stake leader
    getLeader() {

        /*
        CORE: base on the stakes to find out the leader when time is up 

        */
        return this.stakes.selectLeader(this.validators.list);
    }

    // CORE OF BLOCK CHAIN
    executeTransactions(block) {
        /*
        Once receive the block, execute the block data(transactions), confirm the transaction,
        update the blockchain had by now
        input:
            block: block object(JSON)
        output:
            none
        */
        block.data.forEach(transaction => {
            // for each transaction, function on different types of msg
            switch (transaction.type) {
                case TRANSACTION_TYPE.transaction:
                    this.accounts.update(transaction);
                    this.accounts.transferFee(block, transaction);
                    break;
                case TRANSACTION_TYPE.stake:
                    this.stakes.update(transaction);
                    this.accounts.decrement(
                        transaction.input.from,
                        transaction.output.fee
                    );
                    break;
            }
        });

    }

    executeBlock(block){
        /*
        When receive block,
        1. verify
        2. add to block chain
        */
        const {timestamp,
            lastHash,
            hash,
            data,
            validator,
            signature} = block;
        let new_block = new Block(timestamp,lastHash,hash,data,validator,signature);
        //console.log(new_block);
        if(Block.verifyBlock(new_block)){
            this.chain.push(new_block);
            console.log(`Block added, from: ${block.validator}`);
            this.executeTransactions(block);
            console.log(`Block ${timestamp} sync completed`);
            this.electionTime = block.timestamp+ELECTION_TIME; // sync the time
            this.stakes.clear();
            
            return new_block;
        }
        else{
            console.log("Invalid block");
            return;
        }
    }


}

module.exports = Blockchain;