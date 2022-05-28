import { Contract, ethers } from "ethers";
import { EXPOSED_KEY, setupProvider} from "./utils"
import "dotenv/config";
import { CustomBallot } from "../typechain";
import * as customBallotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";

async function main() {
const wallet =
    process.env.PRIVATE_KEY_2 && process.env.PRIVATE_KEY_2.length > 0
        ? new ethers.Wallet(process.env.PRIVATE_KEY_2)
        : new ethers.Wallet(EXPOSED_KEY);

  console.log(`Using address ${wallet.address}`);
  const provider = setupProvider();
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  const ballotContractAddress: string = String(process.env.BALLOT_CONTRACT_ADDRESS);

  const customBalletContract: CustomBallot = new Contract(
    ballotContractAddress,
    customBallotJson.abi,
    signer
  ) as CustomBallot;

  const votingPowerBN = await customBalletContract.votingPower();
  const votingPower = ethers.utils.formatEther(votingPowerBN);
  
  console.log(`Voting Power of ${wallet.address} is:  ${votingPower}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});