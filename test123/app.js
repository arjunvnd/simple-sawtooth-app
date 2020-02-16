const express = require('express')
const {createContext, CryptoFactory} = require('sawtooth-sdk/signing')
const axios = require('axios')
var bodyParser = require('body-parser')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const {TextDecoder,TextEncoder} = require('text-encoding')
const {createHash} = require('crypto')
const {protobuf} = require('sawtooth-sdk')
const app = express()

const request = require('request')

app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
 
app.post('/', function (req, res) {
  function getSecp256k1pk(pkInput) {
    let secp256k1pk;
    if(pkInput instanceof ArrayBuffer) {
      secp256k1pk = new Secp256k1PrivateKey(Buffer.from(pkInput, 0, 32));
    } else if(typeof(pkInput) == 'string') {
      secp256k1pk = Secp256k1PrivateKey.fromHex(pkInput);
    }
    return secp256k1pk;
  }
const context = createContext('secp256k1')

const privateKeyHex = '66ad89d0ff29b0267fba72ea8d40ef7975e10f8acde8d50d20cdf56ba9599c5d';

const privateKey = context.newRandomPrivateKey()
const secp256k1pk = getSecp256k1pk(privateKeyHex);


const signer = new CryptoFactory(context).newSigner(secp256k1pk)
const data = req.body.action + "," + req.body.value;
let encodePayload = new TextEncoder('utf8').encode(data)
const transactionHeaderBytes = protobuf.TransactionHeader.encode({
  familyName: 'simplestore',
  familyVersion: '1.0',
  inputs: ['91747944f12ee39a6ebd0cb736c1bbb4ef5ac8159569dd63f2cb43fc99546712336f60'],
  outputs: ['91747944f12ee39a6ebd0cb736c1bbb4ef5ac8159569dd63f2cb43fc99546712336f60'],
  signerPublicKey: signer.getPublicKey().asHex(),
  // In this example, we're signing the batch with the same private key,
  // but the batch can be signed by another party, in which case, the
  // public key will need to be associated with that key.
  batcherPublicKey: signer.getPublicKey().asHex(),
  // In this example, there are no dependencies.  This list should include
  // an previous transaction header signatures that must be applied for
  // this transaction to successfully commit.
  // For example,
  // dependencies: ['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
  dependencies: [],
  payloadSha512: createHash('sha512').update(encodePayload).digest('hex')
}).finish()
const signature = signer.sign(transactionHeaderBytes)

const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: signature,
    payload: encodePayload
})

const transactions = [transaction]

const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn) => txn.headerSignature),
}).finish()

const signatureBatch = signer.sign(batchHeaderBytes)

const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: signatureBatch,
    transactions: transactions
})
const batchListBytes = protobuf.BatchList.encode({
  batches: [batch]
}).finish()


request.post({
    url: 'http://localhost:8008/batches',
    body: batchListBytes,
    headers: {'Content-Type': 'application/octet-stream'}
}, (err, response) => {
    if (err){
      res.send({error:err})
    }
    else{
      res.send({success:response})
    }
})

})

app.get('/',(req,res)=>{
  request.get('http://localhost:8008/state/91747944f12ee39a6ebd0cb736c1bbb4ef5ac8159569dd63f2cb43fc99546712336f60',
  (err,resp)=>{
    if(err){
      console.log(err)
    }else{
      console.log(resp.body)
      let data = JSON.parse(resp.body);
      
      res.send({data:Buffer.from(data.data, 'base64').toString('ascii')})
    }
  })
})
 
app.listen(3000)