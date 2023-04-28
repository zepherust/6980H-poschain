const express = require('express');
const Blockchain = require('../blockchain/blockchain');
const bodyParser = require('body-parser');
const P2PServer = require('./p2p-server.js');
const Wallet = require('../wallet/wallet');
const TransactionPool = require('../wallet/transaction-pool');

// create a new blockchain instance
const blockchain = new Blockchain();

// create a new wallet
const wallet = new Wallet(Date.now().toString(),blockchain);
// Date.now() is used create a random string for secret

// decentralized and synchronized using the peer to peer server
const transactionPool = new TransactionPool();

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;

//create a new app
const app  = express();

//using the blody parser middleware
app.use(bodyParser.json());



// create a new p2p server
const p2pserver = new P2PServer(blockchain,transactionPool,wallet);

//EXPOSED APIs
//----------------------------------------------------
//API to get the blocks
app.get('/blocks',(req,res)=>{
    res.json(blockchain.chain);

});

//API to add blocks
/*
    For every time there is a post, every node should sync the block
*/

// mine the block should stake first
app.post('/mine',(req,res)=>{
    /*
    FORMAT FOR REQUEST:
        to: "0",
        amount: put stake coins to mine
        type: STAKE
    */
    // you need to stake the fee more than the max fee right now
    p2pserver.syncChain();
    console.log("sync successful");

    fee = req.body.amount;
    blockchain.stakes.addStake(wallet.getPublicKey(),fee);
    console.log(`Stake ${fee} coins to mining the block...`);

    const {to,amount,type} = req.body;
    const transaction = wallet.createTransaction(
     to, amount, type, blockchain, transactionPool);

    p2pserver.broadcastTransaction(transaction);
    res.redirect("/transactions");

    
});
// api to view transaction in the transaction pool
app.get('/transactions',(req,res)=>{
    res.json(transactionPool.transactions);
});

// create transactions
app.post("/transact", (req, res) => {
    const { to, amount, type } = req.body;
    const transaction = wallet.createTransaction(
     to, amount, type, blockchain, transactionPool);

    p2pserver.broadcastTransaction(transaction);
    res.redirect("/transactions");
});

// get the public key
app.get('/wallet',(req,res)=>{
    res.json({
        publicKey:wallet.getPublicKey(),
        balance: wallet.getBalance(blockchain)
    });
});

app.get('/balance',(req,res)=>{
    res.json({
        balance: wallet.getBalance(blockchain)
    });
});

// app server configurations
app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
});



//starts the p2pserver
p2pserver.listen();