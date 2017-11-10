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

const chai = require('chai').use(require('chai-as-promised'));
const should = chai.should();

const truffleContract = require("truffle-contract");

const SafeMath = truffleContract(require(__dirname + "/../build/contracts/SafeMath.json"));
const Owned = truffleContract(require(__dirname + "/../build/contracts/Owned.json"));
SafeMath.setProvider(web3.currentProvider);
Owned.setProvider(web3.currentProvider);

describe("Owned tests", function () {
    var accounts, networkId, owned, safeMath

    before("get accounts", function () {
        return web3.eth.getAccountsPromise()
            .then(_accounts => accounts = _accounts)
            .then(() => web3.version.getNetworkPromise())
            .then(_networkId => {
                networkId = _networkId;
                Owned.setNetwork(networkId);
                console.log(accounts)
            });
    });

    before("deploy owned", function () {
        return Owned.new({from: accounts[0]})
            .then(_owned => owned = _owned)
    });

    before("deploy safemath", function () {
        return SafeMath.new({from: accounts[0]})
            .then(_safeMath => safeMath = _safeMath)
            .then(() => Owned.link({SafeMath: safeMath.address}));
    });

    it("should set accounts[1] as a new candidate", function () {
        return owned.candidateOwner()
            .then(() => owned.setCandidate(accounts[1], {from: accounts[0]})
                .then(() => owned.candidateOwner())
                .then(candidateOwner => assert.strictEqual(
                    candidateOwner.toString(),
                    accounts[1],
                    "should set candidateOwner to accounts[1]")))
    });

    it("shouldn't set accounts[1] as a new candidate", function () {
        return owned.candidateOwner()
            .then(() => {
                return owned.setCandidate(accounts[1], {from: accounts[1]}).should.be.rejected;
            })
    })

    it("should set accounts[1] as the new owner", function () {
        return owned.owner()
            .then(() => owned.setCandidate(accounts[1], {from: accounts[0]}))
            .then(() => owned.getOwnership({from: accounts[1]})
                .then(() => owned.owner())
                .then(owner => assert.strictEqual(
                    owner.toString(),
                    accounts[1],
                    "should set owner to accounts[1]")))
    })
});