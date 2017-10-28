var Owned = artifacts.require("./Owned.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var PreSell = artifacts.require("./PreSell.sol");

module.exports = function(deployer) {
  deployer.deploy(Owned);
  deployer.link(Owned, PreSell);
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, PreSell);
  deployer.deploy(PreSell);
};
