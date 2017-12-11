var ethereumjsWallet = require('ethereumjs-wallet');
var ProviderEngine = require("web3-provider-engine");
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
var Web3 = require("web3");
var FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');

// Infura API KEY
var apiKey = '';

// create wallet from existing private key
var privateKey = '';
var wallet = ethereumjsWallet.fromPrivateKey(new Buffer(privateKey, "hex"));
var address = "0x" + wallet.getAddress().toString("hex");

// using ropsten testnet
var providerUrl = "https://ropsten.infura.io/" + apiKey;
var engine = new ProviderEngine();

// filters
engine.addProvider(new FilterSubprovider());
engine.addProvider(new WalletSubprovider(wallet, {}));
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl)));
engine.start(); // Required by the provider engine.

// using mainnet
var mainProviderUrl = "https://mainnet.infura.io/" + apiKey;
var mainEngine = new ProviderEngine();

// filters
mainEngine.addProvider(new FilterSubprovider());
mainEngine.addProvider(new WalletSubprovider(wallet, {}));
mainEngine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(mainProviderUrl)));
mainEngine.start(); // Required by the provider engine.

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*", // Match any network id
            gas: 4000000,
            gasPrice:  20000000000
        },
        ganache: {
            host: "localhost",
            port: 8545,
            network_id: 42,
            gas: 6500000,
            gasPrice:  20000000000
        },
      ropsten: {
        network_id: 3,
        gas: 4700000,
        gasPrice:  20000000000,
        provider: engine, // Use our custom provider
        from: address     // Use the address we derived
      },
      main: {
        network_id: 1,
        gas: 4700000,
        gasPrice:  20000000000,
        provider: mainEngine, // Use our custom provider
        from: address     // Use the address we derived
      }
    }
};
