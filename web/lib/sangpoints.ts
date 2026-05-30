import { ethers } from "ethers";
import SangPointsABI from "./SangPointsABI.json";

const AMOY_RPC_URL =
  process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

let _provider: ethers.JsonRpcProvider | null = null;
let _signer: ethers.Wallet | null = null;
let _contract: ethers.Contract | null = null;

function getContract(): ethers.Contract {
  if (_contract) return _contract;

  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "[sangpoints] CONTRACT_ADDRESS is not set. Add it to your .env.local file."
    );
  }
  if (!PRIVATE_KEY) {
    throw new Error(
      "[sangpoints] PRIVATE_KEY is not set. Add it to your .env.local file."
    );
  }

  _provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
  _signer = new ethers.Wallet(PRIVATE_KEY, _provider);
  _contract = new ethers.Contract(CONTRACT_ADDRESS, SangPointsABI, _signer);

  return _contract;
}

export async function mintPoints(
  walletAddress: string,
  amount: number
): Promise<string> {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error(`[sangpoints] Invalid wallet address: ${walletAddress}`);
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(
      `[sangpoints] Amount must be a positive integer, got: ${amount}`
    );
  }

  const contract = getContract();

  try {
    const tx = await contract.mintPoints(walletAddress, BigInt(amount));
    await tx.wait();
    return tx.hash;
  } catch (err: any) {
    console.error("[sangpoints] mintPoints failed:", err?.message);
    throw new Error(`Blockchain mint failed: ${err?.message}`);
  }
}

export async function getBalance(walletAddress: string): Promise<string> {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error(`[sangpoints] Invalid wallet address: ${walletAddress}`);
  }
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "[sangpoints] CONTRACT_ADDRESS is not set. Add it to your .env.local file."
    );
  }

  const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    SangPointsABI,
    provider
  );

  try {
    const balance = await contract.balanceOf(walletAddress);
    return balance.toString();
  } catch (err: any) {
    console.error("[sangpoints] getBalance failed:", err?.message);
    throw new Error(`Blockchain balance check failed: ${err?.message}`);
  }
}

export async function getTotalSupply(): Promise<string> {
  if (!CONTRACT_ADDRESS) {
    throw new Error("[sangpoints] CONTRACT_ADDRESS is not set.");
  }

  const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, SangPointsABI, provider);

  try {
    const supply = await contract.totalSupply();
    return supply.toString();
  } catch (err: any) {
    console.error("[sangpoints] getTotalSupply failed:", err?.message);
    throw new Error(`Blockchain total supply check failed: ${err?.message}`);
  }
}

export async function getContractOwner(): Promise<string> {
  if (!CONTRACT_ADDRESS) {
    throw new Error("[sangpoints] CONTRACT_ADDRESS is not set.");
  }

  const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, SangPointsABI, provider);

  try {
    return await contract.owner();
  } catch (err: any) {
    console.error("[sangpoints] getContractOwner failed:", err?.message);
    throw new Error(`Blockchain owner check failed: ${err?.message}`);
  }
}

export async function redeemPoints(
  walletAddress: string,
  amount: number
): Promise<string> {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error(`[sangpoints] Invalid wallet address: ${walletAddress}`);
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(
      `[sangpoints] Amount must be a positive integer, got: ${amount}`
    );
  }

  const contract = getContract();

  try {
    const tx = await contract.redeemPoints(walletAddress, BigInt(amount));
    await tx.wait();
    return tx.hash;
  } catch (err: any) {
    console.error("[sangpoints] redeemPoints failed:", err?.message);
    throw new Error(`Blockchain redeem failed: ${err?.message}`);
  }
}
