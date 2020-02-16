const {
  TransactionHandler
} = require('sawtooth-sdk/processor/handler'); // require the transaction module here from SDK
const {
  InvalidTransaction,
  InternalError
} = require('sawtooth-sdk/processor/exceptions');
const crypto = require('crypto');
const {
  TextEncoder,
  TextDecoder
} = require('text-encoding/lib/encoding');

const hash = (x) => (
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase()
  .substring(0, 58)
);
const encoder = new TextEncoder('utf8');
const decoder = new TextDecoder('utf8');

const familyName = 'simplestore';
const familyVersion = '1.0';
const namespaces = hash(familyName).substring(0, 6);
const _hash = (x) => crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)


let _decoder = (payload) => {
  let payloadString = payload.toString().split(',')
  let decodedval = {
    action: payloadString[0],
    value: payloadString[1]
  }
  return decodedval
}


class SimpleApp extends TransactionHandler {
  constructor() {
    super(familyName, [familyVersion], [namespaces]);
  }
  apply(transactionProcessRequest, stateStore) {

    console.log('HELLO')
    console.log('THE TRANSATION PROCESSCONTROLLER', transactionProcessRequest)
    let usrpublickey = transactionProcessRequest.header.signerPublicKey;
    let _hashusrpublcikkey = _hash(usrpublickey)
    let address = namespaces + _hashusrpublcikkey

    let update = _decoder(transactionProcessRequest.payload)


    console.log('THE ACTION IS', update.action, ' THE VALUE IS ', update.value)

    if (update.action == 'set') {


      // console.log('USER PUBLIC KEY', usrpublickey)
      // console.log('HASH OF USER PUBLIC KEY', _hashusrpublcikkey)
      // console.log('ADDRESS' + address)
      // console.log('CONTEXT ', current)
      // console.log('getState From the context', current)
      return this.setValue(stateStore, address, update.value)
    } else if (update.action === 'add') {
      return this.addValue(stateStore, address,update.value)
    } else if (update.action === 'sub') {
      return this.subtractValue(stateStore, address,update.value)
    } else {
      throw new InvalidTransaction(
        `Action must be create, delete, or take not ${payload.action}`
      )
    }
  }

  async setValue(context, opAddress, value) {
    let currentState = await context.getState([opAddress]);
    let newState = value;
    let newStateData = encoder.encode(newState.toString())


    let data_to_be_entered = {
      [opAddress]: newStateData
    }
    try {
      let afterSetState = await context.setState(data_to_be_entered)
      console.log("Success", afterSetState)
      return afterSetState
    } catch (error) {
      console.log("Error", error)
    }

  }

  async addValue(context, opAddress,value) {

    let currentState = await context.getState([opAddress]);
    let readableState = (currentState[opAddress].toString())
    let newState = readableState ? (parseInt(readableState) + parseInt(value)) : 1
    let newStateData = encoder.encode(newState.toString())
    let data_to_be_entered = {
      [opAddress]: newStateData
    }
    try {
      let afterSetState = await context.setState(data_to_be_entered)
      console.log("Success", afterSetState)
      return afterSetState
    } catch (error) {
      console.log("Error", error)
    }

  }

  async subtractValue(context, opAddress,value) {
    let currentState = await context.getState([opAddress]);
    let readableState = (currentState[opAddress].toString())
	console.log("testsssss",readableState,"--------------",currentState[opAddress])
    let newState = readableState ? (parseInt(readableState) - parseInt(value)) : 0
    let newStateData = encoder.encode(newState.toString())
    let data_to_be_entered = {
      [opAddress]: newStateData
    }
    try {
      let afterSetState = await context.setState(data_to_be_entered)
      console.log("Success", afterSetState)
      return afterSetState
    } catch (error) {
      console.log("Error", error)
    }

  }

}


module.exports = SimpleApp; // Module name here
