"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drain = void 0;
const src_1 = require("../../src");
const bn_js_1 = require("bn.js");
const js_1 = require("@metaplex-foundation/js");
const setup_1 = require("../setup");
async function drain(t, candyMachine, payer, handler, connection) {
    const API = new setup_1.InitTransactions();
    const candyMachineObject = await src_1.CandyMachine.fromAccountAddress(connection, candyMachine);
    const available = new bn_js_1.BN(candyMachineObject.data.itemsAvailable).toNumber() -
        new bn_js_1.BN(candyMachineObject.itemsRedeemed).toNumber();
    const indices = [];
    for (let i = 0; i < available; i++) {
        const { tx: mintTransaction, mintAddress } = await API.mint(t, candyMachine, payer, handler, connection);
        await mintTransaction.assertNone();
        const metaplex = js_1.Metaplex.make(connection).use((0, js_1.keypairIdentity)(payer));
        const nft = await metaplex.nfts().findByMint({ mintAddress }).run();
        indices.push(parseInt(nft.name));
    }
    return indices;
}
exports.drain = drain;
//# sourceMappingURL=minter.js.map