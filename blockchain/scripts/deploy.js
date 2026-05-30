// scripts/deploy.js
// Run: npx hardhat run scripts/deploy.js --network amoy

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("─────────────────────────────────────────────");
  console.log("  Deploying SangPoints to", hre.network.name);
  console.log("─────────────────────────────────────────────");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Deploy
  const SangPoints = await hre.ethers.getContractFactory("SangPoints");
  const sangpoints = await SangPoints.deploy();
  await sangpoints.waitForDeployment();

  const contractAddress = await sangpoints.getAddress();
  console.log("✅ SangPoints deployed to:", contractAddress);
  console.log("   Transaction hash:      ", sangpoints.deploymentTransaction().hash);

  // ── Write deployment info ────────────────────────────────────────────────
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: sangpoints.deploymentTransaction().hash,
  };

  const outPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });
  fs.writeFileSync(
    path.join(outPath, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n📄 Deployment info saved to deployments/${hre.network.name}.json`);

  // ── Copy ABI to lib/ for Next.js ─────────────────────────────────────────
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/SangPoints.sol/SangPoints.json"
  );

  // lib/ lives one level up in the Next.js root
  const libPath = path.join(__dirname, "../../lib");
  if (!fs.existsSync(libPath)) fs.mkdirSync(libPath, { recursive: true });

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  fs.writeFileSync(
    path.join(libPath, "SangPointsABI.json"),
    JSON.stringify(artifact.abi, null, 2)
  );
  console.log("📦 ABI copied to lib/SangPointsABI.json (ready for Next.js)\n");

  console.log("─────────────────────────────────────────────");
  console.log("Next steps:");
  console.log("  1. Add to your .env:");
  console.log(`     CONTRACT_ADDRESS=${contractAddress}`);
  console.log("  2. Run seed: npx hardhat run scripts/seedDemo.js --network amoy");
  console.log("  3. Verify:   npx hardhat verify --network amoy", contractAddress);
  console.log("─────────────────────────────────────────────");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
