/**
 * lib/sangpoints.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SangSangai blockchain bridge — Polygon Amoy testnet
 *
 * This file is the ONLY blockchain interface the Next.js backend needs.
 * Import any of the three exported functions in your route handlers:
 *
 *   import { mintPoints, getBalance, redeemPoints } from "@/lib/sangpoints";
 *
 * Required environment variables (add to .env.local and Vercel settings):
 *   PRIVATE_KEY        — server wallet private key (no 0x prefix needed)
 *   CONTRACT_ADDRESS   — deployed SangPoints contract address on Amoy
 *   AMOY_RPC_URL       — (optional) defaults to public Amoy RPC
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ethers } from "ethers";
import SangPointsABI from "./SangPointsABI.json" assert { type: "json" };

// ── Constants ────────────────────────────────────────────────────────────────
const AMOY_RPC_URL =
  process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY      = process.env.PRIVATE_KEY;

// ── Singleton provider + signer (reused across calls) ────────────────────────
let _provider = null;
let _signer   = null;
let _contract = null;

function getContract() {
  if (_contract) return _contract;

  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "[sangpoints] CONTRACT_ADDRESS is not set. " +
      "Add it to your .env.local file."
    );
  }
  if (!PRIVATE_KEY) {
    throw new Error(
      "[sangpoints] PRIVATE_KEY is not set. " +
      "Add it to your .env.local file."
    );
  }

  _provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
  _signer   = new ethers.Wallet(PRIVATE_KEY, _provider);
  _contract = new ethers.Contract(CONTRACT_ADDRESS, SangPointsABI, _signer);

  return _contract;
}

// ─────────────────────────────────────────────────────────────────────────────
// mintPoints
// Called by: PUT /api/matches/[id]/complete (trip completion)
// Awards 200 SangPoints to the Nepali guide's wallet.
//
// @param {string} walletAddress  — guide's Polygon wallet address
// @param {number} amount         — points to award (usually 200)
// @returns {Promise<string>}     — transaction hash (save this to the DB!)
// ─────────────────────────────────────────────────────────────────────────────
export async function mintPoints(walletAddress, amount) {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error(`[sangpoints] Invalid wallet address: ${walletAddress}`);
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`[sangpoints] Amount must be a positive integer, got: ${amount}`);
  }

  const contract = getContract();

  try {
    const tx = await contract.mintPoints(walletAddress, BigInt(amount));
    const receipt = await tx.wait(); // wait for 1 confirmation

    console.log(
      `[sangpoints] ✅ Minted ${amount} SANG → ${walletAddress} | tx: ${tx.hash}`
    );

    return tx.hash;
  } catch (err) {
    console.error("[sangpoints] mintPoints failed:", err.message);
    throw new Error(`Blockchain mint failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getBalance
// Called by: GET /api/users/me/sangpoints
// Returns the live on-chain SangPoints balance for a wallet.
//
// @param {string} walletAddress  — any Polygon wallet address
// @returns {Promise<string>}     — balance as a string (e.g. "200")
// ─────────────────────────────────────────────────────────────────────────────
export async function getBalance(walletAddress) {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error(`[sangpoints] Invalid wallet address: ${walletAddress}`);
  }

  // Read-only: use provider directly (no signer needed)
  const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    SangPointsABI,
    provider
  );

  try {
    const balance = await contract.balanceOf(walletAddress);
    return balance.toString(); // e.g. "200"
  } catch (err) {
    console.error("[sangpoints] getBalance failed:", err.message);
    throw new Error(`Blockchain balance check failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// redeemPoints
// For future use — redeem points for rewards.
//
// @param {string} walletAddress  — guide's wallet address
// @param {number} amount         — points to redeem
// @returns {Promise<string>}     — transaction hash
// ─────────────────────────────────────────────────────────────────────────────
export async function redeemPoints(walletAddress, amount) {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error(`[sangpoints] Invalid wallet address: ${walletAddress}`);
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`[sangpoints] Amount must be a positive integer, got: ${amount}`);
  }

  const contract = getContract();

  try {
    const tx = await contract.redeemPoints(walletAddress, BigInt(amount));
    await tx.wait();

    console.log(
      `[sangpoints] 🔥 Redeemed ${amount} SANG from ${walletAddress} | tx: ${tx.hash}`
    );

    return tx.hash;
  } catch (err) {
    console.error("[sangpoints] redeemPoints failed:", err.message);
    throw new Error(`Blockchain redeem failed: ${err.message}`);
  }
}
