pragma solidity ^0.4.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Owned.sol";
import "../contracts/OwnedAttacker.sol";

contract OwnedAttackerTest {

    function createOwned()
    public
    returns (address)
    {
        return new Owned();
    }

    OwnedAttacker testOwnedAttacker;
    Owned testOwned;

    function OwnedAttackerTest(){
        testOwnedAttacker = OwnedAttacker(DeployedAddresses.OwnedAttacker());
        testOwned = Owned(testOwnedAttacker.createOwned());
    }

    function testIsOwnerIsSet() {
        address ownedOwner = testOwned.owner();
        address ownedAttackerOwner = testOwnedAttacker.owner();
        Assert.equal(ownedAttackerOwner, ownedOwner, "Owner's address does not match");
    }
}
