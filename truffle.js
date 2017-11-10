var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "" ;
var mnemonic = "twelve words you can find in metamask/settings/reveal seed words blabla";

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        ropsten: {
            provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey),
            network_id: 3,
            gas: 500000,
            gasPrice:  20000000000
        }
    }
};