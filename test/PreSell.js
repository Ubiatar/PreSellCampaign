/**
 * Created by antoniogiordano on 26/10/2017.
 */

const nope = () => null

const _ = require('lodash')

const Web3 = require('web3')
const web3 = new Web3()

const TestRPC = require('ethereumjs-testrpc')
web3.setProvider(TestRPC.provider())

const Promise = require('bluebird')
Promise.promisifyAll(web3.eth, {suffix: "Promise"})
Promise.promisifyAll(web3.version, {suffix: "Promise"})

const assert = require('assert-plus')
const chai = require('chai').use(require('chai-as-promised'))
const should = chai.should()

const truffleContract = require("truffle-contract")

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

const SafeMath = truffleContract(require(__dirname + "/../build/contracts/SafeMath.json"))
const Owned = truffleContract(require(__dirname + "/../build/contracts/Owned.json"))
const PreSell = truffleContract(require(__dirname + "/../build/contracts/PreSell.json"))
SafeMath.setProvider(web3.currentProvider)
Owned.setProvider(web3.currentProvider)
PreSell.setProvider(web3.currentProvider)

describe("PreSell deploy", () => {
  var accounts, networkId, preSell, owned, safeMath
  var owner

  before("get accounts", () => {
    return web3.eth.getAccountsPromise()
      .then(_accounts => accounts = _accounts)
      .then(() => web3.version.getNetworkPromise())
      .then(_networkId => {
        networkId = _networkId
        PreSell.setNetwork(networkId)
        owner = accounts[0]
      })
  })

  before("deploy owned", () => {
    return Owned.new({from: owner})
      .then(_owned => owned = _owned)
      .then(() => PreSell.link({Owned: owned.address}))
  })

  before("deploy safemath", () => {
    return SafeMath.new({from: owner})
      .then(_safeMath => safeMath = _safeMath)
      .then(() => PreSell.link({SafeMath: safeMath.address}))
  })

  const preSellDeploy = (tokenValue, initialSupply) => {
    return PreSell.new(tokenValue, initialSupply, {from: owner})
      .then(_preSell => preSell = _preSell)
  }

  it("should have 18 decimals", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(10, "ether"))
      .then(() => preSell.decimals())
      .then(decimals => assert.strictEqual(decimals.toString(), '18', "should be 18"))
  })

  it("should fail to deploy", () => {
    return preSellDeploy(0).should.be.rejected
  })

  it("should fail to deploy", () => {
    return preSellDeploy(100).should.be.rejected
  })

  it("should fail to deploy", () => {
    return preSellDeploy(100, 0).should.be.rejected
  })

  it("should fail to deploy", () => {
    return preSellDeploy(0, 100).should.be.rejected
  })

  it("should deploy successfully", () => {
    return preSellDeploy(100, 100)
  })
})

describe("PreSell start campaign", () => {
  var accounts, networkId, preSell, owned, safeMath
  var owner, attacker

  before("get accounts", () => {
    return web3.eth.getAccountsPromise()
      .then(_accounts => accounts = _accounts)
      .then(() => web3.version.getNetworkPromise())
      .then(_networkId => {
        networkId = _networkId
        PreSell.setNetwork(networkId)
        owner = accounts[0]
        attacker = accounts[1]
      })
  })

  before("deploy owned", () => {
    return Owned.new({from: owner})
      .then(_owned => owned = _owned)
      .then(() => PreSell.link({Owned: owned.address}))
  })

  before("deploy safemath", () => {
    return SafeMath.new({from: owner})
      .then(_safeMath => safeMath = _safeMath)
      .then(() => PreSell.link({SafeMath: safeMath.address}))
  })

  const preSellDeploy = (tokenValue, initialSupply) => {
    return PreSell.new(tokenValue, initialSupply, {from: owner})
      .then(_preSell => preSell = _preSell)
  }

  it("should fail to start", () => {
    return preSellDeploy(100, 100)
      .then(() => preSell.startCampaign(0)).should.be.rejected;
  })

  it("should fail to start", () => {
    return preSellDeploy(100, 100)
      .then(() => preSell.startCampaign(3600, {from: attacker})).should.be.rejected
  })

  it("should start campaign successfully", () => {
    return preSellDeploy(100, 100)
      .then(() => preSell.isCampaignStarted())
      .then(isCampaignStarted => assert(!isCampaignStarted, "it should not be started yet"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      .then(() => preSell.isCampaignStarted())
      .then(isCampaignStarted => assert(isCampaignStarted, "it should be started"))
  })
})

describe("PreSell token value", () => {
  var accounts, networkId, preSell, owned, safeMath
  var owner, attacker

  before("get accounts", () => {
    return web3.eth.getAccountsPromise()
      .then(_accounts => accounts = _accounts)
      .then(() => web3.version.getNetworkPromise())
      .then(_networkId => {
        networkId = _networkId
        PreSell.setNetwork(networkId)
        owner = accounts[0]
        attacker = accounts[1]
      })
  })

  before("deploy owned", () => {
    return Owned.new({from: owner})
      .then(_owned => owned = _owned)
      .then(() => PreSell.link({Owned: owned.address}))
  })

  before("deploy safemath", () => {
    return SafeMath.new({from: owner})
      .then(_safeMath => safeMath = _safeMath)
      .then(() => PreSell.link({SafeMath: safeMath.address}))
  })

  const preSellDeploy = (tokenValue, initialSupply) => {
    return PreSell.new(tokenValue, initialSupply, {from: owner})
      .then(_preSell => preSell = _preSell)
  }

  it("should update token value to 2 ether", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(10, "ether"))
      .then(() => preSell.tokenValue())
      .then(tokenValue => assert.strictEqual(tokenValue.toString(), web3.toWei(1, "ether"), "should be 1 ether"))
      .then(() => preSell.updateValue(web3.toWei(2, "ether"), {from: owner}))
      .then(() => preSell.tokenValue())
      .then(tokenValue => assert.strictEqual(tokenValue.toString(), web3.toWei(2, "ether"), "should be 2 ether"))
  })

  it("should not update token value", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(10, "ether"))
      .then(() => preSell.tokenValue())
      .then(tokenValue => assert.strictEqual(tokenValue.toString(), web3.toWei(1, "ether"), "should be 1 ether"))
      .then(() => preSell.updateValue(web3.toWei(2, "ether"), {from: attacker})).should.be.rejected
      .then(() => preSell.tokenValue())
      .then(tokenValue => assert.strictEqual(tokenValue.toString(), web3.toWei(1, "ether"), "should be 2 ether"))
  })
})

describe("PreSell token purchase", () => {
  var accounts, networkId, preSell, owned, safeMath
  var owner, tokenBuyer, attacker

  before("get accounts", () => {
    return web3.eth.getAccountsPromise()
      .then(_accounts => accounts = _accounts)
      .then(() => web3.version.getNetworkPromise())
      .then(_networkId => {
        networkId = _networkId
        PreSell.setNetwork(networkId)
        owner = accounts[0]
        tokenBuyer = accounts[1]
        attacker = accounts[2]
      })
  })

  before("deploy owned", () => {
    return Owned.new({from: owner})
      .then(_owned => owned = _owned)
      .then(() => PreSell.link({Owned: owned.address}))
  })

  before("deploy safemath", () => {
    return SafeMath.new({from: owner})
      .then(_safeMath => safeMath = _safeMath)
      .then(() => PreSell.link({SafeMath: safeMath.address}))
  })

  const preSellDeploy = (tokenValue, initialSupply) => {
    return PreSell.new(tokenValue, initialSupply, {from: owner})
      .then(_preSell => preSell = _preSell)
  }

  it("should not get token before campaign started", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(10, "ether"))
      .then(() => preSell.isCampaignStarted())
      .then(isCampaignStarted => assert(!isCampaignStarted, "it should not be started yet"))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: 10
      })).should.be.rejected
  })

  it("should get token", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(10, "ether"))
      .then(() => preSell.isCampaignStarted())
      .then(isCampaignStarted => assert(!isCampaignStarted, "should not be started yet"))
      .then(() => preSell.getBalance({from: tokenBuyer}))
      .then(balance => assert(balance.toString(10) === '0', "should be zero"))
      .then(() => preSell.endTime())
      .then(_endTime => assert(_endTime.toString() === '0', "should be zero"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      .then(() => preSell.isCampaignStarted())
      .then(isCampaignStarted => assert(isCampaignStarted, "should be started"))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(1, "ether"),
        gas: 500000
      }))
      .then(web3.eth.getTransactionPromise)
      .then(result => assert(result.blockNumber > 0, "should be already mined"))
      .then(() => assertEvent(preSell, {event: 'PurchaseToken'}))
      .then(events => {
        assert(events[0].args.to === tokenBuyer, "should be the token buyer")
      })
      .then(() => preSell.getBalance({from: tokenBuyer}))
      .then(balance => assert(balance.toString(10) === web3.toWei(1, "ether"), "should be 1 token"))
  })

  it("should send at least 50 finney", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(10, "ether"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(40, "finney"),
        gas: 500000
      }).should.be.rejected)
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(50, "finney"),
        gas: 500000
      }))
      .then(() => assertEvent(preSell, {event: 'PurchaseToken'}))
      .then(events => {
        assert(events[0].args.to === tokenBuyer, "should be the token buyer")
      })
      .then(() => preSell.getBalance({from: tokenBuyer}))
      .then(balance => assert(balance.toString(10) === web3.toWei(50, "finney"), "should be 0.05 token"))
  })

  it("should send ether and withdraw it", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(10, "ether"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(1, 'ether')
      }))
      .then(() => preSell.withdraw({from: owner}))
      .then(() => web3.eth.getBalancePromise(preSell.address))
      .then((balance) => assert.strictEqual(balance.toString(), web3.toWei(0, "ether"), "should be 0 ether"))
  })

  it("should get total tokens after two purchases", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(10, "ether"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(1, "ether"),
        gas: 500000
      }))
      .then(() => preSell.getBalance({from: tokenBuyer}))
      .then(balance => assert(balance.toString(10) === web3.toWei(1, "ether"), "should be 1 token"))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(2, "ether"),
        gas: 500000
      }))
      .then(() => preSell.getBalance({from: tokenBuyer}))
      .then(balance => assert(balance.toString(10) === web3.toWei(3, "ether"), "should be 3 total token"))
  })

  it("should buy tokens from preSell and update remaining supply", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(4000000, "ether"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(1, 'ether')
      }))
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert.strictEqual(remainingSupply.toString(10), web3.toWei(3999999, "ether"), "should be 3999999 ether"))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(10, 'ether')
      }))
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert.strictEqual(remainingSupply.toString(10), web3.toWei(3999989, "ether"), "should be 3999989 ether"))
  })

  it("should buy all 4000000 tokens with overflow and payback of 2 ether", () => {
    let balance
    return preSellDeploy(web3.toWei(0.000001, "ether"), web3.toWei(4000000, "ether"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert(remainingSupply.toString(10) === web3.toWei(4000000, 'ether'), "should be 4000000 of tokens"))
      .then(() => web3.eth.getBalancePromise(tokenBuyer))
      .then(_balance => balance = _balance)
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(3, 'ether'),
        gasPrice: 0
      }))
      .then(() => web3.eth.getBalancePromise(tokenBuyer))
      .then(_balance => assert(balance.sub(web3.toWei(3, 'ether')).toString(10) === _balance.toString(10), "should be initial balance - 3 ether"))
      .then(() => preSell.getBalance({from: tokenBuyer}))
      .then(balance => assert(balance.toString(10) === web3.toWei(3000000, "ether"), "should be 3000000 token"))
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert(remainingSupply.toString(10) === web3.toWei(1000000, 'ether'), "should be 1000000 of tokens"))
      .then(() => assertEvent(preSell, {event: 'PurchaseToken', args: {to: tokenBuyer}}))
      .then(events => {
        assert(events.length === 1, "should be just one event")
        assert(events[0].args.to === tokenBuyer, "should be the token buyer")
        assert(events[0].args.value.toString(10) === web3.toWei(3000000, 'ether').toString(10), "should be 3000000 tokens")
      })
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(3, 'ether'),
        gasPrice: 0
      }))
      .then(() => web3.eth.getBalancePromise(tokenBuyer))
      .then(_balance => assert(balance.sub(web3.toWei(6, 'ether')).toString(10) === _balance.toString(10), "should be initial balance - 6 ether"))
      .then(() => assertEvent(preSell, {event: 'PurchaseToken', args: {to: tokenBuyer}}))
      .then(events => {
        let lastEvent = events[events.length - 1]
        assert(lastEvent.args.to === tokenBuyer, "should be the token buyer")
        assert(lastEvent.args.value.toString(10) === web3.toWei(1000000, 'ether').toString(10), "should be 1000000 tokens")
      })
      .then(() => assertEvent(preSell, {event: 'Overflow'}))
      .then(events => {
        let lastEvent = events[events.length - 1]
        assert(lastEvent.args.to === tokenBuyer, "should be the token buyer")
        assert(lastEvent.args.value.toString(10) === web3.toWei(2, 'ether'), "should be 2 ether of payback")
      })
      .then(() => preSell.getBalance({from: tokenBuyer}))
      .then(balance => assert(balance.toString(10) === web3.toWei(4000000, "ether"), "should be 4000000 token"))
      .then(() => preSell.refundAmount())
      .then(refundAmount => assert(refundAmount.toString(10) === web3.toWei(2, 'ether').toString(10), "should be 2 ether of refunds"))
      .then(() => preSell.toBeRefund())
      .then(toBeRefund => assert(toBeRefund.toString() === tokenBuyer, "should be token buyer"))
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert(remainingSupply.toString(10) === '0', "should be 0 tokens"))
      .then(() => web3.eth.sendTransactionPromise({
        from: tokenBuyer,
        to: preSell.address,
        value: web3.toWei(3, 'ether'),
        gasPrice: 0
      })).should.be.rejected
      .then(() => preSell.refund({from: attacker}).should.be.rejected)
      .then(() => preSell.refund({from: owner}))
      .then(() => preSell.refundAmount())
      .then(refundAmount => assert(refundAmount.toString(10) === (0).toString(10), "should be 0"))
      .then(() => preSell.refund({from: owner}).should.be.rejected)
      .then(() => web3.eth.getBalancePromise(tokenBuyer))
      .then(_balance => assert(balance.sub(web3.toWei(4, 'ether')).toString(10) === _balance.toString(10), "should be initial balance - 4 ether"))
      .then(() => preSell.withdraw({from: attacker}).should.be.rejected)
      .then(() => web3.eth.getBalancePromise(owner))
      .then(_balance => balance = _balance)
      .then(() => preSell.withdraw({from: owner, gasPrice: 0}))
      .then(() => web3.eth.getBalancePromise(owner))
      .then(_balance => assert(_balance.toString(10) === balance.add(web3.toWei(4, 'ether')).toString(10), "should be balance plus 4 Ether of campaign"))
  })
})

describe("PreSell token assignment", () => {
  var accounts, networkId, preSell, owned, safeMath
  var owner, attacker, funder

  before("get accounts", () => {
    return web3.eth.getAccountsPromise()
      .then(_accounts => accounts = _accounts)
      .then(() => web3.version.getNetworkPromise())
      .then(_networkId => {
        networkId = _networkId
        PreSell.setNetwork(networkId)
        owner = accounts[0]
        tokenBuyer = accounts[1]
        attacker = accounts[2]
        funder = accounts[3]
      })
  })

  before("deploy owned", () => {
    return Owned.new({from: owner})
      .then(_owned => owned = _owned)
      .then(() => PreSell.link({Owned: owned.address}))
  })

  before("deploy safemath", () => {
    return SafeMath.new({from: owner})
      .then(_safeMath => safeMath = _safeMath)
      .then(() => PreSell.link({SafeMath: safeMath.address}))
  })

  const preSellDeploy = (tokenValue, initialSupply) => {
    return PreSell.new(tokenValue, initialSupply, {from: owner})
      .then(_preSell => preSell = _preSell)
  }

  it("should give 1 token to tokenBuyer", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(4000000, "ether"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      .then(() => preSell.assignTokens(tokenBuyer, web3.toWei(1, "ether"), {from: owner}))
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert.strictEqual(
        remainingSupply.toString(10),
        web3.toWei(3999999, 'ether'),
        "should be 3999999"
      ))
      .then(() => assertEvent(preSell, {event: 'AssignToken', args: {to: tokenBuyer}}))
      .then(events => {
        assert(events[0].args.to === tokenBuyer, "should be the receiver of the give")
        assert(events[0].args.value.toString(10) === web3.toWei(1, 'ether').toString(10), "should be 1 token")
      })
      .then(() => preSell.getBalance({from: tokenBuyer}))
      .then(balance => assert(balance.toString(10) === web3.toWei(1, "ether"), "should be 1 token"))
  })

  it("should fail to give tokens to attacker", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(4000000, "ether"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      .then(() => preSell.assignTokens(tokenBuyer, web3.toWei(1, 'ether'), {from: attacker}).should.be.rejected)
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert.strictEqual(
        remainingSupply.toString(10),
        web3.toWei(4000000, 'ether'),
        "should be 4000000"
      ))
  })

  it("should fail to give more tokens than remainingTokens", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(4000000, "ether"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      .then(() => preSell.assignTokens(tokenBuyer, web3.toWei(5000000, "ether"), {from: owner}).should.be.rejected)
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert.strictEqual(
        remainingSupply.toString(10),
        web3.toWei(4000000, 'ether'),
        "should be 4000000"
      ))
  })

  it("should update address balance more times", () => {
    return preSellDeploy(web3.toWei(1, "ether"), web3.toWei(100, "ether"))
      .then(() => preSell.startCampaign(3600, {from: owner}))
      // First assignment
      .then(() => preSell.assignTokens(funder, web3.toWei(2, "ether"), {from: owner}))
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert.strictEqual(
        remainingSupply.toString(10),
        web3.toWei(98, 'ether'),
        "should be 98"
      ))
      .then(() => preSell.getBalance({from: funder}))
      .then(balance => assert(balance.toString(10) === web3.toWei(2, "ether"), "should be 2 token"))
      // Second assignment. Should overwrite previous one
      .then(() => preSell.assignTokens(funder, web3.toWei(8, "ether"), {from: owner}))
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert.strictEqual(
        remainingSupply.toString(10),
        web3.toWei(92, 'ether'),
        "should be 92"
      ))
      .then(() => preSell.getBalance({from: funder}))
      .then(balance => assert(balance.toString(10) === web3.toWei(8, "ether"), "should be 8 token"))
      // Third assignment. Should overwrite previous two
      .then(() => preSell.assignTokens(funder, web3.toWei(6, "ether"), {from: owner}))
      .then(() => preSell.remainingSupply())
      .then(remainingSupply => assert.strictEqual(
        remainingSupply.toString(10),
        web3.toWei(94, 'ether'),
        "should be 94"
      ))
      .then(() => preSell.getBalance({from: funder}))
      .then(balance => assert(balance.toString(10) === web3.toWei(6, "ether"), "should be 6 token"))
  })
})