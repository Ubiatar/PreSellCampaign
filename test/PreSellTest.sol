pragma solidity ^0.4.0;


import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Owned.sol";
import "../contracts/PreSell.sol";
import "../contracts/SafeMath.sol";


contract PreSellTest {

    PreSell testPreSell = PreSell(DeployedAddresses.PreSell());

    function testIfOwnerIsSet() {
        Assert.equal(testPreSell.owner(), tx.origin, "Should be owner");
    }
/*
    function testBuyTokens() {
        // Should start campaign first
        testPreSell.send(1000000);
        Assert.equal(testPreSell.remainingSupply(), 9000000 ether, "Should be 9kk");
    }
*/
}
