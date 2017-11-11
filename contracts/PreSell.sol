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

    bool public isCampaignStarted;

    event CampaignStarted();
    event UpdateValue(uint256 newValue);
    event AssignToken(address indexed to, uint value);
    event Overflow(address to, uint value);
    event Withdraw(address to, uint value);

    modifier startedAndBeforeEndTime()
    {
        require(isCampaignStarted);
        require(now < endTime);
        _;
    }

    function PreSell (
        uint256 _tokenValue
    )
    {
        require(_tokenValue > 0);
        isCampaignStarted = false;
        tokenValue = _tokenValue;
    }

    function startCampaign
    (
        uint256 _seconds
    )
    onlyOwner
    {
        require(_seconds > 0);
        endTime = now + _seconds * 1 seconds;
        isCampaignStarted = true;
        CampaignStarted();
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
    startedAndBeforeEndTime
    {
        require(remainingSupply > 0);
        uint256 tokens = msg.value.mul(10 ** decimals).div(tokenValue);
        if (remainingSupply >= tokens) {
            AssignToken(msg.sender, tokens);
            remainingSupply = remainingSupply.sub(tokens);
        } else {
            tokens = remainingSupply;
            uint256 payback = msg.value.sub(remainingSupply.mul(tokenValue).div(10 ** decimals));
            require(payback < msg.value);
            remainingSupply = 0;
            msg.sender.transfer(payback);
            AssignToken(msg.sender, tokens);
            Overflow(msg.sender, payback);
        }
    }
}