
const express = require("express");
const Blockchain = require("../blockchain/blockchain");
const bodyParser = require("body-parser");
const P2Pserver = require("../app/p2p-server");
const Wallet = require("../wallet/wallet");
const TransactionPool = require("../wallet/transaction-pool");
const { TRANSACTION_THRESHOLD } = require("../config");

const HTTP_PORT = 3000;

const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();
const wallet = new Wallet("LiFeihong6980H",blockchain);

const transactionPool = new TransactionPool();
const p2pserver = new P2Pserver(blockchain, transactionPool, wallet);

app.get("/ico/transactions", (req, res) => {
  res.json(transactionPool.transactions);
});

app.get("/ico/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/ico/transact", (req, res) => {
  /*
  How to do ICO is a economy problem, just simply split money to 3 different wallet
  So after genesis block, there is ICO block
  */
  const { to, amount, type } = req.body;
  const transaction = wallet.createTransaction(
    to,
    amount,
    type,
    blockchain,
    transactionPool
  );
  console.log(`Send ${amount} , type: ${type} , to ${to}`);
  p2pserver.broadcastTransaction(transaction);
  // JUDGEMENT CRITERIA
  if (transactionPool.transactions.length >= TRANSACTION_THRESHOLD) {
    let block = blockchain.addBlock(transactionPool.transactions,wallet);
    p2pserver.broadcastBlock(block);
  }
  res.redirect("/ico/transactions");
});

app.get("/ico/public-key", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get("/ico/balance", (req, res) => {
  res.json({ balance: blockchain.getBalance(wallet.publicKey) });
});

app.post("/ico/balance-of", (req, res) => {
  res.json({ balance: blockchain.getBalance(req.body.publicKey) });
});

app.listen(HTTP_PORT, () => {
  console.log(`Listening on port ${HTTP_PORT}`);
});

p2pserver.listen();