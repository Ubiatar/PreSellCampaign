pragma solidity ^0.4.17;

// @TODO: Add events!

contract Owned {
	address owner;
	address candidateOwner;

	function Owned()
	{
		owner = msg.sender;
		candidateOwner = 0x0;
	}

	function setCandidate (address newOwner)
	onlyOwner
	returns (bool success)
	{
		candidateOwner = newOwner;
		success = true;
		return;
	}

	function getOwnership ()
	onlyCandidate
	returns (bool success)
	{
		owner = candidateOwner;
		candidateOwner = 0x0;
		success = true;
		return;
	}

	modifier onlyOwner {
		require(msg.sender == owner);
		_;
	}

	modifier onlyCandidate {
		require(candidateOwner != 0x0);
		require(msg.sender == candidateOwner);
		_;
	}
}
