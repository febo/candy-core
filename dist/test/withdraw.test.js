"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const setup_1 = require("./setup");
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('withdraw', async (t) => {
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
    let accountInfo = await connection.getAccountInfo(payerPair.publicKey);
    const balance = accountInfo.lamports;
    const { tx: withdrawTransaction } = await API.withdraw(t, address, payerPair, fstTxHandler);
    await withdrawTransaction.assertSuccess(t);
    accountInfo = await connection.getAccountInfo(payerPair.publicKey);
    const updatedBalance = accountInfo.lamports;
    t.true(updatedBalance > balance, 'balance after withdraw must be greater');
});
//# sourceMappingURL=withdraw.test.js.map