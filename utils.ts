import { ethers, BytesLike, utils } from "ethers";

import dotenv from "dotenv";
dotenv.config();

export interface BlockHashWitness {
    blockNumber: number,
    claimedBlockHash: BytesLike,
    prevHash: BytesLike,
    numFinal: number
    merkleProof: BytesLike[]
}

async function getBlockHashes(startBlockNumber: number): Promise<string[]> {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const blockPromises = [];
  for (let i = startBlockNumber; i < startBlockNumber + 1024; i++) {
    blockPromises.push(provider.getBlock(i));
  }
  const blocks = await Promise.all(blockPromises);
  return blocks.map((block) => block.hash);
}

function createMerkleProof(leaves: string[], leafIndex: number): string[] {
    const depth = Math.floor(Math.log2(leaves.length));
    const hashes = leaves.slice();
    const proof = [];
    for (let i = 0; i < depth; i++) {
        const side = leafIndex >> i;
        proof.push(hashes[side ^ 1]);
        let rng = 1 << (depth - i);
        for (let x = 0; x < rng; x += 2) {
            let right = hashes[x + 1].slice(2);
            hashes[x >> 1] = utils.keccak256(hashes[x].concat(right));
        }
    }
    return proof;
}

  async function generateBlockHashWitness(blockNumber: number): Promise<BlockHashWitness> {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL); // needs archive node

    const uniswapV2Pair = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc';
    const axiomAddress = '0x01d5b501C1fc0121e1411970fb79c322737025c2';

    const startBlockNumber = Math.floor(blockNumber / 1024) * 1024;
    const startBlock = await provider.getBlock(startBlockNumber);

    let blockHashes: string[] = [];
    blockHashes = await getBlockHashes(startBlockNumber);
    console.log('blockHashes: ', blockHashes);
    const proof = createMerkleProof(blockHashes, 0);

    // const numFinal = axiom.getNumFinal(blockNumber);
    // const merkleProof = await provider.send('eth_getProof', [uniswapV2Pair, [], ethers.utils.hexlify(blockNumber)]);

    return {
      blockNumber,
      claimedBlockHash: blockHashes[blockNumber - startBlockNumber],
      prevHash: startBlock.parentHash,
      numFinal: 1024,
      merkleProof: proof,
    };
}

// main();

// from 10008576 to 16416686
// twap = 0x080ccc27484ea6460d851f

// testing - should give
// "blockNumber":       10008576,
// "claimedBlockHash":  "0xd0b30e90846a01049bf3fc9add461ff3390ff1999425e5a9081a0b97a59fed87",
// "prevHash":          "0x6783d994e5dbf742d882e4ed49dd5b37b61ed455e4a8bc823bb768acc5d652ef",
// "numFinal":          1024,
// "merkleProof":
// ["0x12b7ee37d7421d7e9717c7ea53349afd731e79dda2c8a50a7baaa040dc61eb31",
//  "0x6ebecba91adf01a65614265be3072fc629c768f7984fa5147be0f5c4bb11f4df",
//  "0xd9cb72024ca7c350152d9489181ae2094033fe13ed08eaf61d2ae9bb970818cc",
//  "0x7510272682a1bdb44f5a0ba81de2a093d5eb7672a2b755f0833495664339caab",
//  "0x24f739b00c5cc321ed01b01d28431b09a9ef265cee476bf995e532d820f87ceb",
//  "0x46c14b436ca92e3c058bdca8bfb651c6207438fb2982599bed1b01f36d1eed0b",
//  "0x72b841eb5af49ec08c72f5eab2c176f372d03598499c3bb8fe557cf0e02706f4",
//  "0x6f6c4248e3e5540268ef978faa0fa3c4d3b247838297a8b81d65773b033034fd",
//  "0x782520dcb3cc4cbe13dfb7adf638c8d4ed9af6efb5e17c86357b5ad873f438d6",
//  "0xd84381dd42a0e362b818657a4f6bc6baaae3925dec4aba1ce37bae64d0b10324"]}

generateBlockHashWitness(10008576).then(console.log);
