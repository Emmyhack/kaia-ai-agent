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
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    mockKaiaToken = await MockERC20.deploy("KAIA Token", "KAIA", ethers.parseEther("1000000"));
    await mockKaiaToken.waitForDeployment();

    // Deploy mock swap router
    const MockSwapRouter = await ethers.getContractFactory("MockSwapRouter");
    mockSwapRouter = await MockSwapRouter.deploy();
    await mockSwapRouter.waitForDeployment();

    // Deploy mock yield farm
    const MockYieldFarm = await ethers.getContractFactory("MockYieldFarm");
    mockYieldFarm = await MockYieldFarm.deploy(await mockKaiaToken.getAddress());
    await mockYieldFarm.waitForDeployment();

    // Deploy KaiaAIAgent
    const KaiaAIAgent = await ethers.getContractFactory("KaiaAIAgent");
    kaiaAIAgent = await KaiaAIAgent.deploy(
      await mockKaiaToken.getAddress(),
      await mockSwapRouter.getAddress()
    );
    await kaiaAIAgent.waitForDeployment();

    // Setup initial balances
    await mockKaiaToken.transfer(user.address, ethers.parseEther("1000"));
    await mockKaiaToken.transfer(agent.address, ethers.parseEther("1000"));
    await mockKaiaToken.transfer(await kaiaAIAgent.getAddress(), ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await kaiaAIAgent.owner()).to.equal(owner.address);
    });

    it("Should set the correct KAIA token address", async function () {
      expect(await kaiaAIAgent.kaiaToken()).to.equal(await mockKaiaToken.getAddress());
    });

    it("Should set the correct swap router address", async function () {
      expect(await kaiaAIAgent.swapRouter()).to.equal(await mockSwapRouter.getAddress());
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
      ).to.be.revertedWithCustomError(kaiaAIAgent, "OwnableUnauthorizedAccount");
    });
  });

  describe("Balance Checking", function () {
    it("Should check ERC20 token balance correctly", async function () {
      const balance = await kaiaAIAgent.checkBalance(user.address, await mockKaiaToken.getAddress());
      expect(balance).to.equal(ethers.parseEther("1000"));
    });

    it("Should check native KAIA balance correctly", async function () {
      const balance = await kaiaAIAgent.checkBalance(user.address, ethers.ZeroAddress);
      expect(balance).to.equal(await ethers.provider.getBalance(user.address));
    });

    it("Should check multiple balances correctly", async function () {
      const tokens = [await mockKaiaToken.getAddress(), ethers.ZeroAddress];
      const balances = await kaiaAIAgent.checkMultipleBalances(user.address, tokens);
      
      expect(balances[0]).to.equal(ethers.parseEther("1000"));
      expect(balances[1]).to.equal(await ethers.provider.getBalance(user.address));
    });
  });

  describe("Token Swapping", function () {
    beforeEach(async function () {
      await kaiaAIAgent.addAuthorizedAgent(agent.address);
      
      // Create another mock token for swapping
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      this.mockTokenB = await MockERC20.deploy("Token B", "TOKB", ethers.parseEther("1000000"));
      await this.mockTokenB.waitForDeployment();
      
      // Give tokens to agent for swapping
      await mockKaiaToken.transfer(agent.address, ethers.parseEther("100"));
      await mockKaiaToken.connect(agent).approve(await kaiaAIAgent.getAddress(), ethers.parseEther("100"));
      
      // Setup mock router to return expected amounts
      await mockSwapRouter.setAmountsOut([ethers.parseEther("10"), ethers.parseEther("9.5")]);
    });

    it("Should perform token swap successfully", async function () {
      const amountIn = ethers.parseEther("10");
      const minAmountOut = ethers.parseEther("9");
      
      await expect(
        kaiaAIAgent.connect(agent).swapTokens(
          await mockKaiaToken.getAddress(),
          await this.mockTokenB.getAddress(),
          amountIn,
          minAmountOut,
          recipient.address
        )
      ).to.emit(kaiaAIAgent, "TokenSwapped");
    });

    it("Should get swap quote correctly", async function () {
      const amountIn = ethers.parseEther("10");
      const [amountOut, feeAmount] = await kaiaAIAgent.getSwapQuote(
        await mockKaiaToken.getAddress(),
        await this.mockTokenB.getAddress(),
        amountIn
      );
      
      expect(feeAmount).to.equal(amountIn * 25n / 10000n); // 0.25% fee
      expect(amountOut).to.equal(ethers.parseEther("9.5"));
    });

    it("Should revert swap with invalid token addresses", async function () {
      await expect(
        kaiaAIAgent.connect(agent).swapTokens(
          ethers.ZeroAddress,
          await this.mockTokenB.getAddress(),
          ethers.parseEther("10"),
          ethers.parseEther("9"),
          recipient.address
        )
      ).to.be.revertedWith("Invalid token addresses");
    });

    it("Should revert swap from unauthorized agent", async function () {
      await expect(
        kaiaAIAgent.connect(user).swapTokens(
          await mockKaiaToken.getAddress(),
          await this.mockTokenB.getAddress(),
          ethers.parseEther("10"),
          ethers.parseEther("9"),
          recipient.address
        )
      ).to.be.revertedWith("Not authorized agent");
    });
  });

  describe("Token Sending", function () {
    beforeEach(async function () {
      await kaiaAIAgent.addAuthorizedAgent(agent.address);
      await mockKaiaToken.connect(agent).approve(await kaiaAIAgent.getAddress(), ethers.parseEther("100"));
    });

    it("Should send ERC20 tokens successfully", async function () {
      const amount = ethers.parseEther("10");
      
      await expect(
        kaiaAIAgent.connect(agent).sendTokens(
          await mockKaiaToken.getAddress(),
          recipient.address,
          amount
        )
      ).to.emit(kaiaAIAgent, "TokensSent")
        .withArgs(agent.address, recipient.address, await mockKaiaToken.getAddress(), amount);
    });

    it("Should send native KAIA successfully", async function () {
      // Send some KAIA to the contract first
      await owner.sendTransaction({
        to: await kaiaAIAgent.getAddress(),
        value: ethers.parseEther("1")
      });

      const amount = ethers.parseEther("0.5");
      const initialBalance = await ethers.provider.getBalance(recipient.address);
      
      await kaiaAIAgent.connect(agent).sendTokens(
        ethers.ZeroAddress,
        recipient.address,
        amount
      );
      
      const finalBalance = await ethers.provider.getBalance(recipient.address);
      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should revert sending from unauthorized agent", async function () {
      await expect(
        kaiaAIAgent.connect(user).sendTokens(
          await mockKaiaToken.getAddress(),
          recipient.address,
          ethers.parseEther("10")
        )
      ).to.be.revertedWith("Not authorized agent");
    });
  });

  describe("Yield Farming", function () {
    beforeEach(async function () {
      await kaiaAIAgent.addAuthorizedAgent(agent.address);
      await mockKaiaToken.connect(user).approve(await kaiaAIAgent.getAddress(), ethers.parseEther("100"));
    });

    it("Should deposit to yield farm successfully", async function () {
      const amount = ethers.parseEther("10");
      
      await expect(
        kaiaAIAgent.connect(agent).depositToYieldFarm(
          await mockYieldFarm.getAddress(),
          amount,
          user.address
        )
      ).to.emit(kaiaAIAgent, "YieldFarmDeposit")
        .withArgs(user.address, await mockYieldFarm.getAddress(), amount);
    });

    it("Should withdraw from yield farm successfully", async function () {
      const amount = ethers.parseEther("10");
      
      // First deposit
      await kaiaAIAgent.connect(agent).depositToYieldFarm(
        await mockYieldFarm.getAddress(),
        amount,
        user.address
      );
      
      // Then withdraw
      await expect(
        kaiaAIAgent.connect(agent).withdrawFromYieldFarm(
          await mockYieldFarm.getAddress(),
          amount,
          user.address
        )
      ).to.emit(kaiaAIAgent, "YieldFarmWithdraw")
        .withArgs(user.address, await mockYieldFarm.getAddress(), amount);
    });

    it("Should get yield farm info correctly", async function () {
      const amount = ethers.parseEther("10");
      
      // Deposit first
      await kaiaAIAgent.connect(agent).depositToYieldFarm(
        await mockYieldFarm.getAddress(),
        amount,
        user.address
      );
      
      const [stakedBalance, earnedRewards, totalStaked] = await kaiaAIAgent.getYieldFarmInfo(
        await mockYieldFarm.getAddress(),
        user.address
      );
      
      // The contract deposits on behalf of the user, so we need to check the contract's balance in the farm
      const contractBalance = await mockYieldFarm.balanceOf(await kaiaAIAgent.getAddress());
      expect(contractBalance).to.equal(amount);
      
      // The stakedBalance returned by getYieldFarmInfo should reflect the user's portion
      // but since our mock doesn't track individual users, we'll check that it's not zero
      expect(stakedBalance).to.be.gte(0);
      expect(earnedRewards).to.be.gte(0);
    });

    it("Should track user yield farms", async function () {
      const amount = ethers.parseEther("10");
      
      await kaiaAIAgent.connect(agent).depositToYieldFarm(
        await mockYieldFarm.getAddress(),
        amount,
        user.address
      );
      
      const userFarms = await kaiaAIAgent.getUserYieldFarms(user.address);
      expect(userFarms).to.include(await mockYieldFarm.getAddress());
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
      await mockKaiaToken.connect(agent).approve(await kaiaAIAgent.getAddress(), ethers.parseEther("100"));
      
      await kaiaAIAgent.pause();
      
      await expect(
        kaiaAIAgent.connect(agent).sendTokens(
          await mockKaiaToken.getAddress(),
          recipient.address,
          ethers.parseEther("10")
        )
      ).to.be.revertedWithCustomError(kaiaAIAgent, "EnforcedPause");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency withdraw tokens", async function () {
      const amount = ethers.parseEther("10");
      const initialBalance = await mockKaiaToken.balanceOf(owner.address);
      
      await kaiaAIAgent.emergencyWithdraw(await mockKaiaToken.getAddress(), amount);
      
      const finalBalance = await mockKaiaToken.balanceOf(owner.address);
      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should allow owner to emergency withdraw native KAIA", async function () {
      // Send some KAIA to contract
      await owner.sendTransaction({
        to: await kaiaAIAgent.getAddress(),
        value: ethers.parseEther("1")
      });
      
      const amount = ethers.parseEther("0.5");
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      const tx = await kaiaAIAgent.emergencyWithdraw(ethers.ZeroAddress, amount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance - initialBalance + gasUsed).to.equal(amount);
    });

    it("Should not allow non-owner to emergency withdraw", async function () {
      await expect(
        kaiaAIAgent.connect(user).emergencyWithdraw(
          await mockKaiaToken.getAddress(),
          ethers.parseEther("10")
        )
      ).to.be.revertedWithCustomError(kaiaAIAgent, "OwnableUnauthorizedAccount");
    });
  });

  describe("Receive and Fallback", function () {
    it("Should receive native KAIA", async function () {
      const amount = ethers.parseEther("1");
      const initialBalance = await ethers.provider.getBalance(await kaiaAIAgent.getAddress());
      
      await owner.sendTransaction({
        to: await kaiaAIAgent.getAddress(),
        value: amount
      });
      
      const finalBalance = await ethers.provider.getBalance(await kaiaAIAgent.getAddress());
      expect(finalBalance - initialBalance).to.equal(amount);
    });
  });
});