import { ethers } from "ethers";

// Must match your Blockchain branch's .env.example
const RPC_URL = process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ABI matching YOUR actual SangPoints.sol contract
const ABI = [
  "function mintPoints(address to, uint256 amount) external",
  "function redeemPoints(address from, uint256 amount) external",
  "function balanceOf(address wallet) external view returns (uint256)",
  "function owner() external view returns (address)",
  "function totalSupply() external view returns (uint256)",
];

let _contract: ethers.Contract | null = null;

function getContract(): ethers.Contract {
  if (_contract) return _contract;
  if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
    throw new Error("[sangpoints] PRIVATE_KEY or CONTRACT_ADDRESS not set");
  }
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  _contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  return _contract;
}

export async function mintPoints(walletAddress: string, amount: number): Promise<string> {
  if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.warn("⚠️ [Blockchain] Missing keys. Returning mock tx hash.");
    return `0xmock_${Date.now().toString(16)}`;
  }
  try {
    const contract = getContract();
    const tx = await contract.mintPoints(walletAddress, BigInt(amount));
    await tx.wait();
    console.log(`[sangpoints] ✅ Minted ${amount} SANG → ${walletAddress} | tx: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("[Blockchain] ❌ Error minting points:", error);
    throw new Error("Blockchain minting failed");
  }
}

export async function getBalance(walletAddress: string): Promise<number> {
  if (!CONTRACT_ADDRESS) {
    return 0;
  }
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const balance = await contract.balanceOf(walletAddress);
    return Number(balance);
  } catch (error) {
    console.error("[Blockchain] ❌ Error fetching balance:", error);
    return 0;
  }
}

export async function redeemPoints(walletAddress: string, amount: number): Promise<string> {
  if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
    return `0xmock_redeem_${Date.now().toString(16)}`;
  }
  try {
    const contract = getContract();
    const tx = await contract.redeemPoints(walletAddress, BigInt(amount));
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("[Blockchain] ❌ Error redeeming points:", error);
    throw new Error("Blockchain redemption failed");
  }
}
