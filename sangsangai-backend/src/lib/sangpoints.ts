import { ethers } from "ethers";

// Using Polygon Amoy Testnet RPC by default
const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Minimal ABI for minting and checking balance
const ABI = [
  "function mint(address to, uint256 amount, string calldata tripId) external",
  "function getBalance(address account) external view returns (uint256)",
];

/**
 * Mints SangPoints to a guide's wallet upon safe trip completion.
 * @param toWallet Guide's wallet address
 * @param amount Number of points to mint (e.g., 200)
 * @param tripId The Trip ID from the database for on-chain traceability
 * @returns Transaction hash or a mock hash if no private key is set
 */
export async function mintPoints(toWallet: string, amount: number, tripId: string): Promise<string> {
  if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.warn("⚠️ [Blockchain] PRIVATE_KEY or CONTRACT_ADDRESS missing. Using mock transaction.");
    // Return a mock transaction hash for local development / UI testing
    return `0xmocktxhash${Math.random().toString(16).slice(2)}...`;
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    // Convert amount to 18 decimals
    const parsedAmount = ethers.parseEther(amount.toString());

    console.log(`[Blockchain] Minting ${amount} SANG to ${toWallet} for trip ${tripId}...`);
    const tx = await contract.mint(toWallet, parsedAmount, tripId);
    
    // Wait for 1 block confirmation
    await tx.wait(1);
    
    console.log(`[Blockchain] ✅ Mint successful! TX: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("[Blockchain] ❌ Error minting points:", error);
    throw new Error("Blockchain minting failed");
  }
}

/**
 * Gets the current SangPoints balance for a guide's wallet.
 * @param walletAddress Guide's wallet address
 * @returns Balance in normal units (e.g., 200)
 */
export async function getBalance(walletAddress: string): Promise<number> {
  if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.warn("⚠️ [Blockchain] PRIVATE_KEY or CONTRACT_ADDRESS missing. Returning mock balance.");
    return 750; // Return mock balance for UI display
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    const balanceWei = await contract.getBalance(walletAddress);
    const balance = ethers.formatEther(balanceWei);
    
    return parseFloat(balance);
  } catch (error) {
    console.error("[Blockchain] ❌ Error fetching balance:", error);
    return 0;
  }
}
