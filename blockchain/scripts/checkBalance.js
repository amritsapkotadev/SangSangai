// scripts/checkBalance.js
// Utility to verify any wallet's SangPoints balance on Amoy.
// Run: npx hardhat run scripts/checkBalance.js --network amoy
//
// Set CHECK_WALLET in your .env, or edit the address below directly.

const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

async function main() {
  // ── Load contract address ─────────────────────────────────────────────────
  const deploymentFile = path.join(
    __dirname,
    `../deployments/${hre.network.name}.json`
  );

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(
      `No deployment found for "${hre.network.name}". Run deploy.js first.`
    );
  }

  const { contractAddress } = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  // ── Attach read-only ──────────────────────────────────────────────────────
  const SangPoints = await hre.ethers.getContractFactory("SangPoints");
  const sangpoints = SangPoints.attach(contractAddress);

  // ── Wallet to check ───────────────────────────────────────────────────────
  const wallet =
    process.env.CHECK_WALLET ||
    process.env.DEMO_WALLET  ||
    (() => { throw new Error("Set CHECK_WALLET=<address> in your .env"); })();

  console.log("─────────────────────────────────────────────");
  console.log("  SangPoints Balance Check");
  console.log("─────────────────────────────────────────────");
  console.log("  Network:  ", hre.network.name);
  console.log("  Contract: ", contractAddress);
  console.log("  Wallet:   ", wallet);
  console.log("─────────────────────────────────────────────");

  const [balance, totalSupply, owner] = await Promise.all([
    sangpoints.balanceOf(wallet),
    sangpoints.totalSupply(),
    sangpoints.owner(),
  ]);

  console.log(`  Balance:      ${balance.toString()} SANG`);
  console.log(`  Total Supply: ${totalSupply.toString()} SANG`);
  console.log(`  Contract Owner: ${owner}`);
  console.log("─────────────────────────────────────────────");

  if (balance === 0n) {
    console.log("  ⚠️  This wallet has 0 SangPoints.");
    console.log("     Run seedDemo.js to pre-load the demo wallet.");
  } else {
    console.log(`  ✅ Wallet is ready with ${balance.toString()} SangPoints!`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
