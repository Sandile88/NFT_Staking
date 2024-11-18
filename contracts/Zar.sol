// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Zar is Ownable, ERC20 {

    constructor () ERC20("Zar Token", "Zar") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
}

}