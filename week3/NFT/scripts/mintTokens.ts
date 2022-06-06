import { Contract, ethers } from "ethers";
import { EXPOSED_KEY, setupProvider } from "./utils"
import "dotenv/config";
import * as myTokenJson from "../artifacts/contracts/Token.sol/Token.json";
import { Token } from "../typechain";

async function main() {
    const wallet =
        process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length > 0
            ? new ethers.Wallet(process.env.PRIVATE_KEY)
            : new ethers.Wallet(EXPOSED_KEY);

    console.log(`Using address ${wallet.address}`);

    let myTokenAddress: string = String(process.env.TOKEN_CONTRACT_ADDRESS_4);

    const provider = setupProvider();
    const signer = wallet.connect(provider);

    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    if (balance < 0.01) {
        throw new Error("Not enough ether");
    }

    if (process.argv.length < 3) throw new Error("Mint amount missing");
    const amount = process.argv[2];

    console.log("amount: ", amount);

    const myTokenContract: Token = new Contract(
        myTokenAddress,
        myTokenJson.abi,
        signer
    ) as Token;

    const _active: boolean = true;
    await myTokenContract.toggleMintActivation(_active);
    console.log("Token mint has been activated! Now you can mint tokens!")

    const tx = await myTokenContract.mintTokens(amount);
    await tx.wait();
    console.log(`Transaction completed. Hash: ${tx.hash}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});