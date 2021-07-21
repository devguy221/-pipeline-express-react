import React from 'react'
import styles from './styles.module.css'
import MyAlgo from '@randlabs/myalgo-connect'

export class Pipeline {
  static init() {
    return new MyAlgo()
  }

  static async connect(wallet) {
    try {
      const accounts = await wallet.connect()
      let item1 = accounts[0]
      item1 = item1['address']
      return item1
    } catch (err) {
      console.error(err)
    }
  }

  static async send(address, amt, myNote, sendingAddress, wallet, index = 0) {
    const algodToken = '0'
    const paramServer = 'https://algoexplorerapi.io/v2/transactions/params'
    const transServer = 'https://algoexplorerapi.io/v2/transactions'

    var buf = new Array(myNote.length)
    var encodedNote = new Uint8Array(buf)
    for (var i = 0, strLen = myNote.length; i < strLen; i++) {
      encodedNote[i] = myNote.charCodeAt(i)
    }

    console.log('My encoded note: ' + encodedNote)

    try {
      const params = await (await fetch(paramServer)).json()

      let txn = {
        from: sendingAddress,
        to: address,
        amount: parseInt(amt),
        note: encodedNote,
        genesisID: 'mainnet-v1.0',
        genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
        type: 'pay',
        flatFee: true,
        fee: 1000,
        firstRound: params['last-round'],
        lastRound: params['last-round'] + 1000,
      }

      if (index !== 0) {
        txn.type = 'axfer'
        txn.assetIndex = parseInt(index)
      }

      console.log(txn)

      const signedTxn = await wallet.signTransaction(txn)

      let transactionID = await fetch(transServer, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-binary',
        },
        body: signedTxn.blob,
      })
        .then(response => response.json())
        .then(data => {
          return JSON.stringify(data.txId);
        })
        .catch(error => {
          console.error('Error:', error)
        })

      return transactionID
    } catch (err) {
      console.error(err)
    }
  }
}

export const AlgoSendButton = ({
  index,
  recipient,
  amount,
  note,
  myAddress,
  wallet,
  context,
  returnTo
}) => {
  return (
    <button
      className={styles.AlgoSendButton}
      onClick={
        () => {
          Pipeline.send(
            recipient,
            parseInt(amount),
            note,
            myAddress,
            wallet,
            index
          ).then(data => {
            if (typeof data !== 'undefined') {
              const object = {}
              object[returnTo] = data
              context.setState(object)
            }
          })
        }
      }
    >
      Send
    </button>
  )
}

export const AlgoButton = ({ wallet, context, returnTo}) => {
  return (
    <button
      className={styles.AlgoButton}
      onClick={() => {
        Pipeline.connect(wallet).then(accounts => {
          const data = {};
          data[returnTo] = accounts;
          context.setState(data);
        })
      }}
    >Connect to MyAlgo</button>
  )
}
