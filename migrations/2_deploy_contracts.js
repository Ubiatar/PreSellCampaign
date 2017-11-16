const Web3 = require('web3')
const web3 = new Web3()

var Owned = artifacts.require("./Owned.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var PreSell = artifacts.require("./PreSell.sol");
var OwnedAttacker = artifacts.require("./OwnedAttacker.sol");

module.exports = function(deployer) {
  deployer.deploy(Owned);
  deployer.link(Owned, PreSell);
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, PreSell);
  deployer.deploy(PreSell, 1, web3.toWei(10000000, "ether"));
};
