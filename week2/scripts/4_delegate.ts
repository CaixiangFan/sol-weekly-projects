import { Contract, ethers } from "ethers";
import { EXPOSED_KEY, setupProvider } from "./utils"
import "dotenv/config";
import * as myTokenJson from "../artifacts/contracts/Token.sol/MyToken.json";
import { MyToken } from "../typechain";

async function main() {
    const wallet =
        process.env.PRIVATE_KEY_2 && process.env.PRIVATE_KEY_2.length > 0
            ? new ethers.Wallet(process.env.PRIVATE_KEY_2)
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
    
    const myTokenContract: MyToken = new Contract(
        myTokenAddress,
        myTokenJson.abi,
        signer
    ) as MyToken;

    const tx = await myTokenContract.delegate(
        wallet.address,
    );
    await tx.wait();
    console.log(`Transaction completed. Hash: ${tx.hash}`);
    console.log(`Voting power delegated to ${wallet.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});