// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockYieldFarm {
    IERC20 public stakingToken;
    
    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _rewards;
    uint256 private _totalSupply;
    
    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }
    
    function deposit(uint256 amount) external {
        require(amount > 0, "Cannot deposit 0");
        
        stakingToken.transferFrom(msg.sender, address(this), amount);
        _balances[msg.sender] += amount;
        _totalSupply += amount;
        
        // Mock reward generation
        _rewards[msg.sender] += amount / 100; // 1% instant reward for testing
    }
    
    function withdraw(uint256 amount) external {
        require(amount > 0, "Cannot withdraw 0");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        
        stakingToken.transfer(msg.sender, amount);
    }
    
    function getReward() external {
        uint256 reward = _rewards[msg.sender];
        if (reward > 0) {
            _rewards[msg.sender] = 0;
            stakingToken.transfer(msg.sender, reward);
        }
    }
    
    function earned(address account) external view returns (uint256) {
        return _rewards[account];
    }
    
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
    
    // Helper function to add rewards for testing
    function addReward(address account, uint256 amount) external {
        _rewards[account] += amount;
    }
}