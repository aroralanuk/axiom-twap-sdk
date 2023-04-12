import { ethers, BytesLike } from "ethers";

import dotenv from "dotenv";
dotenv.config();

export interface BlockHashWitness {
    blockNumber: number,
    claimedBlockHash: BytesLike,
    prevHash: BytesLike,
    numFinal: number
    merkleProof: BytesLike[]
}

async function generateBlockHashWitness(blockNumber: number): Promise<BlockHashWitness> {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL); // needs archive node

    const block = await provider.getBlock(blockNumber);
    const blockHash = block.hash;

    // const numFinal = axiom.getNumFinal(blockNumber);
    const merkleProof = await provider.send("eth_getProof", ...);


    return {
        blockNumber,
        claimedBlockHash: blockHash,
        prevHash: merkleProof.parentHash,
        numFinal: 1024,
        merkleProof: merkleProof.proof
    }
}
