const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KaiaAIAgent", function () {
  let kaiaAIAgent;
  let mockKaiaToken;
  let mockSwapRouter;
  let mockYieldFarm;
  let owner;
  let agent;
  let user;
  let recipient;
  let addrs;

  beforeEach(async function () {
    // Get signers
    [owner, agent, user, recipient, ...addrs] = await ethers.getSigners();

    // Deploy mock KAIA token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockKaiaToken = await MockERC20.deploy("KAIA Token", "KAIA", ethers.utils.parseEther("1000000"));
    await mockKaiaToken.deployed();

    // Deploy mock swap router
    const MockSwapRouter = await ethers.getContractFactory("MockSwapRouter");
    mockSwapRouter = await MockSwapRouter.deploy();
    await mockSwapRouter.deployed();

    // Deploy mock yield farm
    const MockYieldFarm = await ethers.getContractFactory("MockYieldFarm");
    mockYieldFarm = await MockYieldFarm.deploy(mockKaiaToken.address);
    await mockYieldFarm.deployed();

    // Deploy KaiaAIAgent
    const KaiaAIAgent = await ethers.getContractFactory("KaiaAIAgent");
    kaiaAIAgent = await KaiaAIAgent.deploy(
      mockKaiaToken.address,
      mockSwapRouter.address
    );
    await kaiaAIAgent.deployed();

    // Setup initial balances
    await mockKaiaToken.transfer(user.address, ethers.utils.parseEther("1000"));
    await mockKaiaToken.transfer(agent.address, ethers.utils.parseEther("1000"));
    await mockKaiaToken.transfer(kaiaAIAgent.address, ethers.utils.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await kaiaAIAgent.owner()).to.equal(owner.address);
    });

    it("Should set the correct KAIA token address", async function () {
      expect(await kaiaAIAgent.kaiaToken()).to.equal(mockKaiaToken.address);
    });

    it("Should set the correct swap router address", async function () {
      expect(await kaiaAIAgent.swapRouter()).to.equal(mockSwapRouter.address);
    });

    it("Should authorize the deployer as an agent", async function () {
      expect(await kaiaAIAgent.authorizedAgents(owner.address)).to.be.true;
    });
  });

  describe("Agent Management", function () {
    it("Should allow owner to add authorized agent", async function () {
      await kaiaAIAgent.addAuthorizedAgent(agent.address);
      expect(await kaiaAIAgent.authorizedAgents(agent.address)).to.be.true;
    });

    it("Should allow owner to remove authorized agent", async function () {
      await kaiaAIAgent.addAuthorizedAgent(agent.address);
      await kaiaAIAgent.removeAuthorizedAgent(agent.address);
      expect(await kaiaAIAgent.authorizedAgents(agent.address)).to.be.false;
    });

    it("Should not allow non-owner to add authorized agent", async function () {
      await expect(
        kaiaAIAgent.connect(user).addAuthorizedAgent(agent.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Balance Checking", function () {
    it("Should check ERC20 token balance correctly", async function () {
      const balance = await kaiaAIAgent.checkBalance(user.address, mockKaiaToken.address);
      expect(balance).to.equal(ethers.utils.parseEther("1000"));
    });

    it("Should check native KAIA balance correctly", async function () {
      const balance = await kaiaAIAgent.checkBalance(user.address, ethers.constants.AddressZero);
      expect(balance).to.equal(await user.getBalance());
    });

    it("Should check multiple balances correctly", async function () {
      const tokens = [mockKaiaToken.address, ethers.constants.AddressZero];
      const balances = await kaiaAIAgent.checkMultipleBalances(user.address, tokens);
      
      expect(balances[0]).to.equal(ethers.utils.parseEther("1000"));
      expect(balances[1]).to.equal(await user.getBalance());
    });
  });

  describe("Token Swapping", function () {
    beforeEach(async function () {
      await kaiaAIAgent.addAuthorizedAgent(agent.address);
      
      // Create another mock token for swapping
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      this.mockTokenB = await MockERC20.deploy("Token B", "TOKB", ethers.utils.parseEther("1000000"));
      await this.mockTokenB.deployed();
      
      // Give tokens to agent for swapping
      await mockKaiaToken.transfer(agent.address, ethers.utils.parseEther("100"));
      await mockKaiaToken.connect(agent).approve(kaiaAIAgent.address, ethers.utils.parseEther("100"));
      
      // Setup mock router to return expected amounts
      await mockSwapRouter.setAmountsOut([ethers.utils.parseEther("10"), ethers.utils.parseEther("9.5")]);
    });

    it("Should perform token swap successfully", async function () {
      const amountIn = ethers.utils.parseEther("10");
      const minAmountOut = ethers.utils.parseEther("9");
      
      await expect(
        kaiaAIAgent.connect(agent).swapTokens(
          mockKaiaToken.address,
          this.mockTokenB.address,
          amountIn,
          minAmountOut,
          recipient.address
        )
      ).to.emit(kaiaAIAgent, "TokenSwapped");
    });

    it("Should get swap quote correctly", async function () {
      const amountIn = ethers.utils.parseEther("10");
      const [amountOut, feeAmount] = await kaiaAIAgent.getSwapQuote(
        mockKaiaToken.address,
        this.mockTokenB.address,
        amountIn
      );
      
      expect(feeAmount).to.equal(amountIn.mul(25).div(10000)); // 0.25% fee
      expect(amountOut).to.equal(ethers.utils.parseEther("9.5"));
    });

    it("Should revert swap with invalid token addresses", async function () {
      await expect(
        kaiaAIAgent.connect(agent).swapTokens(
          ethers.constants.AddressZero,
          this.mockTokenB.address,
          ethers.utils.parseEther("10"),
          ethers.utils.parseEther("9"),
          recipient.address
        )
      ).to.be.revertedWith("Invalid token addresses");
    });

    it("Should revert swap from unauthorized agent", async function () {
      await expect(
        kaiaAIAgent.connect(user).swapTokens(
          mockKaiaToken.address,
          this.mockTokenB.address,
          ethers.utils.parseEther("10"),
          ethers.utils.parseEther("9"),
          recipient.address
        )
      ).to.be.revertedWith("Not authorized agent");
    });
  });

  describe("Token Sending", function () {
    beforeEach(async function () {
      await kaiaAIAgent.addAuthorizedAgent(agent.address);
      await mockKaiaToken.connect(agent).approve(kaiaAIAgent.address, ethers.utils.parseEther("100"));
    });

    it("Should send ERC20 tokens successfully", async function () {
      const amount = ethers.utils.parseEther("10");
      
      await expect(
        kaiaAIAgent.connect(agent).sendTokens(
          mockKaiaToken.address,
          recipient.address,
          amount
        )
      ).to.emit(kaiaAIAgent, "TokensSent")
        .withArgs(agent.address, recipient.address, mockKaiaToken.address, amount);
    });

    it("Should send native KAIA successfully", async function () {
      // Send some KAIA to the contract first
      await owner.sendTransaction({
        to: kaiaAIAgent.address,
        value: ethers.utils.parseEther("1")
      });

      const amount = ethers.utils.parseEther("0.5");
      const initialBalance = await recipient.getBalance();
      
      await kaiaAIAgent.connect(agent).sendTokens(
        ethers.constants.AddressZero,
        recipient.address,
        amount
      );
      
      const finalBalance = await recipient.getBalance();
      expect(finalBalance.sub(initialBalance)).to.equal(amount);
    });

    it("Should revert sending from unauthorized agent", async function () {
      await expect(
        kaiaAIAgent.connect(user).sendTokens(
          mockKaiaToken.address,
          recipient.address,
          ethers.utils.parseEther("10")
        )
      ).to.be.revertedWith("Not authorized agent");
    });
  });

  describe("Yield Farming", function () {
    beforeEach(async function () {
      await kaiaAIAgent.addAuthorizedAgent(agent.address);
      await mockKaiaToken.connect(user).approve(kaiaAIAgent.address, ethers.utils.parseEther("100"));
    });

    it("Should deposit to yield farm successfully", async function () {
      const amount = ethers.utils.parseEther("10");
      
      await expect(
        kaiaAIAgent.connect(agent).depositToYieldFarm(
          mockYieldFarm.address,
          amount,
          user.address
        )
      ).to.emit(kaiaAIAgent, "YieldFarmDeposit")
        .withArgs(user.address, mockYieldFarm.address, amount);
    });

    it("Should withdraw from yield farm successfully", async function () {
      const amount = ethers.utils.parseEther("10");
      
      // First deposit
      await kaiaAIAgent.connect(agent).depositToYieldFarm(
        mockYieldFarm.address,
        amount,
        user.address
      );
      
      // Then withdraw
      await expect(
        kaiaAIAgent.connect(agent).withdrawFromYieldFarm(
          mockYieldFarm.address,
          amount,
          user.address
        )
      ).to.emit(kaiaAIAgent, "YieldFarmWithdraw")
        .withArgs(user.address, mockYieldFarm.address, amount);
    });

    it("Should get yield farm info correctly", async function () {
      const amount = ethers.utils.parseEther("10");
      
      // Deposit first
      await kaiaAIAgent.connect(agent).depositToYieldFarm(
        mockYieldFarm.address,
        amount,
        user.address
      );
      
      const [stakedBalance, earnedRewards, totalStaked] = await kaiaAIAgent.getYieldFarmInfo(
        mockYieldFarm.address,
        user.address
      );
      
      expect(stakedBalance).to.equal(amount);
      expect(earnedRewards).to.equal(0); // No rewards initially
    });

    it("Should track user yield farms", async function () {
      const amount = ethers.utils.parseEther("10");
      
      await kaiaAIAgent.connect(agent).depositToYieldFarm(
        mockYieldFarm.address,
        amount,
        user.address
      );
      
      const userFarms = await kaiaAIAgent.getUserYieldFarms(user.address);
      expect(userFarms).to.include(mockYieldFarm.address);
    });
  });

  describe("Administrative Functions", function () {
    it("Should allow owner to set swap fee", async function () {
      const newFee = 50; // 0.5%
      await kaiaAIAgent.setSwapFee(newFee);
      expect(await kaiaAIAgent.swapFee()).to.equal(newFee);
    });

    it("Should not allow setting fee above maximum", async function () {
      const highFee = 200; // 2% (above 1% max)
      await expect(
        kaiaAIAgent.setSwapFee(highFee)
      ).to.be.revertedWith("Fee too high");
    });

    it("Should allow owner to pause contract", async function () {
      await kaiaAIAgent.pause();
      expect(await kaiaAIAgent.paused()).to.be.true;
    });

    it("Should allow owner to unpause contract", async function () {
      await kaiaAIAgent.pause();
      await kaiaAIAgent.unpause();
      expect(await kaiaAIAgent.paused()).to.be.false;
    });

    it("Should prevent operations when paused", async function () {
      await kaiaAIAgent.addAuthorizedAgent(agent.address);
      await kaiaAIAgent.pause();
      
      await expect(
        kaiaAIAgent.connect(agent).sendTokens(
          mockKaiaToken.address,
          recipient.address,
          ethers.utils.parseEther("10")
        )
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency withdraw tokens", async function () {
      const amount = ethers.utils.parseEther("10");
      const initialBalance = await mockKaiaToken.balanceOf(owner.address);
      
      await kaiaAIAgent.emergencyWithdraw(mockKaiaToken.address, amount);
      
      const finalBalance = await mockKaiaToken.balanceOf(owner.address);
      expect(finalBalance.sub(initialBalance)).to.equal(amount);
    });

    it("Should allow owner to emergency withdraw native KAIA", async function () {
      // Send some KAIA to contract
      await owner.sendTransaction({
        to: kaiaAIAgent.address,
        value: ethers.utils.parseEther("1")
      });
      
      const amount = ethers.utils.parseEther("0.5");
      const initialBalance = await owner.getBalance();
      
      const tx = await kaiaAIAgent.emergencyWithdraw(ethers.constants.AddressZero, amount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      
      const finalBalance = await owner.getBalance();
      expect(finalBalance.add(gasUsed).sub(initialBalance)).to.equal(amount);
    });

    it("Should not allow non-owner to emergency withdraw", async function () {
      await expect(
        kaiaAIAgent.connect(user).emergencyWithdraw(
          mockKaiaToken.address,
          ethers.utils.parseEther("10")
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Receive and Fallback", function () {
    it("Should receive native KAIA", async function () {
      const amount = ethers.utils.parseEther("1");
      const initialBalance = await ethers.provider.getBalance(kaiaAIAgent.address);
      
      await owner.sendTransaction({
        to: kaiaAIAgent.address,
        value: amount
      });
      
      const finalBalance = await ethers.provider.getBalance(kaiaAIAgent.address);
      expect(finalBalance.sub(initialBalance)).to.equal(amount);
    });
  });
});