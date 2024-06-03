import { SignerWithAddress } from "../node_modules/@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import timestring from "timestring";
import { TestTokenClaimable } from "../typechain-types";

describe("Smoke Tests ", async () => {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let token: TestTokenClaimable;
  let amount: bigint;

  before(async () => {
    [owner, alice] = await ethers.getSigners();

    token = await (
      await ethers.getContractFactory("TestTokenClaimable")
    ).deploy(owner.address, owner.address);
  });

  amount = ethers.parseEther("4");

  context("Base TestTokenClaimable contract functionality", async () => {
    it("should allow only the owner of the contract to call setClaimAmount function", async () => {
      await expect(token.connect(owner).setClaimAmount(amount)).to.not.be
        .reverted;
      await expect(token.connect(alice).setClaimAmount(amount)).to.be.reverted;
    });

    it("should allow only the owner of the contract to call mint function", async () => {
      await expect(token.connect(owner).mint(amount)).to.not.be.reverted;
      await expect(token.connect(alice).mint(amount)).to.be.reverted;
    });

    it("should allow the contract owner to change owner", async () => {
      await token.connect(owner).transferOwnership(alice);

      const amount = ethers.parseEther("50");
      await expect(token.connect(owner).setClaimAmount(amount)).to.be.reverted;

      await token.connect(alice).transferOwnership(owner);
    });

    it("should send tokens to the user correctly", async () => {
      const balanceBefore = await token.balanceOf(owner);
      await token.setTimeOut(timestring("12 hours"));
      await token.claim();
      const balanceAfter = await token.balanceOf(owner);
      expect(balanceAfter).to.be.equal(balanceBefore + amount);
    });

    it("should not allow users to claim more often than 12 hours after claiming", async () => {
      await time.increase(timestring("10 hours 5 minutes"));
      await expect(token.claim()).to.be.revertedWithCustomError(
        token,
        "ClaimTimeout"
      );
    });

    it("should allow the user to get the correct amount after updating the claimAmount", async () => {
      const balanceBefore = await token.balanceOf(owner);
      const amount = ethers.parseEther("9");
      await token.connect(owner).setClaimAmount(amount);

      await time.increase(timestring("12 hours 1 seconds"));
      await token.claim();

      const balanceAfter = await token.balanceOf(owner);
      expect(balanceAfter).to.be.equal(balanceBefore + amount);
    });

    it("should allow calling the claim() function after timeout update and not revert", async () => {
      const newTimeout = timestring("56 minutes");
      await token.setTimeOut(newTimeout);
      await time.increase(newTimeout);
      await expect(token.claim()).to.not.be.reverted;

      const newNewTimeout = timestring("53 hours");
      await token.setTimeOut(newNewTimeout);
      await time.increase(newNewTimeout);
      await expect(token.claim()).to.not.be.reverted;
    });

    it("should not allow users to claim before timeOut expires", async () => {
      await token.setTimeOut(timestring("42 minutes"));
      const timeToTimeout = timestring("40 minutes");
      await time.increase(timeToTimeout);
      await expect(token.claim()).to.be.revertedWithCustomError(
        token,
        "ClaimTimeout"
      );
    });

    it("should allow to update timeout only to an owner", async () => {
      await expect(
        token.connect(alice).setTimeOut(0)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });
});
