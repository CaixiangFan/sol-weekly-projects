import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";
const PROPOSALS_NUM = 3;

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
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = setupProvider();
  const signer = wallet.connect(provider);

  const ballotAddress: string = String(process.env.CONTRACT_ADDRESS);
    
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;
    
  if (process.argv.length < 3) {
    console.log("Query all proposals.")
    for (let index=0; index < PROPOSALS_NUM; index++) {
      const proposal = await ballotContract.getProposal(index);
      console.log("Awaiting proposal query");      
      const proposalName = ethers.utils.parseBytes32String(proposal.name);
      const proposalVoteCount = proposal.voteCount.toString();
      console.log(`Proposal Name: ${proposalName} with Vote Count: ${proposalVoteCount}`); 
    }
  }else {
    console.log("Arguments entered:", process.argv.slice(2));
    const index_array = process.argv.slice(2);
    const index = index_array[0];
    console.log(typeof index)

    const proposal = await ballotContract.getProposal(index);
    console.log("Awaiting proposal query");
    console.log(proposal);
    
    const proposalName = ethers.utils.parseBytes32String(proposal.name);
    console.log("Proposal Name: ", proposalName);

    const proposalVoteCount = proposal.voteCount;
    console.log("Vote Count: ", proposalVoteCount.toString());;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
