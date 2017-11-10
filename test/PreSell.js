/**
 * Created by antoniogiordano on 26/10/2017.
 */

const nope = () => null

const Web3 = require('web3')
const web3 = new Web3()

const TestRPC = require('ethereumjs-testrpc')
web3.setProvider(TestRPC.provider())

const Promise = require('bluebird');
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

const assert = require('assert-plus');

const truffleContract = require("truffle-contract");

const SafeMath = truffleContract(require(__dirname + "/../build/contracts/SafeMath.json"));
const Owned = truffleContract(require(__dirname + "/../build/contracts/Owned.json"));
const PreSell = truffleContract(require(__dirname + "/../build/contracts/PreSell.json"));
SafeMath.setProvider(web3.currentProvider);
Owned.setProvider(web3.currentProvider);
PreSell.setProvider(web3.currentProvider);

describe("PreSell tests", () => {
  var accounts, networkId, preSell, owned, safeMath
  var owner, tokenBuyer

  before("get accounts", () => {
    return web3.eth.getAccountsPromise()
      .then(_accounts => accounts = _accounts)
      .then(() => web3.version.getNetworkPromise())
      .then(_networkId => {
        networkId = _networkId;
        PreSell.setNetwork(networkId);
        owner = accounts[0]
        tokenBuyer = accounts[1]
      });
  });

  before("deploy owned", () => {
    return Owned.new({ from: owner })
      .then(_owned => owned = _owned)
      .then(() => PreSell.link({ Owned: owned.address }));
  });

  before("deploy safemath", () => {
    return SafeMath.new({ from: owner })
      .then(_safeMath => safeMath = _safeMath)
      .then(() => PreSell.link({ SafeMath: safeMath.address }));
  });

  beforeEach("deploy the PreSell", () => {
    return PreSell.new({ from: owner })
      .then(_preSell => preSell = _preSell);
  });

  it("should have 18 decimals", () => {
    return preSell.decimals()
      .then(decimals => assert.strictEqual(
        decimals.toString(),
        '18',
        "should be 18"));
  });

  it("could start the campaing", () => {
    return preSell.isCampaignStarted()
      .then(isCampaignStarted => assert(!isCampaignStarted, "it should not be started yet"))
      .then(() => preSell.startCampaign(10, {from: owner}))
      .then(() => preSell.isCampaignStarted())
      .then(isCampaignStarted => assert(isCampaignStarted, "it should be started"))
  });

  it("should not get token before campaign started", () => {
    return preSell.isCampaignStarted()
      .then(isCampaignStarted => assert(!isCampaignStarted, "it should not be started yet"))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: 10
      }))
      .catch(err => {
        assert(err, "it should be invalid")
      })
  });

  it("should get token", () => {
    return preSell.isCampaignStarted()
      .then(isCampaignStarted => assert(!isCampaignStarted, "it should not be started yet"))
      // .then(() => web3.eth.getBalancePromise(tokenBuyer)).then(console.log)
      .then(() => preSell.endTime())
      .then(_endTime => assert(_endTime.toString() === '0', "it should be zero"))
      .then(() => preSell.startCampaign(100, {from: owner}))
      .then(() => preSell.isCampaignStarted())
      .then(isCampaignStarted => assert(isCampaignStarted, "it should be started"))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: 10,
        gas: 500000
      }))
  });

  /*
  it("should start with 4,000,000 coins", () => {
    return tokenErc20.balanceOf.call(accounts[0])
      .then(balance => assert.strictEqual(
        web3.toBigNumber(balance).toString(10),
        web3.toBigNumber(4000000).times('1000000000000000000').toString(10),
        "should be 4M"));
  });

  it("should burn 1000 tokens", () => {
    return tokenErc20.burn.call(1000)
      .then(success => assert.strictEqual(success, true, "should be true"))
      .then(() => tokenErc20.balanceOf.call(accounts[0]))
      .then(balance => assert.strictEqual(
        web3.toBigNumber(balance).toString(10),
        web3.toBigNumber(4000000).times('1000000000000000000').minus(1000).toString(10),
        "should be 4 * 10 ^ 24 - 1000"))
  });

  it("should return false", () => {
    return tokenErc20.burn.call(1000, { from: accounts[1] })
      .then(success => assert.fail(success, undefined, "if should throw"))
      .catch(nope)
  });
  */
});
