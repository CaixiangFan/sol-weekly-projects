import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as myTokenJson from "../artifacts/contracts/Token.sol/MyToken.json";
import { MyToken } from "../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";
// const BASE_VOTE_POWER = 10;

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

    if (process.argv.length < 3) throw new Error("Minter address missing");
    const address = process.argv[2];
    if (process.argv.length < 4) throw new Error("Mint amount missing");
    const amount = ethers.utils.parseEther(Number(process.argv[3]).toFixed(18));
    // const address = wallet.address;
    // const amount = ethers.utils.parseEther(BASE_VOTE_POWER.toFixed(18))

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