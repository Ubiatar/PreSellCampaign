pragma solidity ^0.4.2;

import "./Owned.sol";

contract OwnedAttacker {

    address public owner;

    function OwnedAttacker() {
        owner = msg.sender;
    }

    function createOwned()
    public
    returns (address)
    {
        return new Owned();
    }
}