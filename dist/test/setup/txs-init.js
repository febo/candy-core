"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitTransactions = void 0;
const amman_client_1 = require("@metaplex-foundation/amman-client");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const program = __importStar(require("../../src/generated"));
const generated_1 = require("../../src/generated");
const _1 = require(".");
const utils_1 = require("../utils");
const js_1 = require("@metaplex-foundation/js");
const METAPLEX_PROGRAM_ID = new web3_js_1.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
class InitTransactions {
    constructor(resuseKeypairs = false) {
        this.resuseKeypairs = resuseKeypairs;
        this.getKeypair = resuseKeypairs ? _1.amman.loadOrGenKeypair : _1.amman.genLabeledKeypair;
    }
    async payer() {
        const [payer, payerPair] = await this.getKeypair('Payer');
        const connection = new web3_js_1.Connection(amman_client_1.LOCALHOST, 'confirmed');
        await _1.amman.airdrop(connection, payer, 2);
        const transactionHandler = _1.amman.payerTransactionHandler(connection, payerPair);
        return {
            fstTxHandler: transactionHandler,
            connection,
            payer,
            payerPair,
        };
    }
    async authority() {
        const [authority, authorityPair] = await this.getKeypair('Authority');
        const connection = new web3_js_1.Connection(amman_client_1.LOCALHOST, 'confirmed');
        await _1.amman.airdrop(connection, authority, 2);
        const transactionHandler = _1.amman.payerTransactionHandler(connection, authorityPair);
        return {
            fstTxHandler: transactionHandler,
            connection,
            authority,
            authorityPair,
        };
    }
    async minter() {
        const [minter, minterPair] = await this.getKeypair('Minter');
        const connection = new web3_js_1.Connection(amman_client_1.LOCALHOST, 'confirmed');
        await _1.amman.airdrop(connection, minter, 2);
        const transactionHandler = _1.amman.payerTransactionHandler(connection, minterPair);
        return {
            fstTxHandler: transactionHandler,
            connection,
            minter,
            minterPair,
        };
    }
    async initialize(t, payer, data, handler, connection) {
        const metaplex = js_1.Metaplex.make(connection).use((0, js_1.keypairIdentity)(payer));
        const { nft: collection } = await metaplex
            .nfts()
            .create({
            uri: utils_1.COLLECTION_METADATA,
            name: 'CORE Collection',
            sellerFeeBasisPoints: 500,
        })
            .run();
        const [, candyMachine] = await this.getKeypair('Candy Machine Account');
        const authorityPda = (0, js_1.findCandyMachineCreatorPda)(candyMachine.publicKey, program.PROGRAM_ID);
        await _1.amman.addr.addLabel('Collection Mint', collection.address);
        const collectionAuthorityRecord = (0, js_1.findCollectionAuthorityRecordPda)(collection.mint.address, authorityPda);
        await _1.amman.addr.addLabel('Collection Authority Record', collectionAuthorityRecord);
        const collectionMetadata = (0, js_1.findMetadataPda)(collection.mint.address);
        await _1.amman.addr.addLabel('Collection Metadata', collectionMetadata);
        const collectionMasterEdition = (0, js_1.findMasterEditionV2Pda)(collection.mint.address);
        await _1.amman.addr.addLabel('Collection Master Edition', collectionMasterEdition);
        const accounts = {
            authorityPda,
            collectionUpdateAuthority: collection.updateAuthorityAddress,
            candyMachine: candyMachine.publicKey,
            authority: payer.publicKey,
            payer: payer.publicKey,
            collectionMetadata,
            collectionMint: collection.address,
            collectionMasterEdition,
            collectionAuthorityRecord,
            tokenMetadataProgram: METAPLEX_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
        };
        const args = {
            data: data,
        };
        const ixInitialize = program.createInitializeInstruction(accounts, args);
        const ixCreateAccount = web3_js_1.SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: candyMachine.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption((0, utils_1.getCandyMachineSpace)(data)),
            space: (0, utils_1.getCandyMachineSpace)(data),
            programId: program.PROGRAM_ID,
        });
        const tx = new web3_js_1.Transaction().add(ixCreateAccount).add(ixInitialize);
        const txPromise = handler.sendAndConfirmTransaction(tx, [candyMachine, payer], 'tx: Initialize');
        return { tx: txPromise, candyMachine: candyMachine.publicKey };
    }
    async addConfigLines(t, candyMachine, payer, lines) {
        const accounts = {
            candyMachine: candyMachine,
            authority: payer.publicKey,
        };
        const txs = [];
        let start = 0;
        while (start < lines.length) {
            const limit = Math.min(lines.length - start, 10);
            const args = {
                configLines: lines.slice(start, start + limit),
                index: start,
            };
            const ix = program.createAddConfigLinesInstruction(accounts, args);
            txs.push(new web3_js_1.Transaction().add(ix));
            start = start + limit;
        }
        return { txs };
    }
    async updateCandyMachine(t, candyMachine, payer, data, handler) {
        const accounts = {
            candyMachine: candyMachine,
            authority: payer.publicKey,
        };
        const args = {
            data: data,
        };
        const ix = program.createUpdateInstruction(accounts, args);
        const tx = new web3_js_1.Transaction().add(ix);
        return { tx: handler.sendAndConfirmTransaction(tx, [payer], 'tx: Update') };
    }
    async mint(t, candyMachine, payer, handler, connection) {
        const candyMachineObject = await generated_1.CandyMachine.fromAccountAddress(connection, candyMachine);
        const [nftMint, mintPair] = await this.getKeypair('mint');
        await _1.amman.addr.addLabel('NFT Mint', nftMint);
        const nftMetadata = (0, js_1.findMetadataPda)(nftMint);
        const nftMasterEdition = (0, js_1.findMasterEditionV2Pda)(nftMint);
        const nftTokenAccount = (0, js_1.findAssociatedTokenAccountPda)(nftMint, payer.publicKey);
        const collectionMint = candyMachineObject.collectionMint;
        const metaplex = js_1.Metaplex.make(connection).use((0, js_1.keypairIdentity)(payer));
        const collection = await metaplex.nfts().findByMint({ mintAddress: collectionMint }).run();
        const authorityPda = (0, js_1.findCandyMachineCreatorPda)(candyMachine, program.PROGRAM_ID);
        const collectionAuthorityRecord = (0, js_1.findCollectionAuthorityRecordPda)(collectionMint, authorityPda);
        const collectionMetadata = (0, js_1.findMetadataPda)(collectionMint);
        const collectionMasterEdition = (0, js_1.findMasterEditionV2Pda)(collectionMint);
        const accounts = {
            candyMachine: candyMachine,
            authorityPda,
            mintAuthority: candyMachineObject.mintAuthority,
            payer: payer.publicKey,
            nftMint,
            nftMintAuthority: payer.publicKey,
            nftMetadata,
            nftMasterEdition,
            collectionAuthorityRecord,
            collectionMint,
            collectionUpdateAuthority: collection.updateAuthorityAddress,
            collectionMetadata,
            collectionMasterEdition,
            tokenMetadataProgram: METAPLEX_PROGRAM_ID,
            recentSlothashes: web3_js_1.SYSVAR_SLOT_HASHES_PUBKEY,
        };
        const ixs = [];
        ixs.push(web3_js_1.SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: nftMint,
            lamports: await connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
            space: spl_token_1.MintLayout.span,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }));
        ixs.push((0, spl_token_1.createInitializeMintInstruction)(nftMint, 0, payer.publicKey, payer.publicKey));
        ixs.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, nftTokenAccount, payer.publicKey, nftMint));
        ixs.push((0, spl_token_1.createMintToInstruction)(nftMint, nftTokenAccount, payer.publicKey, 1, []));
        ixs.push(program.createMintInstruction(accounts));
        const tx = new web3_js_1.Transaction().add(...ixs);
        return {
            tx: handler.sendAndConfirmTransaction(tx, [payer, mintPair], 'tx: Mint'),
            mintAddress: nftMint,
        };
    }
    async withdraw(t, candyMachine, payer, handler) {
        const accounts = {
            candyMachine: candyMachine,
            authority: payer.publicKey,
        };
        const ix = program.createWithdrawInstruction(accounts);
        const tx = new web3_js_1.Transaction().add(ix);
        return { tx: handler.sendAndConfirmTransaction(tx, [payer], 'tx: Withdraw') };
    }
}
exports.InitTransactions = InitTransactions;
//# sourceMappingURL=txs-init.js.map