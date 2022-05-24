import { Contract, ethers } from "ethers";
import "dotenv/config";
import { MyToken, CustomBallot } from "../typechain";
import * as myTokenJson from "../artifacts/contracts/Token.sol/MyToken.json";
import * as customBallotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

function setupProvider() {
    const infuraOptions = process.env.INFURA_API_KEY
        ? process.env.INFURA_API_SECRET
        ? {
            projectId: process.env.INFURA_API_KEY,
            projectSecret: process.env.INFURA_API_SECRET,
            }
        : process.env.INFURA_API_KEY
        : "";
    const options = {
        alchemy: process.env.ALCHEMY_API_KEY,
        infura: infuraOptions,
    };
    const provider = ethers.providers.getDefaultProvider("ropsten", options);
    return provider;
}

async function main() {
    const wallet =
        process.env.PRIVATE_KEY_2 && process.env.PRIVATE_KEY_2.length > 0
            ? new ethers.Wallet(process.env.PRIVATE_KEY_2)
            : new ethers.Wallet(EXPOSED_KEY);

    console.log(`Using address ${wallet.address}`);
    
    const myTokenAddress: string = String(process.env.TOKEN_CONTRACT_ADDRESS);

    const provider = setupProvider();
    const signer = wallet.connect(provider);

    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    if (balance < 0.01) {
      throw new Error("Not enough ether");
    }
    
    const myTokenContract: MyToken = new Contract(
        myTokenAddress,
        myTokenJson.abi,
        signer
    ) as MyToken;

    const numTokens = await myTokenContract.balanceOf(wallet.address);
    console.log(`Available tokens of ${wallet.address}: ${ethers.utils.formatEther(numTokens)}`)
    
    const numVotes = await myTokenContract.getVotes(wallet.address);
    console.log(`Total votes of ${wallet.address}: ${ethers.utils.formatEther(numVotes)}`);

    const blockNum = await provider.getBlockNumber();
    const votesAtSnapshotBN = await myTokenContract.getPastVotes(wallet.address, blockNum - 1);
    const votesAtSnapshot = ethers.utils.formatEther(votesAtSnapshotBN.toString());
    console.log(`Past votes at snapshot block number ${blockNum-1} is: ${votesAtSnapshot.toString()}`);

    const ballotContractAddress: string = String(process.env['BALLOT_CONTRACT_ADDRESS']);
    const customBalletContract: CustomBallot = new Contract(
        ballotContractAddress,
        customBallotJson.abi,
        signer
    ) as CustomBallot;
    const spentVotingPower = await customBalletContract.spentVotePower(wallet.address);
    console.log(`Spent voting power: ${ethers.utils.formatEther(spentVotingPower)}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});