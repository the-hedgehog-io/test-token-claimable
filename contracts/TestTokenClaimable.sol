// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error ClaimTimeout();
error CallerIsNotOwner();
error Timeout();

contract TestTokenClaimable is ERC20, Ownable {
    uint256 public claimAmount;
    uint256 public timeout;

    mapping(address => uint256) public userClaimTime;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        _mint(address(this), 100000000000 * 10 ** decimals());
    }

    function claim() external {
        if (userClaimTime[msg.sender] + timeout >= block.timestamp) {
            revert ClaimTimeout();
        }
        userClaimTime[msg.sender] = block.timestamp;
        _transfer(address(this), msg.sender, claimAmount);
    }

    function setClaimAmount(uint256 _amount) external onlyOwner {
        claimAmount = _amount;
    }

    function mint(uint256 _amount) external onlyOwner {
        _mint(address(this), _amount);
    }

    function setTimeOut(uint256 _newTimeout) external onlyOwner {
        timeout = _newTimeout;
    }
}
