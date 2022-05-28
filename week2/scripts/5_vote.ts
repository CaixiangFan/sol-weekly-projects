import { Contract, ethers } from "ethers";
import { EXPOSED_KEY, setupProvider} from "./utils"
import "dotenv/config";
import * as customBalletJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import { CustomBallot } from "../typechain";

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

    let ballotContractAddress: string = String(process.env.BALLOT_CONTRACT_ADDRESS);
    
    const customBalletContract: CustomBallot = new Contract(
        ballotContractAddress,
        customBalletJson.abi,
        signer
    ) as CustomBallot;

    if (process.argv.length < 3) throw new Error("Vote proposal missing");
    const proposal = Number(process.argv[2]);
    if (process.argv.length < 4) throw new Error("Vote amount missing");
    const amount = ethers.utils.parseEther(process.argv[3]);

    console.log("Proposal voted: ", proposal);
    console.log("Amount of votes given: ", process.argv[3]);

    const tx = await customBalletContract.vote(
        proposal,
        amount
    );
    await tx.wait();
    console.log(`Transaction completed. Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});