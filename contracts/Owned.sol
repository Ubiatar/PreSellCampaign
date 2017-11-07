pragma solidity ^0.4.17;

// @TODO: Add events!

contract Owned {
	address public owner;
	address public candidateOwner;

	event UpdatedCandidate(bool success);
	event GotOwnerwship(bool success);

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
		UpdatedCandidate(success);
		return;
	}

	function getOwnership ()
	onlyCandidate
	returns (bool success)
	{
		owner = candidateOwner;
		candidateOwner = 0x0;
		success = true;
		GotOwnerwship(success);
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
