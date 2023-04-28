
const WebSocket = require('ws');

//declare the peer to peer server port 
const P2P_PORT = process.env.P2P_PORT || 5000;

//list of address to connect to
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// create a wallet
const Wallet = require('../wallet/wallet');


const MESSAGE_TYPE = {
chain: 'CHAIN',
transaction: 'TRANSACTION',
stake: 'STAKE',
block: 'BLOCK'
}

class P2Pserver{
    constructor(blockchain,transactionPool,wallet){
        this.blockchain = blockchain;
        this.sockets = [];
        this.transactionPool = transactionPool;
        this.wallet = wallet;
    }

    // create a new p2p server and connections


    listen(){
        // create the p2p server with port as argument
        const server = new WebSocket.Server({ port: P2P_PORT });

        // event listener and a callback function for any new connection
        // on any new connection the current instance will send the current chain
        // to the newly connected peer
        server.on('connection',socket => this.connectSocket(socket));

        // to connect to the peers that we have specified
        this.connectToPeers();

        console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);
    }

    // after making connection to a socket
    connectSocket(socket){
        // push the socket too the socket array
        this.sockets.push(socket);
        console.log("Socket connected");

         // NOTE: Sending whole chain seen by this node
        this.sendChain(socket);

        // Mainly for checking the validation of received chain
        this.messageHandler(socket);
       
    }

    connectToPeers(){
        //connect to each peer
        peers.forEach(peer => {

            // create a socket for each peer
            const socket = new WebSocket(peer);
            
            // open event listner is emitted when a connection is established
            // saving the socket in the array
            socket.on('open',() => this.connectSocket(socket));

            // There should be a chain verification


        });
    }

    // depends on what message send, it can send 
    messageHandler(socket) {
        socket.on("message", message => {
            const data = JSON.parse(message);
            console.log("Recieved data from peer:", data);

            switch (data.type) {
                /*
                4 types of message
                */

                case MESSAGE_TYPE.chain:
                // if hear the chain, check
                  this.blockchain.replaceChain(data.chain);
                  break;

                case MESSAGE_TYPE.transaction:

                    // first to verify is the id exist
                    if (!this.transactionPool.transactionExists(data.transaction)) {

                        // transaction_stats indicates whether the transaction pool is full
                        let transaction_stats = this.transactionPool.addTransaction(data.transaction);
                        this.broadcastTransaction(data.transaction);

                        // TRIGGER MINING PROCESS
                        if (!transaction_stats || Date.now() > this.blockchain.electionTime){

                            // if no miner
                            if(this.blockchain.getLeader() == "162fb44c8fb1c344ddd3091b11be2b0a60c1da373e4cd3eec33dac0c7caa3cbe"){
                                console.log("No miner right now");
                                break;
                            }

                            // CORE: if time is not up , and leader needs to create the block
                            if (this.blockchain.getLeader() == this.wallet.getPublicKey() && Date.now() > this.blockchain.electionTime ) {
                                    console.log("creating the block");
                                    let block = this.blockchain.addBlock(this.transactionPool.transactions, this.wallet);
                                    this.broadcastBlock(block);

                                }
                            }
                        // transaction pool not full
                        else{
                            console.log(`transaction: ${data.transaction.id} add to the pool`);
                            }
                        }

                    // if the transaction exists in the pool
                    else{console.log(`${data.transaction.id} existed`);}
                    break;

                case MESSAGE_TYPE.stake:
                    if (!this.transactionPool.transactionExists(data.transaction)){
                        // election time 
                        //destination is "0"
                        //stake value is larger than 0
                        let transaction_stats = this.transactionPool.addTransaction(data.transaction);
                        this.broadcastTransaction(data.transaction);

                        // 3 criteria to meet:
                        /*
                            1. in election time
                            2. destination == "0"
                            3. stake fee >0
                        */
                        if(this.blockchain.electionTime > Date.now() && data.transaction.output.to == "0" && data.transaction.output.fee>0){
                            this.blockchain.stakes.address.push(data.transaction.input.from); // add to candidate validator pool
                            this.blockchain.stakes.addStake(data.transaction.input.from, data.transaction.output.fee); // add your stake value
                            
                        }
                        else{
                            console.log("Invalid stake message");
                        }
                    }
                    break;

                case MESSAGE_TYPE.block:
                    console.log(data.block);
                    if (this.blockchain.isValidBlock(data.block)) {
                        this.blockchain.executeBlock(data.block);
                        this.transactionPool.clear();
                        this.broadcastBlock(data.block);
                    }
                    break;
                
            }; 
        });
    }

    // Sending the whole chain
    sendChain(socket){
        /*
        jsonify the chain
        */
        socket.send(JSON.stringify({
            type: MESSAGE_TYPE.chain,
            chain: this.blockchain.chain})
        );
    }

    // Synchronize the chain
    syncChain(){
        /*
        get the longest chain
        */
        this.sockets.forEach(socket =>{
            this.sendChain(socket);
        });
        
    }

    // broad the transaction
    broadcastTransaction(transaction){
        this.sockets.forEach(socket =>{
            this.sendTransaction(socket,transaction);
        });
    }

    // send transaction 
    sendTransaction(socket,transaction){
        socket.send(JSON.stringify({
            type: MESSAGE_TYPE.transaction,
            transaction: transaction})
        );
    }

    broadcastBlock(block) {
        this.sockets.forEach(socket => {
            this.sendBlock(socket, block);
            });
    }

    sendBlock(socket,block){
        socket.send(
            JSON.stringify({
                type: MESSAGE_TYPE.block,
                block: block
            })
        );
    }

    sendStake(socket,transaction){
        /*
        just sending the stake type transaction
        */
        socket.send(JSON.stringify({
            type:MESSAGE_TYPE.stake,
            transaction:transaction
            })
        );
    }

    broadcastStake(transaction){
        this.sockets.forEach(socket => {
            this.sendBlock(socket, transaction);
        });
    }

}

module.exports = P2Pserver;