import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Token } from "../typechain";

describe("Interaction with Token contract", function () {

  let accounts: SignerWithAddress[];
  let tokenContract: Token;
  let tokenContractFactory: any;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    tokenContractFactory = await ethers.getContractFactory("Token");
    tokenContract = await tokenContractFactory.deploy();
    await tokenContract.deployed();
  });

  describe("State of Token contract pre-mint", async () => {
    it("should show total supply is 0", async () => {
      const totalSupplyMinted = await tokenContract.totalSupply();
      expect(totalSupplyMinted).to.eq(0);
    });

    it("should show that mint price is 0.005 ether", async () => {
      const tokenMintPriceBN = await tokenContract.MINT_PRICE();
      const tokenMintPriceInEther = Number(ethers.utils.formatEther(tokenMintPriceBN.toString()));
      expect(tokenMintPriceInEther).to.eq(0.005);
    });

    it("should show currentTotalFreeMint is 0", async () => {
      const currentTotalFreeMint = await tokenContract.currentTotalFreeMint();
      expect(currentTotalFreeMint).to.eq(0);
    });

    it("should only allow owner to set base URI", async () => {
      const owner = accounts[0];
      const attacker = accounts[1];

      const tx1 = await tokenContract.connect(owner).setBaseURI("abc");
      await tx1.wait();

      let updatedTokenURI = await tokenContract.baseURISet();
      expect(updatedTokenURI).to.eq("abc");

      await expect(tokenContract.connect(attacker).setBaseURI("xyz")).to.be.reverted;

      const tx2 = await tokenContract.connect(owner).setBaseURI("def");
      await tx2.wait();

      updatedTokenURI = await tokenContract.baseURISet();
      expect(updatedTokenURI).to.eq("def");

    });

    it("should not allow owner to set base URI after swtich is of", async () => {
      await tokenContract.toggleOffBaseURISwitch();
      await expect(tokenContract.setBaseURI("ghi")).to.be.revertedWith(
        "Cannot change base URI anymore"
      );
    });

    it("should show that minting is off by default and attempt to mint will fail", async () => {

      const isMintingSwitchedOn = await tokenContract.mintActive();
      expect(isMintingSwitchedOn).to.eq(false);

      const mintingWallet = accounts[1];

      await expect(
        tokenContract.connect(mintingWallet).mintTokens(1))
        .to.be.revertedWith("Minting has not started");

      try {
        const tx = await tokenContract.connect(mintingWallet).mintTokens(1);
        await tx.wait();
      } catch (e) {
        console.log(e);
      }
      const hasWalletMintedFreeToken =
        await tokenContract.alreadyMintedFreeByWallet(mintingWallet.address);

      expect(hasWalletMintedFreeToken).to.eq(false);
    });

  })

  describe("Mint is active and minting 1 token for the first time", async () => {

    beforeEach(async () => {
      await tokenContract.toggleMintActivation(true);
    });

    it("should enable the minting of 1 token by 1 user", async () => {
      const owner = accounts[0];
      const mintingWallet1 = accounts[1];
      const mintingWallet2 = accounts[2];

      const tx0 = await tokenContract.connect(owner).setBaseURI("abc");
      await tx0.wait();

      try {
        const tx = await tokenContract.connect(mintingWallet1).mintTokens(1);
        await tx.wait();
      } catch (e) {
        console.log(e);
      }
      const hasWalletMintedFreeToken =
        await tokenContract.alreadyMintedFreeByWallet(mintingWallet1.address);
      expect(hasWalletMintedFreeToken).to.eq(true);

      const token1URI = await tokenContract.tokenURI(1);
      expect(token1URI).to.eq("abc1");

      const ownerOfToken1 = await tokenContract.ownerOf(1);
      expect(ownerOfToken1).to.eq(mintingWallet1.address);

      const mintingWalletTokenBalance = await tokenContract.balanceOf(mintingWallet1.address);
      expect(mintingWalletTokenBalance).to.eq(1);

      const hasMintingWallet2MintedFreeToken =
        await tokenContract.alreadyMintedFreeByWallet(mintingWallet2.address);
      expect(hasMintingWallet2MintedFreeToken).to.eq(false);
    });

    it("should enable the minting of 1 token by multiple users", async () => {
      const mintingWallet1 = accounts[1];
      const mintingWallet2 = accounts[2];
      const mintingWallet3 = accounts[3];
      const mintingWallet4 = accounts[4];
      const mintingWallet5 = accounts[5];

      const tx1 = await tokenContract.connect(mintingWallet1).mintTokens(1);
      await tx1.wait();

      const tx2 = await tokenContract.connect(mintingWallet2).mintTokens(1);
      await tx2.wait();

      const tx3 = await tokenContract.connect(mintingWallet3).mintTokens(1);
      await tx3.wait();

      const tx4 = await tokenContract.connect(mintingWallet4).mintTokens(1);
      await tx4.wait();

      const tx5 = await tokenContract.connect(mintingWallet5).mintTokens(1);
      await tx5.wait();

      const hasMintingWallet1MintedFreeToken =
        await tokenContract.alreadyMintedFreeByWallet(mintingWallet1.address);
      expect(hasMintingWallet1MintedFreeToken).to.eq(true);

      const hasMintingWallet2MintedFreeToken =
        await tokenContract.alreadyMintedFreeByWallet(mintingWallet2.address);
      expect(hasMintingWallet2MintedFreeToken).to.eq(true);

      const hasMintingWallet3MintedFreeToken =
        await tokenContract.alreadyMintedFreeByWallet(mintingWallet3.address);
      expect(hasMintingWallet3MintedFreeToken).to.eq(true);

      const hasMintingWallet4MintedFreeToken =
        await tokenContract.alreadyMintedFreeByWallet(mintingWallet4.address);
      expect(hasMintingWallet4MintedFreeToken).to.eq(true);

      const hasMintingWallet5MintedFreeToken =
        await tokenContract.alreadyMintedFreeByWallet(mintingWallet5.address);
      expect(hasMintingWallet5MintedFreeToken).to.eq(true);

      const totalNumberOfTokensMinted = await tokenContract.totalSupply();
      expect(totalNumberOfTokensMinted).to.eq(5);

    });


    it("should disallow minting once minting is switched off", async () => {

      await tokenContract.toggleMintActivation(false);
      const isMintingSwitchedOn = await tokenContract.mintActive();
      expect(isMintingSwitchedOn).to.eq(false);

      const mintingWallet1 = accounts[1];

      await expect(
        tokenContract.connect(mintingWallet1).mintTokens(1)
      ).to.be.revertedWith("Minting has not started");

      const mintingWallet1Balance = await tokenContract
        .balanceOf(mintingWallet1.address);

      expect(mintingWallet1Balance).to.eq(0);

    });
  });

  describe("Mint is active and minting multiple tokens", async () => {

    beforeEach(async () => {
      await tokenContract.toggleMintActivation(true);
    });

    it("should allow a wallet to mint 2 tokens at one go by paying 0.005 ethers", async () => {
      const mintingWallet1 = accounts[1];
      try {
        const tx = await tokenContract
          .connect(mintingWallet1)
          .mintTokens(2, { value: ethers.utils.parseEther("0.005") });
        await tx.wait();
      } catch (e) {
        console.log(e);
      }

      const nonMintingWallet1 = accounts[1];
      const mintingWallet1Balance = await tokenContract.balanceOf(
        nonMintingWallet1.address
      );
      expect(mintingWallet1Balance).to.eq(2);
    });

    it("should allow a wallet to mint 4 tokens at one go by paying 0.015 ethers", async () => {
      const mintingWallet1 = accounts[1];
      try {
        const tx = await tokenContract
          .connect(mintingWallet1)
          .mintTokens(4, { value: ethers.utils.parseEther("0.015") });
        await tx.wait();
      } catch (e) {
        console.log(e);
      }

      const mintingWallet1Balance = await tokenContract.balanceOf(
        mintingWallet1.address
      );
      expect(mintingWallet1Balance).to.eq(4);

    });

    it("should not allow a wallet to mint 7 tokens at one go by paying 0.030 ethers", async () => {
      const mintingWallet1 = accounts[1];
      try {
        const tx = await tokenContract
          .connect(mintingWallet1)
          .mintTokens(7, { value: ethers.utils.parseEther("0.030") });
        await tx.wait();
      } catch (e) {
        console.log(e);
      }

      const mintingWallet1Balance = await tokenContract.balanceOf(
        mintingWallet1.address
      );
      expect(mintingWallet1Balance).to.eq(0);
    });

    it("should not allow a wallet to mint 2 tokens without paying at least 0.005 ethers", async () => {
      const mintingWallet1 = accounts[1];
      await expect(tokenContract.connect(mintingWallet1).mintTokens(2)).to.be.revertedWith("Not enough ether paid");

      const mintingWallet1Balance = await tokenContract.balanceOf(
        mintingWallet1.address
      );
      expect(mintingWallet1Balance).to.eq(0);
    });

    it("should not allow a wallet to mint a second token for free", async () => {
      const mintingWallet1 = accounts[1];

      const tx = await tokenContract.connect(mintingWallet1).mintTokens(1);
      await tx.wait();

      const mintingWallet1Balance = await tokenContract.balanceOf(
        mintingWallet1.address
      );
      expect(mintingWallet1Balance).to.eq(1);

      await expect(
        tokenContract.connect(mintingWallet1).mintTokens(1)
      ).to.be.revertedWith("Not enough ether paid");
      expect(mintingWallet1Balance).to.eq(1);

    });

    it("should not allow minting once max total supply is hit", async () => {
      const mintingWallet1 = accounts[1];
      const mintingWallet2 = accounts[2];
      const mintingWallet3 = accounts[3];
      const mintingWallet4 = accounts[4];
      const mintingWallet5 = accounts[5];
      const mintingWallet6 = accounts[6];

      const tx1 = await tokenContract
        .connect(mintingWallet1)
        .mintTokens(4, { value: ethers.utils.parseEther("0.15") });
      await tx1.wait();

      const tx2 = await tokenContract
        .connect(mintingWallet2)
        .mintTokens(4, { value: ethers.utils.parseEther("0.015") });
      await tx2.wait();

      const tx3 = await tokenContract
        .connect(mintingWallet3)
        .mintTokens(2, { value: ethers.utils.parseEther("0.005") });
      await tx3.wait();

      await expect(
        tokenContract
          .connect(mintingWallet6)
          .mintTokens(4, { value: ethers.utils.parseEther("0.015") })
      ).to.be.revertedWith("Not enough tokens left to mint");

      const totalSupplyMinted = await tokenContract.totalSupply();
      expect(totalSupplyMinted).to.eq(10);

    });

    it("should not allow free mints once free mint limit is hit", async () => {
      const numberOfAccounts: any = 5;
      let accountIndex: any = 1;
      let walletNamePrefix: string = "mintingWallet";

      while (accountIndex <= numberOfAccounts) {
        const tx = await tokenContract
          .connect(accounts[accountIndex])
          .mintTokens(1);
        await tx.wait();
        accountIndex++;
      }

      const totalNumberOfTokensMinted = await tokenContract.totalSupply();
      expect(totalNumberOfTokensMinted).to.eq(5);

      await expect(
        tokenContract.connect(accounts[6]).mintTokens(1)
      ).to.be.revertedWith("Not enough ether paid");

    });

    it("should allow paid mints even when fee mint limit is hit", async () => {
      const numberOfAccounts: any = 5;
      let accountIndex: any = 1;
      let walletNamePrefix: string = "mintingWallet";

      while (accountIndex <= numberOfAccounts) {
        const tx = await tokenContract
          .connect(accounts[accountIndex])
          .mintTokens(1);
        await tx.wait();
        accountIndex++;
      }

      let totalNumberOfTokensMinted = await tokenContract.totalSupply();
      expect(totalNumberOfTokensMinted).to.eq(5);

      await expect(
        tokenContract.connect(accounts[6]).mintTokens(1)
      ).to.be.revertedWith("Not enough ether paid");

      const tx2 = await tokenContract
        .connect(accounts[6])
        .mintTokens(1, { value: ethers.utils.parseEther("0.005") });
      await tx2.wait();

      const mintingWallet16Balance = await tokenContract.balanceOf(
        accounts[6].address
      );
      expect(mintingWallet16Balance).to.eq(1);

      totalNumberOfTokensMinted = await tokenContract.totalSupply();
      expect(totalNumberOfTokensMinted).to.eq(6);

    });
  });

  describe("token burning", async () => {
    beforeEach(async () => {
      await tokenContract.toggleMintActivation(true);
    });

    it("should allow owner to burn their token", async () => {
      const mintingWallet1 = accounts[1];
      const mintingWallet2 = accounts[2];
      try {
        const tx = await tokenContract
          .connect(mintingWallet1)
          .mintTokens(4, { value: ethers.utils.parseEther("0.015") });
        await tx.wait();
      } catch (e) {
        console.log(e);
      }
      const totalSupplyBeforeBurnBN = await tokenContract.totalSupply();

      const totalSupplyBeforeBurn = totalSupplyBeforeBurnBN.toNumber();
      expect(totalSupplyBeforeBurn).to.eq(4);

      await tokenContract.connect(mintingWallet1).burnMyToken(2);

      const totalSupplyAfterBurnBN = await tokenContract.totalSupply();
      const totalSupplyAfterBurn = await totalSupplyAfterBurnBN.toNumber();
      expect(totalSupplyAfterBurn).to.eq(3);

      await expect(tokenContract.ownerOf(2)).to.be.reverted;
    });

    it("should not allow non-owner to burn others' token", async () => {
      const mintingWallet1 = accounts[1];
      const nonMintingWallet1 = accounts[2];
      try {
        const tx = await tokenContract
          .connect(mintingWallet1)
          .mintTokens(4, { value: ethers.utils.parseEther("0.015") });
        await tx.wait();
      } catch (e) {
        console.log(e);
      }

      await expect(
        tokenContract.connect(nonMintingWallet1).burnMyToken(2)
      ).to.be.revertedWith("Cannot burn others' tokens");
    });

  })

  describe("ethers in contract", async () => {
    beforeEach(async () => {
      await tokenContract.toggleMintActivation(true);
    });

    it("should hold 0.015 ethers after a wallet minted 4 tokens by paying 0.015 ethers", async () => {
      const mintingWallet1 = accounts[1];
      try {
        const tx = await tokenContract
          .connect(mintingWallet1)
          .mintTokens(4, { value: ethers.utils.parseEther("0.015") });
        await tx.wait();
      } catch (e) {
        console.log(e);
      }

      const mintingWallet1Balance = await tokenContract.balanceOf(
        mintingWallet1.address
      );
      expect(mintingWallet1Balance).to.eq(4);

      const contractBalanceBN = await ethers.provider.getBalance(
        tokenContract.address
      );
      const contractBalanceInEthers = ethers.utils.formatEther(
        contractBalanceBN.toString()
      );
      expect(contractBalanceInEthers).to.eq("0.015");
    });

    it("should allow owner to withdraw ethers", async () => {
      const owner = accounts[0];
      const mintingWallet1 = accounts[1];
      try {
        const tx = await tokenContract
          .connect(mintingWallet1)
          .mintTokens(4, { value: ethers.utils.parseEther("0.015") });
        await tx.wait();
      } catch (e) {
        console.log(e);
      }

      const mintingWallet1Balance = await tokenContract.balanceOf(
        mintingWallet1.address
      );
      expect(mintingWallet1Balance).to.eq(4);

      let contractBalanceBN = await ethers.provider.getBalance(
        tokenContract.address
      );
      let contractBalanceInEthers = ethers.utils.formatEther(
        contractBalanceBN.toString()
      );
      expect(contractBalanceInEthers).to.eq("0.015");

      const ownerwalletBalanceBeforeBN = await owner.getBalance();

      const tx2 = await tokenContract.withdrawFundsPaid();
      await tx2.wait();
      console.log(tx2.gasPrice);

      contractBalanceBN = await ethers.provider.getBalance(
        tokenContract.address
      );

      contractBalanceInEthers = ethers.utils.formatEther(
        contractBalanceBN.toString()
      );
      expect(contractBalanceInEthers).to.eq("0.0");
    });

    it("should not allow non-owner to withdraw", async () => {
      const owner = accounts[0];
      const mintingWallet1 = accounts[1];
      try {
        const tx = await tokenContract
          .connect(mintingWallet1)
          .mintTokens(4, { value: ethers.utils.parseEther("0.015") });
        await tx.wait();
      } catch (e) {
        console.log(e);
      }

      const mintingWallet1Balance = await tokenContract.balanceOf(
        mintingWallet1.address
      );
      expect(mintingWallet1Balance).to.eq(4);

      let contractBalanceBN = await ethers.provider.getBalance(
        tokenContract.address
      );
      let contractBalanceInEthers = ethers.utils.formatEther(
        contractBalanceBN.toString()
      );
      expect(contractBalanceInEthers).to.eq("0.015");

      await expect(tokenContract.connect(accounts[1]).withdrawFundsPaid()).to.be.reverted;


      contractBalanceBN = await ethers.provider.getBalance(
        tokenContract.address
      );

      contractBalanceInEthers = ethers.utils.formatEther(
        contractBalanceBN.toString()
      );
      expect(contractBalanceInEthers).to.eq("0.015");
    });

    it("should allow accounts to send ethers to it directly", async () => {
      await accounts[1].sendTransaction({
        to: tokenContract.address,
        value: ethers.utils.parseEther("1")
      })
      const contractBalanceBN = await ethers.provider.getBalance(
        tokenContract.address
      );

      const contractBalanceInEthers = ethers.utils.formatEther(
        contractBalanceBN.toString()
      );
      expect(contractBalanceInEthers).to.eq("1.0");

    });
  });
});


