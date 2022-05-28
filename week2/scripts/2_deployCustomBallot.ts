import { ethers } from "ethers";
import { EXPOSED_KEY, setupProvider, convertStringArrayToBytes32} from "./utils"
import "dotenv/config";
import * as ballotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";

async function main() {
  const wallet =
    process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length > 0
        ? new ethers.Wallet(process.env.PRIVATE_KEY)
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
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  const proposals = process.argv.slice(2);
  if (proposals.length < 3) throw new Error("Not enough proposals provided");
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  const ballotFactory = new ethers.ContractFactory(
    ballotJson.abi,
    ballotJson.bytecode,
    signer
  );
  const voteToken: string = String(process.env.TOKEN_CONTRACT_ADDRESS);
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals),
    voteToken
  );
  console.log("Awaiting confirmations");
  await ballotContract.deployed();
  console.log("Completed");
  console.log(`Contract deployed at ${ballotContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});