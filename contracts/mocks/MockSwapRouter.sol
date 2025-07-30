// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC20.sol";

contract MockSwapRouter {
    uint[] private _amountsOut;
    
    function setAmountsOut(uint[] memory amounts) external {
        _amountsOut = amounts;
    }
    
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(deadline >= block.timestamp, "Expired");
        require(path.length >= 2, "Invalid path");
        
        // Transfer input token from sender
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        
        // Mock the swap by minting output tokens to recipient
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        
        if (_amountsOut.length > 0) {
            amounts[1] = _amountsOut[1];
        } else {
            amounts[1] = (amountIn * 95) / 100; // 5% slippage
        }
        
        require(amounts[1] >= amountOutMin, "Insufficient output amount");
        
        // For testing, we'll mint tokens to the recipient
        // In real implementation, this would be handled by the DEX
        MockERC20(path[1]).mint(to, amounts[1]);
        
        return amounts;
    }
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts) {
        require(path.length >= 2, "Invalid path");
        
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        
        if (_amountsOut.length > 0) {
            amounts[1] = _amountsOut[1];
        } else {
            amounts[1] = (amountIn * 95) / 100; // 5% slippage
        }
        
        return amounts;
    }
}