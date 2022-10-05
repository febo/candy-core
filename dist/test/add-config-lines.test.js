"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const setup_1 = require("./setup");
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('add_config_lines', async (t) => {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler, payerPair, connection } = await API.payer();
    const items = 100;
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
            .assertSuccess(t, [/New config line added/i]);
    }
});
(0, tape_1.default)('add_config_lines (hidden settings)', async (t) => {
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
            name: 'Hidden NFT',
            uri: 'https://arweave.net/uJSdJIsz_tYTcjUEWdeVSj0aR90K-hjDauATWZSi-tQ',
            hash: Buffer.from('74bac30d82a0baa41dd2bee4b41bbc36').toJSON().data,
        },
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
            .assertError(t, /do not have config lines/i);
    }
});
(0, tape_1.default)('add_config_lines (incomplete)', async (t) => {
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
    for (let i = 0; i < items - 5; i++) {
        lines[i] = {
            name: `NFT #${i + 1}`,
            uri: 'uJSdJIsz_tYTcjUEWdeVSj0aR90K-hjDauATWZSi-tQ',
        };
    }
    const { txs } = await API.addConfigLines(t, address, payerPair, lines);
    for (const tx of txs) {
        await fstTxHandler
            .sendAndConfirmTransaction(tx, [payerPair], 'tx: AddConfigLines')
            .assertSuccess(t, [/New config line added/i]);
    }
    const { tx: mintTransaction } = await API.mint(t, address, payerPair, fstTxHandler, connection);
    await mintTransaction.assertError(t, /Not all config lines were added/i);
});
//# sourceMappingURL=add-config-lines.test.js.map