/**
 * Created by antoniogiordano on 12/12/2017.
 */

import React, {Component} from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {Paper, RaisedButton, TextField, CircularProgress} from 'material-ui'
import Web3 from 'web3'
import BigNumber from 'bignumber.js'
const ubiatarWeb3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io'))

export const colors = {
  primary: '#379ACE',
  darkPrimary: '#2B2A3B',
  grey: '#ccc',
  success: '#53A182',
  alert: '#EBCB1A',
  error: '#EA656C',
  darkGrey: '#888'
}

const muiLightUbiatarTheme = getMuiTheme({
  palette: {
    primary1Color: colors.primary
  },
  appBar: {
    color: colors.darkPrimary
  },
  raisedButton: {
    textColor: colors.darkPrimary,
    primaryColor: colors.primary,
    primaryTextColor: '#fff',
    secondaryColor: colors.darkPrimary,
    secondaryTextColor: '#fff'
  },
  floatingActionButton: {
    color: colors.primary,
    secondaryColor: colors.darkPrimary
  }
})

const abi = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "setCandidate",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "tokenValue",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_start",
        "type": "uint256"
      }
    ],
    "name": "startCampaign",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "initialSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "receiver",
        "type": "address"
      },
      {
        "name": "tokens",
        "type": "uint256"
      }
    ],
    "name": "assignTokens",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newValue",
        "type": "uint256"
      }
    ],
    "name": "updateValue",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "refund",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isCampaignStarted",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "toBeRefund",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "getOwnership",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "refundAmount",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "candidateOwner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "remainingSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getBalance",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_tokenValue",
        "type": "uint256"
      },
      {
        "name": "_initialSupply",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "CampaignStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "CampaignStopped",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "newValue",
        "type": "uint256"
      }
    ],
    "name": "UpdateValue",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "AssignToken",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "PurchaseToken",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Overflow",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Withdraw",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Refund",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "success",
        "type": "bool"
      }
    ],
    "name": "UpdatedCandidate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "success",
        "type": "bool"
      }
    ],
    "name": "GotOwnership",
    "type": "event"
  }
]

export default class Main extends Component {
  constructor (props) {
    super (props)

    this.state = {
      address: '0x',
      balance: null,
      isGettingBalance: false,
      errorText: null
    }
  }
  getUbiatarCoins () {
    const {address} = this.state

    try {
      let myContract = new ubiatarWeb3.eth.Contract(abi,'0x90561ef2Edb20179984658E4419063e3d09F1d30' , address)
      this.setState({
        isGettingBalance: true,
        errorText: null,
        balance: null
      })
      myContract.methods.getBalance(address).call((err, balance) => {
        this.setState({isGettingBalance: false})
        if (err) return this.setState({errorText: err.message})
        if (balance) {
          let balanceBig = new BigNumber(balance)
          let divider = new BigNumber(10)
          divider = divider.pow(18)
          balanceBig = balanceBig.div(divider).toString(10)
          this.setState({balance: balanceBig})
        } else {
          this.setState({errorText: 'Balance not found!'})
        }
      })
    } catch (ex) {
      this.setState({
        errorText: ex.message,
        isGettingBalance: false
      })
    }
  }
  render () {
    const {balance, isGettingBalance, errorText} = this.state

    return (
      <MuiThemeProvider muiTheme={muiLightUbiatarTheme}>
        <Paper zDepth={2} style={{
          padding: 40,
          margin: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: 480,
            maxWidth: '100%'
          }}>
            <TextField
              onChange={ev => this.setState({
                address: ev.target.value || '',
                errorText: null
              })}
              hintText="Public address"
              floatingLabelText="Insert your public Ethereum address"
              fullWidth={true}
              errorText={errorText}
            />
          </div>
          <div style={{
            marginTop: 40
          }}>
            {
              !isGettingBalance
                ? <RaisedButton
                  primary
                  onClick={this.getUbiatarCoins.bind(this)}
                  label="Get balance"
                />
                : <CircularProgress size={40} />
            }
          </div>
          {
            balance && <div style={{
              marginTop: 40,
              marginBottom: 20,
              fontSize: '2em',
              color: colors.darkPrimary
            }}>{balance} Ubiatar Coin</div>
          }
        </Paper>
      </MuiThemeProvider>
    )
  }
}