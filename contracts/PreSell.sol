pragma solidity ^0.4.17;

import "./Owned.sol";
import "./SafeMath.sol";

contract PreSell is Owned {
    using SafeMath for uint;

    uint public decimals = 18;
    uint256 public initialSupply = 0;
    uint256 public remainingSupply = 0;
    uint256 public tokenValue;
    bool public isCampaignStarted;
    address public toBeRefund = 0x0;
    uint256 public refundAmount;
    mapping (address => uint256) balances;

    event CampaignStarted();
    event CampaignStopped();
    event UpdateValue(uint256 newValue);
    event AssignToken(address to, uint value);
    event PurchaseToken(address to, uint value);
    event Overflow(address to, uint value);
    event Withdraw(address to, uint value);
    event Refund(address to, uint value);

    modifier campaignStarted
    {
        require(isCampaignStarted);
        _;
    }

    function PreSell
    (
    uint256 _tokenValue,
    uint256 _initialSupply
    )
    {
        require(_tokenValue > 0);
        require(_initialSupply > 0);
        isCampaignStarted = false;
        tokenValue = _tokenValue;
        initialSupply = _initialSupply;
        remainingSupply = initialSupply;
    }

    function startCampaign
    (
    uint256 _start
    )
    onlyOwner
    {
        require(_start == 1 || _start == 0);
        if(_start == 1) {
            isCampaignStarted = true;
            CampaignStarted();
        }
        else {
            isCampaignStarted = false;
            CampaignStopped();
        }
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

    function assignTokens
    (
    address receiver,
    uint256 tokens
    )
    onlyOwner
    {
        require(receiver != 0x0);
        require(tokens >= 0);
        remainingSupply = remainingSupply.add(balances[receiver]);
        require(remainingSupply >= tokens);
        remainingSupply = remainingSupply.sub(tokens);
        balances[receiver] = tokens;
        AssignToken(receiver, tokens);
    }

    function withdraw ()
    onlyOwner
    {
        uint256 value = this.balance;
        owner.transfer(this.balance);
        Withdraw(owner, value);
    }

    function refund ()
    onlyOwner
    {
        require(toBeRefund != 0x0);
        require(refundAmount > 0);
        uint256 _refundAmount = refundAmount;
        address _toBeRefund = toBeRefund;
        refundAmount = 0;
        toBeRefund = 0x0;
        _toBeRefund.transfer(_refundAmount);
        Refund(_toBeRefund, _refundAmount);
    }

    function getBalance
    (
    address user
    )
    constant
    returns (uint256 balance)
    {
        balance = balances[user];
        return balance;
    }

    /* *******
        PreSell payment fallback
    ******* */
    function()
    payable
    campaignStarted
    {
        require(remainingSupply > 0);
        require(msg.value >= 50 finney);
        address receiver = msg.sender;
        uint256 tokens = msg.value.mul(10 ** decimals).div(tokenValue);
        if (remainingSupply >= tokens) {
            remainingSupply = remainingSupply.sub(tokens);
            balances[receiver] = balances[receiver].add(tokens);
            PurchaseToken(receiver, tokens);
        } else {
            tokens = remainingSupply;
            uint256 _refundAmount = msg.value.sub(remainingSupply.mul(tokenValue).div(10 ** decimals));
            require(_refundAmount < msg.value);
            balances[receiver] = balances[receiver].add(tokens);
            remainingSupply = 0;
            refundAmount = _refundAmount;
            toBeRefund = receiver;
            PurchaseToken(receiver, tokens);
            Overflow(receiver, _refundAmount);
        }
    }
}