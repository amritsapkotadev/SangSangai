// scripts/seedDemo.js
// Seeds the demo wallet with 500 SangPoints for the hackathon demo.
// Run AFTER deploy.js:
//   npx hardhat run scripts/seedDemo.js --network amoy

const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

async function main() {
  // ── Load deployed contract address ───────────────────────────────────────
  const deploymentFile = path.join(
    __dirname,
    `../deployments/${hre.network.name}.json`
  );

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(
      `No deployment found for network "${hre.network.name}". ` +
      `Run deploy.js first.`
    );
  }

  const { contractAddress } = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log("Using contract at:", contractAddress);

  // ── Attach to contract ───────────────────────────────────────────────────
  const SangPoints = await hre.ethers.getContractFactory("SangPoints");
  const sangpoints = SangPoints.attach(contractAddress);

  // ── Demo wallet — set DEMO_WALLET in your .env ──────────────────────────
  const demoWallet = process.env.DEMO_WALLET;
  if (!demoWallet) {
    throw new Error("Set DEMO_WALLET=<address> in your .env file");
  }

  console.log("\n🎯 Seeding demo wallet:", demoWallet);

  // ── Mint 500 SangPoints ──────────────────────────────────────────────────
  const SEED_AMOUNT = 500n;

  const balanceBefore = await sangpoints.balanceOf(demoWallet);
  console.log("Balance before:", balanceBefore.toString(), "SANG");

  const tx = await sangpoints.mintPoints(demoWallet, SEED_AMOUNT);
  console.log("Minting tx sent:", tx.hash);
  await tx.wait();
  console.log("✅ Confirmed!");

  const balanceAfter = await sangpoints.balanceOf(demoWallet);
  console.log("Balance after: ", balanceAfter.toString(), "SANG");

  console.log("\n─────────────────────────────────────────────");
  console.log("Demo wallet is ready!");
  console.log(`  Wallet:  ${demoWallet}`);
  console.log(`  Balance: ${balanceAfter.toString()} SangPoints`);
  console.log(`  Network: ${hre.network.name}`);
  console.log(`  Explorer: https://amoy.polygonscan.com/tx/${tx.hash}`);
  console.log("─────────────────────────────────────────────");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
