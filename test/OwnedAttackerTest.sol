pragma solidity ^0.4.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Owned.sol";

contract OwnedAttackerTest {
    address ownedOwner;
    Owned testOwned = Owned(DeployedAddresses.Owned());

    function testIfOwnerIsSet() {
        Assert.equal(testOwned.owner(), tx.origin, "Should be owner");
    }


}
