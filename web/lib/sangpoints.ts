import { ethers } from "ethers";

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function totalSupply() view returns (uint256)",
];

let provider: ethers.JsonRpcProvider | null = null;
let signer: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

function getContract() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  if (!signer && PRIVATE_KEY) {
    signer = new ethers.Wallet(PRIVATE_KEY, provider);
  }
  if (!contract && signer) {
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }
  return contract;
}

export async function mintPoints(
  walletAddress: string,
  amount: number
): Promise<string> {
  const c = getContract();
  if (!c) throw new Error("Blockchain not configured");

  const tx = await c.mint(walletAddress, ethers.parseUnits(amount.toString(), 18));
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function getBalance(
  walletAddress: string
): Promise<number> {
  const c = getContract();
  if (!c) return 0;

  const balance = await c.balanceOf(walletAddress);
  return Number(ethers.formatUnits(balance, 18));
}
