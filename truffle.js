module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "1337" // Match any network id
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "0x876eFa89F781cDac975bcd28290696632B18D88d", // My default adresse on rinkeby
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    }
  }
};
