// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IIdentityContract {
    function getIdentityId(
        address user
    )
        external
        view
        returns (uint256);
}

contract VeritasReputation is
    AccessControl
{
    bytes32 public constant
        REPUTATION_MANAGER_ROLE =
        keccak256(
            "REPUTATION_MANAGER_ROLE"
        );

    IIdentityContract
        public identityContract;

    mapping(uint256 => int256)
        public reputation;

    event ReputationChanged(
        uint256 indexed identityId,
        int256 amount,
        int256 newScore
    );

    constructor(
        address identityAddress
    ) {
        identityContract =
            IIdentityContract(
                identityAddress
            );

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            REPUTATION_MANAGER_ROLE,
            msg.sender
        );
    }

    function addReputation(
        address user,
        int256 amount
    )
        external
        onlyRole(
            REPUTATION_MANAGER_ROLE
        )
    {
        uint256 identityId =
            identityContract
                .getIdentityId(user);

        require(
            identityId != 0,
            "No identity NFT"
        );

        reputation[identityId] +=
            amount;

        emit ReputationChanged(
            identityId,
            amount,
            reputation[identityId]
        );
    }

    function getReputation(
        address user
    )
        external
        view
        returns (int256)
    {
        uint256 identityId =
            identityContract
                .getIdentityId(user);

        return reputation[
            identityId
        ];
    }
}
