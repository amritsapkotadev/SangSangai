// test/SangPoints.test.js
// Run: npx hardhat test

const { expect }      = require("chai");
const { ethers }      = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("SangPoints", function () {
  // ── Fixture — deploy fresh contract before each test ─────────────────────
  async function deploySangPointsFixture() {
    const [owner, guide1, guide2, stranger] = await ethers.getSigners();

    const SangPoints = await ethers.getContractFactory("SangPoints");
    const sangpoints = await SangPoints.deploy();

    return { sangpoints, owner, guide1, guide2, stranger };
  }

  // ── Deployment ────────────────────────────────────────────────────────────
  describe("Deployment", function () {
    it("should set the deployer as owner", async function () {
      const { sangpoints, owner } = await loadFixture(deploySangPointsFixture);
      expect(await sangpoints.owner()).to.equal(owner.address);
    });

    it("should start with zero totalSupply", async function () {
      const { sangpoints } = await loadFixture(deploySangPointsFixture);
      expect(await sangpoints.totalSupply()).to.equal(0n);
    });

    it("should have correct name and symbol", async function () {
      const { sangpoints } = await loadFixture(deploySangPointsFixture);
      expect(await sangpoints.name()).to.equal("SangPoints");
      expect(await sangpoints.symbol()).to.equal("SANG");
      expect(await sangpoints.decimals()).to.equal(0n);
    });
  });

  // ── mintPoints ────────────────────────────────────────────────────────────
  describe("mintPoints", function () {
    it("should mint 200 SangPoints to a guide on trip completion", async function () {
      const { sangpoints, guide1 } = await loadFixture(deploySangPointsFixture);

      await sangpoints.mintPoints(guide1.address, 200n);

      expect(await sangpoints.balanceOf(guide1.address)).to.equal(200n);
      expect(await sangpoints.totalSupply()).to.equal(200n);
    });

    it("should accumulate points across multiple trips", async function () {
      const { sangpoints, guide1 } = await loadFixture(deploySangPointsFixture);

      await sangpoints.mintPoints(guide1.address, 200n); // trip 1
      await sangpoints.mintPoints(guide1.address, 200n); // trip 2

      expect(await sangpoints.balanceOf(guide1.address)).to.equal(400n);
    });

    it("should emit PointsMinted event", async function () {
      const { sangpoints, guide1 } = await loadFixture(deploySangPointsFixture);

      await expect(sangpoints.mintPoints(guide1.address, 200n))
        .to.emit(sangpoints, "PointsMinted")
        .withArgs(guide1.address, 200n, 200n);
    });

    it("should revert if caller is not owner", async function () {
      const { sangpoints, guide1, stranger } = await loadFixture(deploySangPointsFixture);

      await expect(
        sangpoints.connect(stranger).mintPoints(guide1.address, 200n)
      ).to.be.revertedWith("SangPoints: caller is not owner");
    });

    it("should revert on zero address", async function () {
      const { sangpoints } = await loadFixture(deploySangPointsFixture);

      await expect(
        sangpoints.mintPoints(ethers.ZeroAddress, 200n)
      ).to.be.revertedWith("SangPoints: mint to zero address");
    });

    it("should revert on zero amount", async function () {
      const { sangpoints, guide1 } = await loadFixture(deploySangPointsFixture);

      await expect(
        sangpoints.mintPoints(guide1.address, 0n)
      ).to.be.revertedWith("SangPoints: amount must be > 0");
    });
  });

  // ── redeemPoints ──────────────────────────────────────────────────────────
  describe("redeemPoints", function () {
    it("should redeem points correctly", async function () {
      const { sangpoints, guide1 } = await loadFixture(deploySangPointsFixture);

      await sangpoints.mintPoints(guide1.address, 500n);
      await sangpoints.redeemPoints(guide1.address, 200n);

      expect(await sangpoints.balanceOf(guide1.address)).to.equal(300n);
      expect(await sangpoints.totalSupply()).to.equal(300n);
    });

    it("should emit PointsRedeemed event", async function () {
      const { sangpoints, guide1 } = await loadFixture(deploySangPointsFixture);

      await sangpoints.mintPoints(guide1.address, 500n);

      await expect(sangpoints.redeemPoints(guide1.address, 200n))
        .to.emit(sangpoints, "PointsRedeemed")
        .withArgs(guide1.address, 200n, 300n);
    });

    it("should revert if insufficient balance", async function () {
      const { sangpoints, guide1 } = await loadFixture(deploySangPointsFixture);

      await sangpoints.mintPoints(guide1.address, 100n);

      await expect(
        sangpoints.redeemPoints(guide1.address, 200n)
      ).to.be.revertedWith("SangPoints: insufficient balance");
    });

    it("should revert if caller is not owner", async function () {
      const { sangpoints, guide1, stranger } = await loadFixture(deploySangPointsFixture);

      await sangpoints.mintPoints(guide1.address, 200n);

      await expect(
        sangpoints.connect(stranger).redeemPoints(guide1.address, 100n)
      ).to.be.revertedWith("SangPoints: caller is not owner");
    });
  });

  // ── balanceOf ─────────────────────────────────────────────────────────────
  describe("balanceOf", function () {
    it("should return 0 for a wallet that never received points", async function () {
      const { sangpoints, stranger } = await loadFixture(deploySangPointsFixture);
      expect(await sangpoints.balanceOf(stranger.address)).to.equal(0n);
    });

    it("should return correct balances for multiple guides", async function () {
      const { sangpoints, guide1, guide2 } = await loadFixture(deploySangPointsFixture);

      await sangpoints.mintPoints(guide1.address, 200n);
      await sangpoints.mintPoints(guide2.address, 400n);

      expect(await sangpoints.balanceOf(guide1.address)).to.equal(200n);
      expect(await sangpoints.balanceOf(guide2.address)).to.equal(400n);
    });
  });

  // ── transferOwnership ─────────────────────────────────────────────────────
  describe("transferOwnership", function () {
    it("should transfer ownership to a new address", async function () {
      const { sangpoints, owner, stranger } = await loadFixture(deploySangPointsFixture);

      await sangpoints.transferOwnership(stranger.address);
      expect(await sangpoints.owner()).to.equal(stranger.address);
    });

    it("should emit OwnershipTransferred event", async function () {
      const { sangpoints, owner, stranger } = await loadFixture(deploySangPointsFixture);

      await expect(sangpoints.transferOwnership(stranger.address))
        .to.emit(sangpoints, "OwnershipTransferred")
        .withArgs(owner.address, stranger.address);
    });

    it("should allow new owner to mint", async function () {
      const { sangpoints, stranger, guide1 } = await loadFixture(deploySangPointsFixture);

      await sangpoints.transferOwnership(stranger.address);
      await sangpoints.connect(stranger).mintPoints(guide1.address, 200n);

      expect(await sangpoints.balanceOf(guide1.address)).to.equal(200n);
    });

    it("should revert if non-owner calls transferOwnership", async function () {
      const { sangpoints, stranger } = await loadFixture(deploySangPointsFixture);

      await expect(
        sangpoints.connect(stranger).transferOwnership(stranger.address)
      ).to.be.revertedWith("SangPoints: caller is not owner");
    });
  });

  // ── Full trip simulation ──────────────────────────────────────────────────
  describe("Full trip simulation (Aarav completes Mardi Himal)", function () {
    it("should award 200 SangPoints on trip completion", async function () {
      const { sangpoints, guide1: aarav } = await loadFixture(deploySangPointsFixture);

      const startBalance = await sangpoints.balanceOf(aarav.address);
      expect(startBalance).to.equal(0n);

      // Trip completed → backend calls mintPoints(aarav.walletAddress, 200)
      const tx = await sangpoints.mintPoints(aarav.address, 200n);
      await tx.wait();

      const finalBalance = await sangpoints.balanceOf(aarav.address);
      expect(finalBalance).to.equal(200n);

      console.log(`    ✔ Aarav earned 200 SangPoints. Tx: ${tx.hash}`);
    });
  });
});
