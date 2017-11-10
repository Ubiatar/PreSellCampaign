/**
 * Created by antoniogiordano on 26/10/2017.
 */

const nope = () => null

const _ = require('lodash')

const Web3 = require('web3')
const web3 = new Web3()

const TestRPC = require('ethereumjs-testrpc')
web3.setProvider(TestRPC.provider())

const Promise = require('bluebird');
Promise.promisifyAll(web3.eth, {suffix: "Promise"});
Promise.promisifyAll(web3.version, {suffix: "Promise"});

const assert = require('assert-plus');

const truffleContract = require("truffle-contract");

const assertEvent = (contract, filter) => {
  return new Promise((resolve, reject) => {
    var event = contract[filter.event]()
    event.watch()
    event.get((error, logs) => {
      var log = _.filter(logs, filter)
      if (log && Array.isArray(log) && log.length > 0) {
        resolve(log)
      } else {
        throw Error("Failed to find filtered event for " + filter.event)
      }
    })
    event.stopWatching(() => null)
  })
}

const SafeMath = truffleContract(require(__dirname + "/../build/contracts/SafeMath.json"));
const Owned = truffleContract(require(__dirname + "/../build/contracts/Owned.json"));
const PreSell = truffleContract(require(__dirname + "/../build/contracts/PreSell.json"));
SafeMath.setProvider(web3.currentProvider);
Owned.setProvider(web3.currentProvider);
PreSell.setProvider(web3.currentProvider);

describe("PreSell tests", () => {
  var accounts, networkId, preSell, owned, safeMath
  var owner, tokenBuyer

    const preSellDeploy = (tokenValue, seconds) => {
        return PreSell.new(tokenValue, seconds, {from: accounts[0]})
            .then(_preSell => {
                preSell = _preSell
            });
    }

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
    it("should have 18 decimals", function () {
        return preSellDeploy(web3.toWei(1, "ether"), 3600)
            .then(() => preSell.decimals()
                .then(decimals => assert.strictEqual(
                    decimals.toString(),
                    '18',
                    "should be 18")))

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
      .then(web3.eth.getTransactionPromise)
      .then(result => assert(result.blockNumber > 0, "it should be already mined"))
      .then(() => assertEvent(preSell, {event: 'AssignToken'}))
      .then(events => {
        assert(events.length === 1, "it should be just one event")
        assert(events[0].args.to === tokenBuyer, "it should be the token buyer")
      })
  });

  /*
  it("should start with 4,000,000 coins", () => {
    return tokenErc20.balanceOf.call(accounts[0])
      .then(balance => assert.strictEqual(
        web3.toBigNumber(balance).toString(10),
        web3.toBigNumber(4000000).times('1000000000000000000').toString(10),
        "should be 4M"));
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
