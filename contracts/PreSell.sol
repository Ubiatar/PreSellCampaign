pragma solidity ^0.4.17;

import "./Owned.sol";
import "./SafeMath.sol";

contract PreSell is Owned {
    using SafeMath for uint;

    uint public decimals = 18;

    uint256 public initialSupply = 4000000 * 10 ** decimals;

    uint256 public remainingSupply = initialSupply;

    uint256 public tokenValue;

    uint256 public endTime;

    event UpdateValue(uint256 newValue);
    event AssignToken(address indexed to, uint value);
    event Overflow(address to, uint value);
    event Withdraw(address to, uint value);

    modifier beforeEndTime()
    {
        require(now < endTime);
        _;
    }

    function PreSell (
    uint256 _tokenValue,
    uint256 _seconds
    )
    {
        tokenValue = _tokenValue;
        endTime = now + _seconds * 1 seconds;
    }

    function updateValue
    (
    uint256 newValue
    )
    onlyOwner
    {
        tokenValue = newValue;
        UpdateValue(newValue);
    }


    function withdraw ()
    onlyOwner
    {
        uint256 value = this.balance;
        owner.transfer(this.balance);
        Withdraw(owner, value);
    }

    /* *******
        PreSell payment fallback
    ******* */
    function()
    payable
    beforeEndTime
    {
        require(remainingSupply > 0);
        uint256 value = msg.value.mul(10 ** decimals).div(tokenValue);
        if (remainingSupply >= value) {
            AssignToken(msg.sender, value);
            remainingSupply = remainingSupply.sub(value);
        }
        else {
            AssignToken(msg.sender, remainingSupply);
            remainingSupply = 0;
            Overflow(msg.sender, value - remainingSupply);
        }
    }
}