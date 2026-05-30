import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SangPoints with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC");

  // Deploy contract — deployer becomes the owner (the backend wallet)
  const SangPoints = await ethers.getContractFactory("SangPoints");
  const sangPoints = await SangPoints.deploy(deployer.address);
  await sangPoints.waitForDeployment();

  const contractAddress = await sangPoints.getAddress();
  console.log("\n✅ SangPoints deployed!");
  console.log("   Contract address:", contractAddress);
  console.log("   Owner (backend wallet):", deployer.address);
  console.log("\n📋 Add to your Next.js .env.local:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);

  // Mint 500 demo points to deployer wallet for hackathon demo
  const demoAmount = ethers.parseEther("500");
  const tx = await sangPoints.mint(deployer.address, demoAmount, "DEMO_SEED");
  await tx.wait();
  console.log("\n🪙 Minted 500 SangPoints to demo wallet for hackathon demo");
  console.log("   TX hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
