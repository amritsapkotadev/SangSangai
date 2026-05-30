import { expect } from "chai";
import { ethers } from "hardhat";
import { SangPoints } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("SangPoints", () => {
  let sangPoints: SangPoints;
  let owner: HardhatEthersSigner;
  let guideWallet: HardhatEthersSigner;
  let otherWallet: HardhatEthersSigner;

  beforeEach(async () => {
    [owner, guideWallet, otherWallet] = await ethers.getSigners();
    const SangPointsFactory = await ethers.getContractFactory("SangPoints");
    sangPoints = await SangPointsFactory.deploy(owner.address);
    await sangPoints.waitForDeployment();
  });

  it("should have correct name and symbol", async () => {
    expect(await sangPoints.name()).to.equal("SangPoints");
    expect(await sangPoints.symbol()).to.equal("SANG");
  });

  it("should mint 200 SangPoints to guide wallet on trip completion", async () => {
    const amount = ethers.parseEther("200");
    await sangPoints.mint(guideWallet.address, amount, "TRIP_001");
    expect(await sangPoints.getBalance(guideWallet.address)).to.equal(amount);
  });

  it("should emit PointsMinted event on mint", async () => {
    const amount = ethers.parseEther("200");
    await expect(sangPoints.mint(guideWallet.address, amount, "TRIP_001"))
      .to.emit(sangPoints, "PointsMinted")
      .withArgs(guideWallet.address, amount, "TRIP_001");
  });

  it("should only allow owner to mint", async () => {
    const amount = ethers.parseEther("200");
    await expect(
      sangPoints.connect(otherWallet).mint(guideWallet.address, amount, "TRIP_001")
    ).to.be.revertedWithCustomError(sangPoints, "OwnableUnauthorizedAccount");
  });

  it("should burn SangPoints on redemption", async () => {
    const mintAmount = ethers.parseEther("500");
    const burnAmount = ethers.parseEther("100");
    await sangPoints.mint(guideWallet.address, mintAmount, "TRIP_001");
    await sangPoints.burn(guideWallet.address, burnAmount, "REDEEM_MERCHANDISE");
    expect(await sangPoints.getBalance(guideWallet.address)).to.equal(
      mintAmount - burnAmount
    );
  });

  it("should revert on direct transfer (non-transferable)", async () => {
    const amount = ethers.parseEther("100");
    await sangPoints.mint(guideWallet.address, amount, "TRIP_001");
    await expect(
      sangPoints.connect(guideWallet).transfer(otherWallet.address, amount)
    ).to.be.revertedWith("SangPoints: non-transferable");
  });
});
