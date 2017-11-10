/**
 * Created by antoniogiordano on 26/10/2017.
 */

const nope = () => null

const Web3 = require('web3')
const web3 = new Web3()

const TestRPC = require('ethereumjs-testrpc')
web3.setProvider(TestRPC.provider())

const Promise = require('bluebird');
Promise.promisifyAll(web3.eth, {suffix: "Promise"});
Promise.promisifyAll(web3.version, {suffix: "Promise"});

const assert = require('assert-plus');

const truffleContract = require("truffle-contract");

const SafeMath = truffleContract(require(__dirname + "/../build/contracts/SafeMath.json"));
const Owned = truffleContract(require(__dirname + "/../build/contracts/Owned.json"));
const PreSell = truffleContract(require(__dirname + "/../build/contracts/PreSell.json"));
SafeMath.setProvider(web3.currentProvider);
Owned.setProvider(web3.currentProvider);
PreSell.setProvider(web3.currentProvider);

describe("PreSell tests", function () {
    var accounts, networkId, preSell, owned, safeMath

    const preSellDeploy = (tokenValue, seconds) => {
        return PreSell.new(tokenValue, seconds, {from: accounts[0]})
            .then(_preSell => {
                preSell = _preSell
            });
    }

    before("get accounts", function () {
        return web3.eth.getAccountsPromise()
            .then(_accounts => accounts = _accounts)
            .then(() => web3.version.getNetworkPromise())
            .then(_networkId => {
                networkId = _networkId;
                PreSell.setNetwork(networkId);
                console.log(accounts)
            });
    });

    before("deploy owned", function () {
        return Owned.new({from: accounts[0]})
            .then(_owned => owned = _owned)
            .then(() => PreSell.link({Owned: owned.address}));
    });

    before("deploy safemath", function () {
        return SafeMath.new({from: accounts[0]})
            .then(_safeMath => safeMath = _safeMath)
            .then(() => PreSell.link({SafeMath: safeMath.address}));
    });

    it("should have 18 decimals", function () {
        return preSellDeploy(web3.toWei(1, "ether"), 3600)
            .then(() => preSell.decimals()
                .then(decimals => assert.strictEqual(
                    decimals.toString(),
                    '18',
                    "should be 18")))

    });

    it("should update token value to 2 ether", function () {
        return preSellDeploy(web3.toWei(1, "ether"), 3600)
            .then(() => {
                preSell.updateValue(web3.toWei(2, "ether"), {from: accounts[0]})
            })
            .then(() => preSell.tokenValue()
                .then(tokenValue => assert.strictEqual(
                    tokenValue.toString(),
                    web3.toWei(2, "ether"),
                    "should be 2 ether")));
    });

    it("should send ether and withdraw it", function () {
        return preSellDeploy(web3.toWei(1, "ether"), 3600)
            .then(() => web3.eth.sendTransactionPromise({
                from: accounts[0],
                to: preSell.address,
                value: web3.toWei(1, 'ether')
            }))
            .then(() => preSell.withdraw({from: accounts[0]}))
            .then(() => web3.eth.getBalancePromise(preSell.address)
                .then((balance) => assert.strictEqual(
                    balance.toString(),
                    web3.toWei(0, "ether"),
                    "should be 0 ether")))
    })

    it("should buy 1 token from preSell and update remaining supply", function () {
        return preSellDeploy(web3.toWei(1, "ether"), 3600)
            .then(() => web3.eth.sendTransactionPromise({
                from: accounts[0],
                to: preSell.address,
                value: web3.toWei(1, 'ether')
            }))
            .then(() => preSell.remainingSupply()
                .then(remainingSupply => assert.strictEqual(
                    remainingSupply.toString(10),
                    web3.toWei(3999999, "ether"),
                    "should be 3999999 ether")));
    })
});
