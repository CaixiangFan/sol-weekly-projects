import { Contract, ethers } from "ethers";
import { EXPOSED_KEY, setupProvider} from "./utils"
import "dotenv/config";
import * as myTokenJson from "../artifacts/contracts/Token.sol/MyToken.json";
import { MyToken } from "../typechain";

async function main() {
    const wallet =
        process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length > 0
            ? new ethers.Wallet(process.env.PRIVATE_KEY)
            : new ethers.Wallet(EXPOSED_KEY);

    console.log(`Using address ${wallet.address}`);
    
    let myTokenAddress: string = String(process.env.TOKEN_CONTRACT_ADDRESS);

    const provider = setupProvider();
    const signer = wallet.connect(provider);

    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    if (balance < 0.01) {
      throw new Error("Not enough ether");
    }

    if (process.argv.length < 3) throw new Error("To address missing");
    const address = process.argv[2];
    if (process.argv.length < 4) throw new Error("Mint amount missing");
    const amount = ethers.utils.parseEther(process.argv[3]);

    console.log("address: ", address, typeof address);
    console.log("amount: ", amount, typeof amount);
    
    const myTokenContract: MyToken = new Contract(
        myTokenAddress,
        myTokenJson.abi,
        signer
    ) as MyToken;

    const tx = await myTokenContract.mint(
        address,
        amount
    );
    await tx.wait();
    console.log(`Transaction completed. Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});