// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract VeritasIdentityNFT is ERC721, AccessControl {
    uint256 public nextTokenId;

    bytes32 public constant VERIFIER_ROLE =
        keccak256("VERIFIER_ROLE");

    enum VerificationLevel {
        NONE,
        BASIC,
        KYC,
        BUSINESS,
        ESCROW_TRUSTED
    }

    struct IdentityData {
        string metadataURI;
        VerificationLevel level;
        uint256 createdAt;
    }

    mapping(uint256 => IdentityData) public identityData;
    mapping(address => bool) public hasIdentity;

    constructor() ERC721("Veritas Identity", "VID") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    // ---------------------------
    // MINT (VERIFIER ONLY)
    // ---------------------------
    function mint(address to, string memory metadataURI)
        public
        onlyRole(VERIFIER_ROLE)
    {
        require(!hasIdentity[to], "User already has identity NFT");

        uint256 tokenId = nextTokenId;

        _safeMint(to, tokenId);

        identityData[tokenId] = IdentityData({
            metadataURI: metadataURI,
            level: VerificationLevel.NONE,
            createdAt: block.timestamp
        });

        hasIdentity[to] = true;
        nextTokenId++;
    }

    // ---------------------------
    // SET VERIFICATION LEVEL
    // ---------------------------
    function setVerificationLevel(
        uint256 tokenId,
        VerificationLevel level
    )
        public
        onlyRole(VERIFIER_ROLE)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        identityData[tokenId].level = level;
    }

    // ---------------------------
    // READ TOKEN URI
    // ---------------------------
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return identityData[tokenId].metadataURI;
    }

    // ---------------------------
    // GET VERIFICATION LEVEL
    // ---------------------------
    function getVerificationLevel(uint256 tokenId)
        public
        view
        returns (VerificationLevel)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return identityData[tokenId].level;
    }

    // ---------------------------
    // SOULBOUND ENFORCEMENT
    // ---------------------------
    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);

        // allow mint only
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }

        revert("Identity NFT is soulbound");
    }

    // ---------------------------
    // FIX: supportsInterface override (CRITICAL)
    // ---------------------------
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }
}