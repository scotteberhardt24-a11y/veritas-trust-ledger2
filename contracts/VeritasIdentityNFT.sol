// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract VeritasIdentityNFT is ERC721, AccessControl {

    bytes32 public constant ISSUER_ROLE =
        keccak256("ISSUER_ROLE");

    uint256 private nextTokenId;

    mapping(uint256 => string) private tokenURIs;

    constructor()
        ERC721(
            "Veritas Identity",
            "VID"
        )
    {
        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            ISSUER_ROLE,
            msg.sender
        );
    }

    function mintIdentity(
        address to,
        string memory metadataURI
    )
        public
        onlyRole(ISSUER_ROLE)
        returns (uint256)
    {
        nextTokenId++;

        uint256 tokenId = nextTokenId;

        _safeMint(to, tokenId);

        tokenURIs[tokenId] = metadataURI;

        return tokenId;
    }

    function burnIdentity(
        uint256 tokenId
    )
        public
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );

        _burn(tokenId);

        delete tokenURIs[tokenId];
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override
        returns (string memory)
    {
        require(
            _ownerOf(tokenId) != address(0),
            "Token does not exist"
        );

        return tokenURIs[tokenId];
    }

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

        // Allow minting and burning only
        if (
            from != address(0) &&
            to != address(0)
        ) {
            revert("Soulbound: transfers disabled");
        }

        return super._update(
            to,
            tokenId,
            auth
        );
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
