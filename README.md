# UniswapV2Twap SDK

### Axiom

The Axiom SDK provides a higher level abstraction in Typescript which helps you prove a piece of historical on-chain data. Some examples are:

- UniswapV2Twap - prove and read the TWAP of the ETH-USDC Uniswap V2 pool between any two historical blocks on-chain.
- …


#### UniswapV2Twap.ts

```typescript
import { ethers } from "ethers";

export interface BlockHashWitness {
    blockNumber: number,
    claimedBlockHash: BytesLike,
    prevHash: BytesLike,
    numFinal: number
    merkleProof: BytesLike[]
}

export enum ErrorType {
    BlockHashNotCached = `${} block hash was not validated in cache`,
    InvalidBlockHash = `Invalid ${}Hash in instance`,
    ProofVerificatioFailed = `Proof verification failed`,
    TwapNotProven = `TWAP not proven`,
}

export class UniswapV2Twap<> {

    async verify(
        startBlock: BlockHashWitness,
        endBlock: BlockHashWitness,
        proof: BytesLike
    ): Promise<boolean | ErrorType> {
        try {
            const result = await twapContract.verifyUniswapV2Twap(startBlock, endBlock, proof);
            return true;
        } catch (error) {
            const parsedError: ErrorType = parseErrorMessage(error);
            console.error(`Failed to call contract function ${functionName}: ${parsedError}`);
            return parseError;
        }
    }

    async verify(
        startBlock: number,
        endBlock: number,
        proof: BytesLike
    ): Promis<boolean | ErrorType> {
        const startWitness: BlockHashWitness = await Utils.generateBlockHashWitness(startBlock);
        const endWitness: BlockHashWitness = await Utils.generateBlockHashWitness(startBlock);

        return await verify(startWitness, endWitness, proof);
    }

    async read(
        startBlock: number,
        endBlock: number,
    ) : Promise <number | ErrorType> {
        const twapKey = Utils.generateTwapKey(startBlock, endBlock);

        try {
            const result = await twapContract.twapPris(twapKey);
            if result == 0 {
                return ErrorType.TwapNotProven;
            }
            return result;
        } catch (error) {
            const parsedError: ErrorType = parseErrorMessage(error);
            console.error(`Failed to call contract function ${functionName}: ${parsedError}`);
            return parseError;
        }
    }

    async

}
```

#### Utils.ts

```typescript

async function generateBlockHashWitness(blockNumber: number): Promise<BlockHashWitness> {
    const blockHash = await provider.getBlockHash(blockNumber); //archive node
    const numFinal = axiom.getNumFinal(blockNumber); // get from backend for consecutive roots
    const merkleProof = await provider.send("eth_getProof", ...);
    return {
        blockNumber,
        claimedBlockHash: blockHash,
        prevHash: merkleProof.parentHash,
        numFinal,
        merkleProof: merkleProof.proof
    }
}

// key = uint64(uint64(startBlock.blockNumber) << 32 | endBlock.blockNumber)
function generateTwapKey(startBlock: number, endBlock: number): number {
    return (startBlock << 32) | endBlock;
}

```

### Guide for the SDK

Install using:

```bash
    npm i @axiom-sdk
```

For proving TWAP price you do the following:

```typescript
    const uniswapV2Twap = new UniswapV2Twap()

    const proof = uniswapV2Twap.verify(
```

### Overview of possible features

- Prove TWAP price for any Uniswap V2 pool. While instantiating th
