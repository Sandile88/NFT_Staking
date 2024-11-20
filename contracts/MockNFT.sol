// SPDX-License-Identifier: MIT LICENSE
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract MockNFT is ERC721Enumerable, Ownable {
    constructor() ERC721("MockNFT", "MNFT") Ownable(msg.sender) {}

    function mint(address to, uint256 tokenId) public onlyOwner {
        // require(!_exists(tokenId), "Token already minted!");
        _mint(to, tokenId);

    } 


}