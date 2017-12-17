# My first ÐApp

This is a small Solidity Smart Contract meant to run on Ethereum blockchain that I wrote out of curiosity.

## Running the Smart contract and its UI

* Download (`npm install -g gagnache-cli`) Ganache and run it on the (default) port 8545 `> gagnache-cli` (Ganache is a local test/debug ethereum blockchain).
* Download Truffle (`npm install -g truffle`) and run `> truffle compile` and `> truffle migrate` to deploy the contract on the Ganache blockchain.
* Run the tests with `> truffle test` they should pass at this point.
* Start a local server for the UI running `npm run dev` inside `/app`.
* Browse [http://localhost:8080](http://localhost:8080).

----

### Useful links:
* [First followed tutorial](https://medium.com/@ConsenSys/a-101-noob-intro-to-programming-smart-contracts-on-ethereum-695d15c1dab4).
* [Solidity docs](http://solidity.readthedocs.io).
* [Truffle docs](http://truffleframework.com/docs/getting_started/testing)

### Remaining work
* Add more tests especially on the `require()` edge case rejections.
* Deploy it on a testNet like.
* Deploy it on the MainNet.
* ...
* Profit.

### Remaining interrogations
* If `require()` has the benefit of returning the exeeding gaz what is the point of using assetions like `if (msg.sender != organizer) { return; }` ?
* Dynamic array size and manipulations vs Mapping needs to be dug.