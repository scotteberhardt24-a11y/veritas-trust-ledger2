// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is
    ERC20,
    Ownable
{
    uint8 private constant TOKEN_DECIMALS = 6;

    constructor()
        ERC20(
            "Mock USDC",
            "mUSDC"
        )
        Ownable(msg.sender)
    {
        _mint(
            msg.sender,
            1_000_000 * 10 ** TOKEN_DECIMALS
        );
    }

    function decimals()
        public
        pure
        override
        returns (uint8)
    {
        return TOKEN_DECIMALS;
    }

    function mint(
        address to,
        uint256 amount
    )
        external
        onlyOwner
    {
        _mint(to, amount);
    }
}
