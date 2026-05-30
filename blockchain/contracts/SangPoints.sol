// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SangPoints
 * @notice Loyalty token for SangSangai trekking safety app.
 *         Only the contract owner (backend server wallet) can mint or redeem points.
 *         Points are NOT transferable — they are a reputation ledger, not a tradeable token.
 * @dev Deployed on Polygon Amoy testnet.
 */
contract SangPoints {
    // ─── State ───────────────────────────────────────────────────────────────
    string public constant name     = "SangPoints";
    string public constant symbol   = "SANG";
    uint8  public constant decimals = 0; // whole points only

    address public owner;
    uint256 public totalSupply;

    mapping(address => uint256) private _balances;

    // ─── Events ──────────────────────────────────────────────────────────────
    event PointsMinted(address indexed to,   uint256 amount, uint256 newBalance);
    event PointsRedeemed(address indexed from, uint256 amount, uint256 newBalance);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "SangPoints: caller is not owner");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ─── Owner functions ─────────────────────────────────────────────────────

    /**
     * @notice Mint SangPoints to a Nepali guide wallet.
     *         Called by the backend when a trip is completed safely.
     * @param to     The Nepali guide's wallet address.
     * @param amount Number of SangPoints to award (e.g. 200 per trip).
     */
    function mintPoints(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "SangPoints: mint to zero address");
        require(amount > 0,       "SangPoints: amount must be > 0");

        _balances[to] += amount;
        totalSupply    += amount;

        emit PointsMinted(to, amount, _balances[to]);
    }

    /**
     * @notice Redeem (burn) SangPoints from a wallet.
     *         For future use — e.g. redeeming for rewards.
     * @param from   The wallet to deduct from.
     * @param amount Number of SangPoints to redeem.
     */
    function redeemPoints(address from, uint256 amount) external onlyOwner {
        require(from != address(0), "SangPoints: redeem from zero address");
        require(amount > 0,         "SangPoints: amount must be > 0");
        require(_balances[from] >= amount, "SangPoints: insufficient balance");

        _balances[from] -= amount;
        totalSupply      -= amount;

        emit PointsRedeemed(from, amount, _balances[from]);
    }

    // ─── View functions ──────────────────────────────────────────────────────

    /**
     * @notice Returns live SangPoints balance of any wallet.
     */
    function balanceOf(address wallet) external view returns (uint256) {
        return _balances[wallet];
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    /**
     * @notice Transfer contract ownership to a new server wallet.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SangPoints: new owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
