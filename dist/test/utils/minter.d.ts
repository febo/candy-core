import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Test } from 'tape';
import { PayerTransactionHandler } from '@metaplex-foundation/amman-client';
export declare function drain(t: Test, candyMachine: PublicKey, payer: Keypair, handler: PayerTransactionHandler, connection: Connection): Promise<number[]>;
