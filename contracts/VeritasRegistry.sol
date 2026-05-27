// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VeritasRegistry is Ownable {

    address public identityContract;

    address public reputationContract;

    address public attestationContract;

    address public escrowContract;

    event ContractUpdated(
        string indexed contractName,
        address indexed contractAddress
    );

    constructor(address initialOwner)
        Ownable(initialOwner)
    {}

    function setIdentityContract(
        address contractAddress
    ) external onlyOwner {
        identityContract =
            contractAddress;

        emit ContractUpdated(
            "IDENTITY",
            contractAddress
        );
    }

    function setReputationContract(
        address contractAddress
    ) external onlyOwner {
        reputationContract =
            contractAddress;

        emit ContractUpdated(
            "REPUTATION",
            contractAddress
        );
    }

    function setAttestationContract(
        address contractAddress
    ) external onlyOwner {
        attestationContract =
            contractAddress;

        emit ContractUpdated(
            "ATTESTATION",
            contractAddress
        );
    }

    function setEscrowContract(
        address contractAddress
    ) external onlyOwner {
        escrowContract =
            contractAddress;

        emit ContractUpdated(
            "ESCROW",
            contractAddress
        );
    }
}
