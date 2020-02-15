import axios from "axios";
import {
    createHash
} from 'crypto-browserify';
import {
    CryptoFactory,
    createContext
} from "sawtooth-sdk/signing";
import * as protobuf from 'sawtooth-sdk/protobuf';
import {
    Secp256k1PrivateKey
} from 'sawtooth-sdk/signing/secp256k1';
// import {
//     TextEncoder,
//     TextDecoder
// } from "text-encoding/lib/encoding";
import {
    Buffer
} from 'buffer/';

const api = 'http://localhost:8008/'

const FAMILY_NAME = 'simplestore';
const FAMILY_VERSION = '1.0';

// const encoder = new TextEncoder('utf8');
const privateKeyHex = '66ad89d0ff29b0267fba72ea8d40ef7975e10f8acde8d50d20cdf56ba9599c5d';

const context = createContext('secp256k1');
const secp256k1pk = getSecp256k1pk(privateKeyHex);

const signer = getSignerInstanceForPrivateKey(context, secp256k1pk);
const publicKey = getPublicKeyAsHex(signer);
const address = getAddressOfCurrentUser(FAMILY_NAME, publicKey);

function hash(v) {
    return createHash('sha512').update(v).digest('hex');
  }

function getEncodedPayload(action, values) {
    const data = action + "," + values;
    console.log("data =" + data)
    return new TextEncoder('utf8').encode(data);
}

function getTransactionsList(payload) {
    // Create transaction header
    const transactionHeader = getTransactionHeaderBytes([address], [address], payload);
    // Create transaction
    const transaction = getTransaction(transactionHeader, payload);
    // Transaction list
    const transactionsList = [transaction];

    return transactionsList;
}


function getTransactionHeaderBytes(inputAddressList, outputAddressList, payload) {
    const transactionHeaderBytes = protobuf.TransactionHeader.encode({
        familyName: FAMILY_NAME,
        familyVersion: FAMILY_VERSION,
        inputs: inputAddressList,
        outputs: outputAddressList,
        signerPublicKey: publicKey,
        batcherPublicKey: publicKey,
        dependencies: [],
        payloadSha512: hash(payload),
        nonce: (Math.random() * 1000).toString()
    }).finish();

    return transactionHeaderBytes;
}

function getTransaction(transactionHeaderBytes, payloadBytes) {
    const transaction = protobuf.Transaction.create({
        header: transactionHeaderBytes,
        headerSignature: signer.sign(transactionHeaderBytes),
        payload: payloadBytes
    });

    return transaction;
}

function getBatchList(transactionsList) {
    // List of transaction signatures
    const transactionSignatureList = transactionsList.map((tx) => tx.headerSignature);

    // Create batch header
    const batchHeader = getBatchHeaderBytes(transactionSignatureList);
    // Create the batch
    const batch = getBatch(batchHeader, transactionsList);
    // Batch List
    const batchList = getBatchListBytes([batch]);

    return batchList;
}

function getBatchHeaderBytes(transactionSignaturesList) {
    const batchHeader = protobuf.BatchHeader.encode({
        signerPublicKey: publicKey,
        transactionIds: transactionSignaturesList
    }).finish();

    return batchHeader;
}

function getBatch(batchHeaderBytes, transactionsList) {
    const batch = protobuf.Batch.create({
        header: batchHeaderBytes,
        headerSignature: signer.sign(batchHeaderBytes),
        transactions: transactionsList
    });

    return batch;
}

function getBatchListBytes(batchesList) {
    const batchListBytes = protobuf.BatchList.encode({
        batches: batchesList
    }).finish();

    return batchListBytes;
}

// function setCurrentTransactor(pkInput) {
//     try {
//         const context = createContext('secp256k1');
//         const secp256k1pk = getSecp256k1pk(pkInput);

//         signer = getSignerInstanceForPrivateKey(context, secp256k1pk);
//         publicKey = getPublicKeyAsHex(signer);
//         address = getAddressOfCurrentUser(FAMILY_NAME, publicKey);
//     } catch (e) {
//         console.log("Error in reading the key details", e);
//         return false;
//     }
//     return true;
// }

function getSecp256k1pk(pkInput) {
    let secp256k1pk;
    if (pkInput instanceof ArrayBuffer) {
        secp256k1pk = new Secp256k1PrivateKey(Buffer.from(pkInput, 0, 32));
    } else if (typeof (pkInput) == 'string') {
        secp256k1pk = Secp256k1PrivateKey.fromHex(pkInput);
    }
    return secp256k1pk;
}

function getSignerInstanceForPrivateKey(context, secp256k1pk) {
    return new CryptoFactory(context).newSigner(secp256k1pk);
}

function getPublicKeyAsHex(signer) {
    return signer.getPublicKey().asHex();
}

function getAddressOfCurrentUser(familyName, publicKey) {
    let nameSpace = hash(familyName).substr(0, 6);
    let publicKeySpace = hash(publicKey).substr(0, 64);
    return (nameSpace + publicKeySpace);
}



export const sendData = async ({action,value}) => {

    const payload = getEncodedPayload(action, value);

    const transactionsList = getTransactionsList(payload);

    const batchList = getBatchList(transactionsList);
    try {
        let response = await axios.post(`${api}batches`, batchList,  {headers: {'Content-Type': 'application/octet-stream'}})
        getData()
    } catch (error) {
        console.log("Error", error)
        getData()
    }

}

export const getData = async () => {
    try {
        let response = await axios.get(`${api}state`)

    } catch (error) {
        console.log("Error", error)
    }
}