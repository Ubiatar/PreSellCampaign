/**
 * Created by antoniogiordano on 26/10/2017.
 */

const Web3 = require('web3');
const web3 = new Web3();

const TestRPC = require('ethereumjs-testrpc');
web3.setProvider(TestRPC.provider());

const Promise = require('bluebird');
Promise.promisifyAll(web3.eth, {suffix: "Promise"});
Promise.promisifyAll(web3.version, {suffix: "Promise"});

const assert = require('assert-plus');

const chai = require('chai').use(require('chai-as-promised'));
const should = chai.should();

const truffleContract = require("truffle-contract");

const SafeMath = truffleContract(require(__dirname + "/../build/contracts/SafeMath.json"));
const Owned = truffleContract(require(__dirname + "/../build/contracts/Owned.json"));
SafeMath.setProvider(web3.currentProvider);
Owned.setProvider(web3.currentProvider);

describe("Owned tests", function () {
    var accounts, networkId, owned, safeMath;
    var owner, attacker, testAccount;

    before("get accounts", () => {
        return web3.eth.getAccountsPromise()
            .then(_accounts => accounts = _accounts)
            .then(() => web3.version.getNetworkPromise())
            .then(_networkId => {
                networkId = _networkId;
                Owned.setNetwork(networkId);
                owner = accounts[0];
                attacker = accounts[1];
                testAccount = accounts[2];
            });
    });

    before("deploy owned", () => {
        return Owned.new({from: owner})
            .then(_owned => owned = _owned)
    });

    before("deploy safemath", () => {
        return SafeMath.new({from: owner})
            .then(_safeMath => safeMath = _safeMath)
            .then(() => Owned.link({SafeMath: safeMath.address}));
    });

    it("should set testAccount as a new candidate", () => {
        return owned.candidateOwner()
            .then(() => owned.setCandidate(testAccount, {from: owner})
                .then(() => owned.candidateOwner())
                .then(candidateOwner => assert.strictEqual(
                    candidateOwner.toString(),
                    testAccount,
                    "should set candidateOwner to testAccount")))
    });

    it("shouldn't set attacker as a new candidate", () => {
        return owned.candidateOwner()
            .then(() => {
                return owned.setCandidate(attacker, {from: attacker}).should.be.rejected;
            })
    });

    it("should set testAccount as the new owner", () => {
        return owned.owner()
            .then(() => owned.setCandidate(testAccount, {from: owner}))
            .then(() => owned.getOwnership({from: testAccount})
                .then(() => owned.owner())
                .then(owner => assert.strictEqual(
                    owner.toString(),
                    testAccount,
                    "should set owner to testAccount")))
    })
});