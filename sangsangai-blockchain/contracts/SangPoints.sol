// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SangPoints
 * @notice Reward token for Nepali trekking guides on the SangSangai platform.
 *         Minted by the backend (owner wallet) upon safe trip completion.
 *         Deployed on Polygon Amoy testnet.
 */
contract SangPoints is ERC20, Ownable {
    // ── Events ──────────────────────────────────────────────────────────────
    event PointsMinted(address indexed to, uint256 amount, string tripId);
    event PointsRedeemed(address indexed from, uint256 amount, string reason);

    // ── Constructor ──────────────────────────────────────────────────────────
    constructor(address initialOwner)
        ERC20("SangPoints", "SANG")
        Ownable(initialOwner)
    {}

    // ── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Mint SangPoints to a Nepali guide upon trip completion.
     * @param to        Guide's wallet address
     * @param amount    Number of points (18 decimals — use 200 * 10**18 for 200 points)
     * @param tripId    Off-chain trip ID for traceability
     */
    function mint(
        address to,
        uint256 amount,
        string calldata tripId
    ) external onlyOwner {
        _mint(to, amount);
        emit PointsMinted(to, amount, tripId);
    }

    /**
     * @notice Burn SangPoints from a guide's wallet (for future redemption feature).
     * @param from      Guide's wallet address
     * @param amount    Number of points to burn
     * @param reason    Reason for redemption
     */
    function burn(
        address from,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        _burn(from, amount);
        emit PointsRedeemed(from, amount, reason);
    }

    /**
     * @notice Get SangPoints balance for a wallet.
     * @param account   Wallet address to query
     * @return          Balance in base units (divide by 10**18 for display)
     */
    function getBalance(address account) external view returns (uint256) {
        return balanceOf(account);
    }

    // SangPoints are non-transferable between users — only mint/burn by owner
    function transfer(address, uint256) public pure override returns (bool) {
        revert("SangPoints: non-transferable");
    }

    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("SangPoints: non-transferable");
    }
}
