// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract ZAR is ERC20, Ownable {
    address public stakingContract; 
    constructor () ERC20("Zar Token", "Zar") Ownable(msg.sender) {}

    function setStakingContract(address _stakingContract) external onlyOwner {
        stakingContract = _stakingContract;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == owner() || msg.sender == stakingContract, "Not authorized to mint");
        _mint(to, amount);
    }

}