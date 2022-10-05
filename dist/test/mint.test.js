"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const setup_1 = require("./setup");
const minter_1 = require("./utils/minter");
const spok_1 = __importDefault(require("spok"));
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('mint (authority)', async (t) => {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler, payerPair, connection } = await API.payer();
    const items = 10;
    const data = {
        itemsAvailable: items,
        symbol: 'CORE',
        sellerFeeBasisPoints: 500,
        maxSupply: 0,
        isMutable: true,
        creators: [
            {
                address: payerPair.publicKey,
                verified: false,
                percentageShare: 100,
            },
        ],
        configLineSettings: {
            prefixName: 'TEST ',
            nameLength: 10,
            prefixUri: 'https://arweave.net/',
            uriLength: 50,
            isSequential: false,
        },
        hiddenSettings: null,
    };
    const { tx: transaction, candyMachine: address } = await API.initialize(t, payerPair, data, fstTxHandler, connection);
    await transaction.assertSuccess(t);
    const lines = [];
    for (let i = 0; i < items; i++) {
        lines[i] = {
            name: `NFT #${i + 1}`,
            uri: 'uJSdJIsz_tYTcjUEWdeVSj0aR90K-hjDauATWZSi-tQ',
        };
    }
    const { txs } = await API.addConfigLines(t, address, payerPair, lines);
    for (const tx of txs) {
        await fstTxHandler
            .sendAndConfirmTransaction(tx, [payerPair], 'tx: AddConfigLines')
            .assertSuccess(t);
    }
    const { tx: mintTransaction } = await API.mint(t, address, payerPair, fstTxHandler, connection);
    await mintTransaction.assertSuccess(t);
});
(0, tape_1.default)('mint (sequential)', async (t) => {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler, payerPair, connection } = await API.payer();
    const items = 10;
    const data = {
        itemsAvailable: items,
        symbol: 'CORE',
        sellerFeeBasisPoints: 500,
        maxSupply: 0,
        isMutable: true,
        creators: [
            {
                address: payerPair.publicKey,
                verified: false,
                percentageShare: 100,
            },
        ],
        configLineSettings: {
            prefixName: '$ID+1$',
            nameLength: 0,
            prefixUri: 'https://arweave.net/',
            uriLength: 50,
            isSequential: true,
        },
        hiddenSettings: null,
    };
    const { tx: transaction, candyMachine: address } = await API.initialize(t, payerPair, data, fstTxHandler, connection);
    await transaction.assertSuccess(t);
    const lines = [];
    for (let i = 0; i < items; i++) {
        lines[i] = {
            name: '',
            uri: 'uJSdJIsz_tYTcjUEWdeVSj0aR90K-hjDauATWZSi-tQ',
        };
    }
    const { txs } = await API.addConfigLines(t, address, payerPair, lines);
    for (const tx of txs) {
        await fstTxHandler
            .sendAndConfirmTransaction(tx, [payerPair], 'tx: AddConfigLines')
            .assertSuccess(t);
    }
    const indices = await (0, minter_1.drain)(t, address, payerPair, fstTxHandler, connection);
    const expected = Array.from({ length: indices.length }, (x, i) => i + 1);
    (0, spok_1.default)(t, indices, expected);
    const { tx: mintTransaction } = await API.mint(t, address, payerPair, fstTxHandler, connection);
    await mintTransaction.assertError(t, /Candy machine is empty/i);
});
(0, tape_1.default)('mint (random)', async (t) => {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler, payerPair, connection } = await API.payer();
    const items = 10;
    const data = {
        itemsAvailable: items,
        symbol: 'CORE',
        sellerFeeBasisPoints: 500,
        maxSupply: 0,
        isMutable: true,
        creators: [
            {
                address: payerPair.publicKey,
                verified: false,
                percentageShare: 100,
            },
        ],
        configLineSettings: {
            prefixName: '$ID+1$',
            nameLength: 0,
            prefixUri: 'https://arweave.net/',
            uriLength: 50,
            isSequential: false,
        },
        hiddenSettings: null,
    };
    const { tx: transaction, candyMachine: address } = await API.initialize(t, payerPair, data, fstTxHandler, connection);
    await transaction.assertSuccess(t);
    const lines = [];
    for (let i = 0; i < items; i++) {
        lines[i] = {
            name: '',
            uri: 'uJSdJIsz_tYTcjUEWdeVSj0aR90K-hjDauATWZSi-tQ',
        };
    }
    const { txs } = await API.addConfigLines(t, address, payerPair, lines);
    for (const tx of txs) {
        await fstTxHandler
            .sendAndConfirmTransaction(tx, [payerPair], 'tx: AddConfigLines')
            .assertSuccess(t);
    }
    const indices = await (0, minter_1.drain)(t, address, payerPair, fstTxHandler, connection);
    const expected = Array.from({ length: indices.length }, (x, i) => i + 1);
    t.notDeepEqual(indices, expected);
    indices.sort(function (a, b) {
        return a - b;
    });
    (0, spok_1.default)(t, indices, expected);
    const { tx: mintTransaction } = await API.mint(t, address, payerPair, fstTxHandler, connection);
    await mintTransaction.assertError(t, /Candy machine is empty/i);
});
(0, tape_1.default)('mint (hidden settings)', async (t) => {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler, payerPair, connection } = await API.payer();
    const items = 10;
    const data = {
        itemsAvailable: items,
        symbol: 'CORE',
        sellerFeeBasisPoints: 500,
        maxSupply: 0,
        isMutable: true,
        creators: [
            {
                address: payerPair.publicKey,
                verified: false,
                percentageShare: 100,
            },
        ],
        configLineSettings: null,
        hiddenSettings: {
            name: '$ID+1$',
            uri: 'https://arweave.net/uJSdJIsz_tYTcjUEWdeVSj0aR90K-hjDauATWZSi-tQ',
            hash: Buffer.from('74bac30d82a0baa41dd2bee4b41bbc36').toJSON().data,
        },
    };
    const { tx: transaction, candyMachine: address } = await API.initialize(t, payerPair, data, fstTxHandler, connection);
    await transaction.assertSuccess(t);
    const indices = await (0, minter_1.drain)(t, address, payerPair, fstTxHandler, connection);
    const expected = Array.from({ length: indices.length }, (x, i) => i + 1);
    (0, spok_1.default)(t, indices, expected);
    const { tx: mintTransaction } = await API.mint(t, address, payerPair, fstTxHandler, connection);
    await mintTransaction.assertError(t, /Candy machine is empty/i);
});
//# sourceMappingURL=mint.test.js.map