const Web3 = require('web3')
const web3 = new Web3()

var Owned = artifacts.require("./Owned.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var PreSell = artifacts.require("./PreSell.sol");

module.exports = function(deployer) {
  deployer.deploy(Owned);
  deployer.link(Owned, PreSell);
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, PreSell);
  deployer.deploy(PreSell, web3.toWei(0.1, "ether") , web3.toWei(10000000, "ether"));
};
