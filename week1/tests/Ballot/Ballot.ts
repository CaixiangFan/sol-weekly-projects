import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function giveRightToVote(ballotContract: Ballot, voterAddress: any) {
  const tx = await ballotContract.giveRightToVote(voterAddress);
  await tx.wait();
}

describe("Ballot", function () {
  let ballotContract: Ballot;
  let accounts: any[];

  this.beforeEach(async function () {
    accounts = await ethers.getSigners();
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
  });

  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount.toNumber()).to.eq(0);
      }
    });

    it("sets the deployer address as chairperson", async function () {
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.eq(accounts[0].address);
    });

    it("sets the voting weight for the chairperson as 1", async function () {
      const chairpersonVoter = await ballotContract.voters(accounts[0].address);
      expect(chairpersonVoter.weight.toNumber()).to.eq(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      const voter = await ballotContract.voters(voterAddress);
      expect(voter.weight.toNumber()).to.eq(1);
    });

    it("can not give right to vote for someone that has voted", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("The voter already voted.");
    });

    it("can not give right to vote for someone that has already voting rights", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("");
    });
  });

  describe("when the voter interact with the vote function in the contract", function () {
    // TODO
    it("vote for Proposal 1", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      const proposal = await ballotContract.proposals(0);
      const voter = await ballotContract.voters(voterAddress);
      expect(proposal.voteCount.toNumber()).to.eq(1);
      expect(voter.voted).to.eq(true);
      expect(voter.vote.toNumber()).to.eq(0);
    });

    it("a voter can not vote again if has already voted", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      await expect(
        ballotContract.connect(accounts[1]).vote(0)
      ).to.be.revertedWith("Already voted.");
    });
  });

  describe("when the voter interact with the delegate function in the contract", function () {
    // TODO
    it("a voter delegates the vote right to another", async function () {
      const voterAddress = accounts[1].address;
      const toAddress = accounts[2].address;
      await giveRightToVote(ballotContract, toAddress);
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).delegate(toAddress);
      const voter = await ballotContract.voters(voterAddress);
      const toVoter = await ballotContract.voters(toAddress);
      expect(voter.voted).to.eq(true);
      expect(voter.delegate).to.eq(toAddress);
      expect(toVoter.voted).to.eq(false);
      expect(toVoter.weight.toNumber()).to.eq(2);
    });
  });

  describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
    // TODO
    it("an attacker can not give vote right to himself", async function () {
      const attackerAddress = accounts[1].address;
      await expect(
        ballotContract.connect(accounts[1]).giveRightToVote(attackerAddress)
      ).to.be.revertedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when the an attacker interact with the vote function in the contract", function () {
    // TODO
    it("an attacker without vote right can not vote", async function () {
      await expect(
        ballotContract.connect(accounts[1]).vote(0)
      ).to.be.revertedWith("Has no right to vote");
    });
  });

  describe("when the an attacker interact with the delegate function in the contract", function () {
    // TODO
    it("an attacker who has voted can not delegate right to another", async function () {
      const attackerAddress = accounts[1].address;
      const voterAddress = accounts[2].address;
      await giveRightToVote(ballotContract, attackerAddress);
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      await expect(
        ballotContract.connect(accounts[1]).delegate(voterAddress)
      ).to.be.revertedWith("You already voted.");
    });

    it("an attacker can not delegate right to self", async function () {
      const attackerAddress = accounts[1].address;
      await giveRightToVote(ballotContract, attackerAddress);
      await expect(
        ballotContract.connect(accounts[1]).delegate(attackerAddress)
      ).to.be.revertedWith("Self-delegation is disallowed.");
    });
  });

  describe("when someone interact with the winningProposal function before any votes are cast", function () {
    // TODO
    it("no votes are cast", async function () {
      const winningProposal = await ballotContract.connect(accounts[1]).winningProposal();
      const winner = await ballotContract.connect(accounts[1]).proposals(winningProposal.toNumber());
      expect(winningProposal.toNumber()).to.eq(0);
      expect(winner.voteCount.toNumber()).to.eq(0);
    });
  });

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    // TODO
    it("one vote is cast", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      const winningProposal = await ballotContract.connect(accounts[1]).winningProposal();
      const winner = await ballotContract.connect(accounts[1]).proposals(winningProposal.toNumber());
      expect(winningProposal.toNumber()).to.eq(0);
      expect(winner.voteCount.toNumber()).to.eq(1);
    });
  });

  describe("when someone interact with the winnerName function before any votes are cast", function () {
    // TODO
    it("return the first proposal if no votes are cast", async function () {
      const winnerName = await ballotContract.connect(accounts[1]).winnerName();
      expect(ethers.utils.parseBytes32String(winnerName)).to.eq(PROPOSALS[0]);
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    // TODO
    it("should return 1 for the winner vote count", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      const winningProposal = await ballotContract.connect(accounts[1]).winningProposal();
      const winner = await ballotContract.connect(accounts[1]).proposals(winningProposal.toNumber());
      const winnerName = await ballotContract.connect(accounts[1]).winnerName();
      expect(winningProposal.toNumber()).to.eq(0);
      expect(winnerName).to.eq(winner.name);
      expect(winner.voteCount.toNumber()).to.eq(1);
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    // TODO
    it("should get one winner after 5 random casts", async function () {
      const votersNum = 5;
      for (let index = 0; index < votersNum; index++) {
        let accountIndex = index + 1;
        const voterAddress = accounts[accountIndex].address;
        await giveRightToVote(ballotContract, voterAddress);
        let voteProposal = Math.floor(Math.random() * (PROPOSALS.length));
        await ballotContract.connect(accounts[accountIndex]).vote(voteProposal);
      };
      const winningProposal = await ballotContract.connect(accounts[1]).winningProposal();
      const winnerName = await ballotContract.connect(accounts[1]).winnerName();
      const winner = await ballotContract.connect(accounts[1]).proposals(winningProposal.toNumber());
      expect(winner.name).to.eq(winnerName);
      expect(winner.voteCount.toNumber()).to.within(0,votersNum);
      console.log(`winner: ${ethers.utils.parseBytes32String(winnerName)} with voteCount ${winner.voteCount.toNumber()}`);
    });
  });
});
