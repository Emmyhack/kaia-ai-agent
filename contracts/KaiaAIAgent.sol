// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IKaiaSwap {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
}

interface IYieldFarm {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getReward() external;
    function earned(address account) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

contract KaiaAIAgent is Ownable, ReentrancyGuard, Pausable {
    
    // Events
    event TokenSwapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event TokensSent(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount
    );
    
    event YieldFarmDeposit(
        address indexed user,
        address indexed farm,
        uint256 amount
    );
    
    event YieldFarmWithdraw(
        address indexed user,
        address indexed farm,
        uint256 amount
    );
    
    event BalanceChecked(
        address indexed user,
        address indexed token,
        uint256 balance
    );
    
    // State variables
    address public kaiaToken;
    address public swapRouter;
    mapping(address => bool) public authorizedAgents;
    mapping(address => mapping(address => uint256)) public userBalances;
    mapping(address => address[]) public userYieldFarms;
    
    // Fee structure
    uint256 public swapFee = 25; // 0.25% in basis points
    uint256 public constant MAX_FEE = 100; // 1% max fee
    uint256 public constant BASIS_POINTS = 10000;
    
    constructor(
        address _kaiaToken,
        address _swapRouter
    ) Ownable(msg.sender) {
        kaiaToken = _kaiaToken;
        swapRouter = _swapRouter;
        authorizedAgents[msg.sender] = true;
    }
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }
    
    // Agent management
    function addAuthorizedAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = true;
    }
    
    function removeAuthorizedAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = false;
    }
    
    // Token swap functionality
    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external onlyAuthorizedAgent nonReentrant whenNotPaused returns (uint256) {
        require(tokenIn != address(0) && tokenOut != address(0), "Invalid token addresses");
        require(amountIn > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");
        
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Calculate fee
        uint256 feeAmount = (amountIn * swapFee) / BASIS_POINTS;
        uint256 swapAmount = amountIn - feeAmount;
        
        // Approve router
        IERC20(tokenIn).approve(swapRouter, swapAmount);
        
        // Prepare swap path
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        // Execute swap
        uint[] memory amounts = IKaiaSwap(swapRouter).swapExactTokensForTokens(
            swapAmount,
            minAmountOut,
            path,
            recipient,
            block.timestamp + 300
        );
        
        emit TokenSwapped(recipient, tokenIn, tokenOut, amountIn, amounts[1]);
        return amounts[1];
    }
    
    // Get swap quote
    function getSwapQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 feeAmount) {
        require(tokenIn != address(0) && tokenOut != address(0), "Invalid token addresses");
        require(amountIn > 0, "Amount must be greater than 0");
        
        feeAmount = (amountIn * swapFee) / BASIS_POINTS;
        uint256 swapAmount = amountIn - feeAmount;
        
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        uint[] memory amounts = IKaiaSwap(swapRouter).getAmountsOut(swapAmount, path);
        amountOut = amounts[1];
    }
    
    // Balance checking
    function checkBalance(address user, address token) external view returns (uint256) {
        if (token == address(0)) {
            return user.balance; // Native KAIA balance
        }
        return IERC20(token).balanceOf(user);
    }
    
    function checkMultipleBalances(
        address user,
        address[] calldata tokens
    ) external view returns (uint256[] memory balances) {
        balances = new uint256[](tokens.length);
        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i] == address(0)) {
                balances[i] = user.balance;
            } else {
                balances[i] = IERC20(tokens[i]).balanceOf(user);
            }
        }
    }
    
    // Token sending functionality
    function sendTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyAuthorizedAgent nonReentrant whenNotPaused {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        
        if (token == address(0)) {
            // Send native KAIA
            require(address(this).balance >= amount, "Insufficient balance");
            payable(to).transfer(amount);
        } else {
            // Send ERC20 token
            IERC20(token).transferFrom(msg.sender, to, amount);
        }
        
        emit TokensSent(msg.sender, to, token, amount);
    }
    
    // Yield farming functionality
    function depositToYieldFarm(
        address farmAddress,
        uint256 amount,
        address user
    ) external onlyAuthorizedAgent nonReentrant whenNotPaused {
        require(farmAddress != address(0), "Invalid farm address");
        require(amount > 0, "Amount must be greater than 0");
        require(user != address(0), "Invalid user address");
        
        IYieldFarm farm = IYieldFarm(farmAddress);
        
        // Transfer tokens from user to this contract
        IERC20(kaiaToken).transferFrom(user, address(this), amount);
        
        // Approve and deposit to farm
        IERC20(kaiaToken).approve(farmAddress, amount);
        farm.deposit(amount);
        
        // Track user's farms
        bool farmExists = false;
        for (uint i = 0; i < userYieldFarms[user].length; i++) {
            if (userYieldFarms[user][i] == farmAddress) {
                farmExists = true;
                break;
            }
        }
        if (!farmExists) {
            userYieldFarms[user].push(farmAddress);
        }
        
        emit YieldFarmDeposit(user, farmAddress, amount);
    }
    
    function withdrawFromYieldFarm(
        address farmAddress,
        uint256 amount,
        address user
    ) external onlyAuthorizedAgent nonReentrant whenNotPaused {
        require(farmAddress != address(0), "Invalid farm address");
        require(amount > 0, "Amount must be greater than 0");
        require(user != address(0), "Invalid user address");
        
        IYieldFarm farm = IYieldFarm(farmAddress);
        
        // Withdraw from farm
        farm.withdraw(amount);
        
        // Transfer tokens to user
        IERC20(kaiaToken).transfer(user, amount);
        
        emit YieldFarmWithdraw(user, farmAddress, amount);
    }
    
    function claimFarmRewards(
        address farmAddress,
        address user
    ) external onlyAuthorizedAgent nonReentrant whenNotPaused returns (uint256) {
        require(farmAddress != address(0), "Invalid farm address");
        require(user != address(0), "Invalid user address");
        
        IYieldFarm farm = IYieldFarm(farmAddress);
        
        uint256 rewardsBefore = IERC20(kaiaToken).balanceOf(address(this));
        farm.getReward();
        uint256 rewardsAfter = IERC20(kaiaToken).balanceOf(address(this));
        
        uint256 rewards = rewardsAfter - rewardsBefore;
        if (rewards > 0) {
            IERC20(kaiaToken).transfer(user, rewards);
        }
        
        return rewards;
    }
    
    // Yield analysis functions
    function getYieldFarmInfo(
        address farmAddress,
        address user
    ) external view returns (
        uint256 stakedBalance,
        uint256 earnedRewards,
        uint256 totalStaked
    ) {
        IYieldFarm farm = IYieldFarm(farmAddress);
        stakedBalance = farm.balanceOf(user);
        earnedRewards = farm.earned(user);
        totalStaked = farm.balanceOf(farmAddress); // Total staked in farm
    }
    
    function getUserYieldFarms(address user) external view returns (address[] memory) {
        return userYieldFarms[user];
    }
    
    function getTotalYieldValue(address user) external view returns (uint256 totalValue) {
        address[] memory farms = userYieldFarms[user];
        for (uint i = 0; i < farms.length; i++) {
            IYieldFarm farm = IYieldFarm(farms[i]);
            totalValue += farm.balanceOf(user) + farm.earned(user);
        }
    }
    
    // Administrative functions
    function setSwapFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAX_FEE, "Fee too high");
        swapFee = _fee;
    }
    
    function setSwapRouter(address _router) external onlyOwner {
        require(_router != address(0), "Invalid router address");
        swapRouter = _router;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency functions
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
    
    // Receive function for native KAIA
    receive() external payable {}
    
    fallback() external payable {}
}