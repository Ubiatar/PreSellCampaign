pragma solidity ^0.4.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Owned.sol";

contract OwnedAttackerTest {

    Owned testOwned;
    address ownedOwner;

    function OwnedAttackerTest(){
        testOwned = Owned(DeployedAddresses.Owned());
    }

    function testIfOwnerIsSet() {
       // ownedOwner = testOwned.owner();
        Assert.equal(testOwned.owner(), tx.origin, "Should be owner");
    }
}
