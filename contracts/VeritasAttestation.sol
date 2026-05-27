// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IIdentityLookup {
    function getIdentityId(
        address user
    )
        external
        view
        returns (uint256);
}

contract VeritasAttestation is
    AccessControl
{
    bytes32 public constant
        ISSUER_ROLE =
        keccak256("ISSUER_ROLE");

    enum AttestationType {
        KYC,
        SKILL,
        EMPLOYMENT,
        LICENSE,
        VERIFIED_BUILDER
    }

    struct Attestation {
        uint256 identityId;
        AttestationType attestationType;
        string metadataURI;
        address issuer;
        uint256 issuedAt;
    }

    IIdentityLookup
        public identityContract;

    uint256 public nextAttestationId;

    mapping(uint256 => Attestation)
        public attestations;

    event AttestationCreated(
        uint256 indexed attestationId,
        uint256 indexed identityId,
        address indexed issuer
    );

    constructor(
        address identityAddress
    ) {
        identityContract =
            IIdentityLookup(
                identityAddress
            );

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            ISSUER_ROLE,
            msg.sender
        );
    }

    function createAttestation(
        address user,
        AttestationType attestationType,
        string memory metadataURI
    )
        external
        onlyRole(ISSUER_ROLE)
    {
        uint256 identityId =
            identityContract
                .getIdentityId(user);

        require(
            identityId != 0,
            "Identity does not exist"
        );

        nextAttestationId++;

        attestations[
            nextAttestationId
        ] = Attestation({
            identityId: identityId,
            attestationType:
                attestationType,
            metadataURI:
                metadataURI,
            issuer: msg.sender,
            issuedAt:
                block.timestamp
        });

        emit AttestationCreated(
            nextAttestationId,
            identityId,
            msg.sender
        );
    }
}
