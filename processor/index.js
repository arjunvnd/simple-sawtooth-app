const { TransactionProcessor } = require('sawtooth-sdk/processor')

const SimpleStoreHandler = require('./handler')
const transactionProcessor = new TransactionProcessor("tcp://validator:4004")


transactionProcessor.addHandler(new SimpleStoreHandler())

transactionProcessor.start()
console.log(`Starting bank transaction processor`)
console.log(`Connecting to Sawtooth validator at tcp://localhost:4004`)