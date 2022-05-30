import { Contract, ethers } from "ethers";
import { EXPOSED_KEY, setupProvider } from "./utils"
import "dotenv/config";
import { MyToken, CustomBallot } from "../typechain";
import * as myTokenJson from "../artifacts/contracts/Token.sol/MyToken.json";
import * as customBallotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";

const PROPOSALS_NUM = 3;

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

    console.log("Query all proposals.")
    for (let index=0; index < PROPOSALS_NUM; index++) {
      const proposal = await customBalletContract.proposals(index);
      const proposalName = ethers.utils.parseBytes32String(proposal.name);
      const proposalVoteCount = ethers.utils.formatEther(proposal.voteCount.toString());
      console.log(`Proposal Name: ${proposalName} with Vote Count: ${proposalVoteCount}`); 
    }
    const winnerName = await customBalletContract.winnerName();
    console.log(`The winner is: ${ethers.utils.parseBytes32String(winnerName)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});