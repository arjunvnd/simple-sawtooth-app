import axios from "axios";
import { createHash } from 'crypto-browserify';
import { CryptoFactory, createContext } from "sawtooth-sdk/signing";
import * as protobuf from 'sawtooth-sdk/protobuf';
import { Secp256k1PrivateKey } from 'sawtooth-sdk/signing/secp256k1';
import { TextEncoder, TextDecoder } from "text-encoding/lib/encoding";
import { Buffer } from 'buffer/';

const api = 'http://localhost:8008/'

export const sendData = async (data) => {
    try {
        let response = await axios.post(`${api}batches`, data)
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