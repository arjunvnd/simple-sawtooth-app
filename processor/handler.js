const { TransactionHandler } = require('sawtooth-sdk/processor/handler'); // require the transaction module here from SDK
const { InvalidTransaction, InternalError } = require('sawtooth-sdk/processor/exceptions');
const crypto = require('crypto');
const { TextEncoder, TextDecoder } = require('text-encoding/lib/encoding');

const hash = (x) => (
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase()
    .substring(0, 58)
);
const encoder = new TextEncoder('utf8');
const decoder = new TextDecoder('utf8');

const familyName = 'simplestore';
const familyVersion = '1.0';
const namespaces = hash(familyName).substring(0, 6);


let _decoder=function (payload){
  let payload1=payload.toString().split(',')
  let decodedval={
    action:payload1[0],
    value:payload1[1]
  }
  return decodedval
          

}


class SimpleApp extends TransactionHandler {
    constructor() {
      super(familyName, [familyVersion], [namespaces]);
    }
    apply(transactionProcessRequest, stateStore) {

     console.log('HELLO')
    console.log('THE TRANSATION PROCESSCONTROLLER',transactionProcessRequest)
    let usrpublickey=transactionProcessRequest.header.signerPublicKey;
    let _hashusrpublcikkey=_hash(usrpublickey)
    let address='a4d219'+_hashusrpublcikkey
    
    let update= _decoder(transactionProcessRequest.payload)

    
    console.log('THE ACTION IS',update.action,' THE VALUE IS ',update.value)
    
    if(update.action=='bake'){
      let current=context.getState([address])


      console.log('USER PUBLIC KEY',usrpublickey)
      console.log('HASH OF USER PUBLIC KEY',_hashusrpublcikkey)
      console.log('ADDRESS'+address)
      console.log('CONTEXT ',current)
      console.log('getState From the context',current)

      // let newcookie=parseInt(update.value);
      // console.log(newcookie)
      /* .then is listens for results from a promise  */

      return context.getState([address])
        .then((stateMapping)=>{
          console.log('The state mapping from the promise',stateMapping)
          let myState=stateMapping[address]
          console.log(myState)
          

          if(myState==''||myState==null ){
            // the value of new cookies will be added to new coookie
            var newCookie=parseInt(update.value)
            console.log('NO of new cookies',newCookie)
            // let oldcookie = parseInt(decoder.decode(myState)) to know if parse in works

            

          }else{
            let oldCookie = parseInt(decoder.decode(myState))
            console.log('No of old cookie is ',oldCookie)
            //old cookie is decoded to int and is addedd to the new cookie 
            var newCookie= parseInt(update.value)+oldCookie
            console.log('The value currently in the state',newCookie)

          }

          //the total no of cookies in the currentstate is added and converted to encoded value
          let newStateData=encoder.encode(newCookie.toString())

          console.log('Data entered in encoded value',newStateData)
          
          let data_to_be_entered={
            [address]:newStateData
          }
          return context.setState(data_to_be_entered)
        })
        
        

    }
    
    
  
    }
  
  
    payloadDecoder(payload) {
      const decodedPayload = payload.toString().split(',');
      return decodedPayload;
    }
  
    getAddress(request) {
      const requestHeader = request.header;
      const requestSignerPublicKey = requestHeader.signerPublicKey;
      return requestSignerPublicKey;
    }
  }
  
  
  module.exports = SimpleApp;// Module name here